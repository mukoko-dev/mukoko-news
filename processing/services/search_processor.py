"""
Semantic search processor — replaces backend/services/AISearchService.ts.

Uses Vectorize (via FFI) for vector search and Anthropic Claude for
AI insights, replacing:
  - Workers AI embedding per query (llama-3.1-8b for trending)
  - SQL LIKE fallback with no ranking
  - AI-only trending topics

TS counterpart: AISearchService.ts (334 lines)
"""

from services.ai_client import AnthropicClient, get_embedding


async def semantic_search(query: str, options: dict = None, env=None) -> dict:
    """
    Perform semantic search using Vectorize + D1.

    Args:
        query: Search query string
        options: {
            "limit": int,
            "category": str,
            "source": str,
            "date_from": str,
            "date_to": str,
            "include_insights": bool,
        }
        env: Cloudflare bindings (AI, VECTORIZE_INDEX, EDGE_CACHE_DB)

    Returns:
        {
            "results": [{"id", "title", "description", "source", "category", "score", ...}],
            "insights": [{"type", "content", "confidence"}] | None,
            "method": "semantic" | "keyword",
        }
    """
    opts = options or {}
    limit = opts.get("limit", 20)
    category = opts.get("category")
    source = opts.get("source")
    date_from = opts.get("date_from", opts.get("dateFrom"))
    date_to = opts.get("date_to", opts.get("dateTo"))
    include_insights = opts.get("include_insights", opts.get("includeInsights", False))

    if not query or not env:
        return {"results": [], "insights": None, "method": "none"}

    # ---------------------------------------------------------------
    # Step 1: Generate query embedding
    # ---------------------------------------------------------------
    embedding = await get_embedding(query, env)

    if embedding:
        # ---------------------------------------------------------------
        # Step 2: Search Vectorize index
        # ---------------------------------------------------------------
        try:
            vector_results = await env.VECTORIZE_INDEX.query(embedding, {
                "topK": limit * 2,
                "returnMetadata": True,
            })

            matches = vector_results.matches if hasattr(vector_results, "matches") else []
            if isinstance(vector_results, dict):
                matches = vector_results.get("matches", [])

            if matches:
                # Get article IDs and scores
                article_ids = [m.id if hasattr(m, "id") else m.get("id") for m in matches]
                score_map = {
                    (m.id if hasattr(m, "id") else m.get("id")):
                    (m.score if hasattr(m, "score") else m.get("score", 0))
                    for m in matches
                }

                # Fetch full articles from D1 edge cache with filters
                results = await _fetch_articles(
                    article_ids, score_map, category, source, date_from, date_to, limit, env
                )

                # Optional AI insights
                insights = None
                if include_insights and results:
                    insights = await _generate_insights(query, results, env)

                return {"results": results, "insights": insights, "method": "semantic"}

        except Exception as e:
            print(f"[SEARCH] Vector search failed, falling back to keyword: {e}")

    # ---------------------------------------------------------------
    # Fallback: keyword search via D1 LIKE queries
    # ---------------------------------------------------------------
    results = await _keyword_search(query, category, source, date_from, date_to, limit, env)
    return {"results": results, "insights": None, "method": "keyword"}


async def get_trending_topics(env=None) -> dict:
    """
    Get trending topics from recent articles.

    Uses frequency analysis on keywords/titles instead of Llama AI.
    Falls back to Claude for summarisation if needed.

    TS counterpart: AISearchService.getTrendingTopics()
    """
    if not env:
        return {"topics": []}

    try:
        # Fetch recent article titles from D1 edge cache
        # TODO: migrate to MongoDB as primary source
        result = await env.EDGE_CACHE_DB.prepare("""
            SELECT title FROM articles
            WHERE published_at >= datetime('now', '-24 hours')
            ORDER BY published_at DESC
            LIMIT 50
        """).all()

        titles = [r["title"] for r in (result.results if hasattr(result, "results") else [])]

        if not titles:
            return {"topics": []}

        # TODO: frequency-based topic extraction using collections.Counter
        # on normalised title words (avoid AI for this — it's just word counting)
        #
        # For now, use Claude to summarise trends
        client = AnthropicClient(env)
        prompt = f"""Given these recent news headlines from Pan-African news sources,
identify the top 5 trending topics. Return JSON only.

Headlines:
{chr(10).join(f'- {t}' for t in titles[:30])}

Return: {{"topics": ["topic1", "topic2", "topic3", "topic4", "topic5"]}}"""

        parsed = await client.extract_json(prompt, max_tokens=200)
        topics = parsed.get("topics", []) if parsed else []

        return {"topics": topics[:5]}

    except Exception as e:
        print(f"[SEARCH] Trending topics failed: {e}")
        return {"topics": []}


async def _fetch_articles(
    article_ids: list,
    score_map: dict,
    category: str | None,
    source: str | None,
    date_from: str | None,
    date_to: str | None,
    limit: int,
    env,
) -> list[dict]:
    """Fetch articles from D1 edge cache by IDs with optional filters.
    TODO: migrate to MongoDB as primary source."""
    if not article_ids:
        return []

    try:
        placeholders = ",".join("?" for _ in article_ids)
        sql = f"""
            SELECT id, slug, title, description, source, category, published_at
            FROM articles
            WHERE id IN ({placeholders})
        """
        params = list(article_ids)

        if category:
            sql += " AND category = ?"
            params.append(category)
        if source:
            sql += " AND source = ?"
            params.append(source)
        if date_from:
            sql += " AND published_at >= ?"
            params.append(date_from)
        if date_to:
            sql += " AND published_at <= ?"
            params.append(date_to)

        sql += f" LIMIT {int(limit)}"

        result = await env.EDGE_CACHE_DB.prepare(sql).bind(*params).all()
        rows = result.results if hasattr(result, "results") else []

        # Attach vector scores and sort by score descending
        articles = []
        for row in rows:
            row_dict = dict(row) if not isinstance(row, dict) else row
            article_id = row_dict.get("id")
            row_dict["score"] = score_map.get(f"article_{article_id}", score_map.get(str(article_id), 0))
            articles.append(row_dict)

        articles.sort(key=lambda a: a.get("score", 0), reverse=True)
        return articles[:limit]

    except Exception as e:
        print(f"[SEARCH] Edge cache query failed: {e}")
        return []


async def _keyword_search(
    query: str,
    category: str | None,
    source: str | None,
    date_from: str | None,
    date_to: str | None,
    limit: int,
    env,
) -> list[dict]:
    """Fallback keyword search using D1 edge cache SQL LIKE."""
    try:
        sql = """
            SELECT id, slug, title, description, source, category, published_at
            FROM articles
            WHERE (title LIKE ? OR description LIKE ?)
        """
        like_param = f"%{query}%"
        params = [like_param, like_param]

        if category:
            sql += " AND category = ?"
            params.append(category)
        if source:
            sql += " AND source = ?"
            params.append(source)
        if date_from:
            sql += " AND published_at >= ?"
            params.append(date_from)
        if date_to:
            sql += " AND published_at <= ?"
            params.append(date_to)

        sql += f" ORDER BY published_at DESC LIMIT {int(limit)}"

        result = await env.EDGE_CACHE_DB.prepare(sql).bind(*params).all()
        rows = result.results if hasattr(result, "results") else []

        return [
            {**(dict(r) if not isinstance(r, dict) else r), "score": 1.0}
            for r in rows
        ]

    except Exception as e:
        print(f"[SEARCH] Keyword search failed: {e}")
        return []


async def _generate_insights(query: str, results: list[dict], env) -> list[dict]:
    """Generate AI insights about search results using Claude."""
    try:
        client = AnthropicClient(env)
        titles = [r.get("title", "") for r in results[:5]]

        prompt = f"""Based on these search results for "{query}", provide a brief insight.

Results:
{chr(10).join(f'- {t}' for t in titles)}

Return JSON: {{"type": "summary", "content": "brief insight text", "confidence": 0.8}}"""

        parsed = await client.extract_json(prompt, max_tokens=200)
        if parsed:
            return [parsed]
        return []

    except Exception as e:
        print(f"[SEARCH] Insight generation failed: {e}")
        return []
