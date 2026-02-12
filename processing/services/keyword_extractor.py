"""
Keyword extractor — replaces ArticleAIService.extractKeywords().

Uses Anthropic Claude (via AI Gateway) for intelligent extraction,
with a text-matching fallback. Claude is much more reliable at returning
valid JSON than Llama-3-8b, so the fallback paths are simpler.

TS counterpart: ArticleAIService.extractKeywords() lines 249-345
"""

from services.ai_client import AnthropicClient


async def extract_keywords(
    title: str,
    content: str,
    existing_category: str | None = None,
    env=None,
) -> dict:
    """
    Extract keywords from article content.

    Args:
        title: Article title
        content: Cleaned article text
        existing_category: Pre-assigned category (from RSS source)
        env: Cloudflare env bindings (for EDGE_CACHE_DB + AI)

    Returns:
        {
            "keywords": [
                {"keyword": str, "confidence": float, "category": str},
                ...
            ]
        }
    """
    if not content or len(content) < 50:
        return {"keywords": []}

    # ---------------------------------------------------------------
    # Load existing keywords from D1 edge cache for context
    # TODO: migrate to MongoDB as primary source once MongoDBClient
    # is wired in — D1 is the edge cache, not primary data store
    # ---------------------------------------------------------------
    keyword_list = ""
    db_keywords: list[dict] = []

    if env:
        try:
            result = await env.EDGE_CACHE_DB.prepare("""
                SELECT k.keyword, k.category_id, k.relevance_score
                FROM keywords k
                JOIN categories c ON k.category_id = c.id
                WHERE c.enabled = 1
                ORDER BY k.usage_count DESC, k.relevance_score DESC
                LIMIT 50
            """).all()

            if result and hasattr(result, "results"):
                db_keywords = list(result.results)
                keyword_list = ", ".join(k["keyword"] for k in db_keywords)
        except Exception as e:
            print(f"[KEYWORDS] Failed to load edge cache keywords: {e}")

    # ---------------------------------------------------------------
    # AI extraction via Anthropic Claude
    # ---------------------------------------------------------------
    extracted: list[dict] = []

    if env and keyword_list:
        client = AnthropicClient(env)
        prompt = f"""Analyze this news article and extract relevant keywords.

Article Title: {title}
Article Content: {content[:1500]}

Available Keywords: {keyword_list}

Instructions:
1. Identify the most relevant keywords from the available list that match this article
2. Consider Pan-African context (Zimbabwe politics, regional business, sports, etc.)
3. Return max 8 keywords
4. Rate confidence 0.0-1.0 for each keyword

Return JSON only, no explanation:
{{"keywords": [{{"keyword": "example", "confidence": 0.9}}]}}"""

        parsed = await client.extract_json(prompt, max_tokens=500)

        if parsed and "keywords" in parsed and isinstance(parsed["keywords"], list):
            for kw in parsed["keywords"]:
                keyword_text = kw.get("keyword", "")
                confidence = kw.get("confidence", 0.0)

                # Match against DB keywords to get category
                db_match = _find_db_keyword(keyword_text, db_keywords)
                if db_match and confidence > 0.5:
                    extracted.append({
                        "keyword": keyword_text,
                        "confidence": confidence,
                        "category": db_match["category_id"],
                    })

    # ---------------------------------------------------------------
    # Fallback: simple text matching (same as TS fallback)
    # ---------------------------------------------------------------
    if not extracted and db_keywords:
        content_lower = (title + " " + content).lower()
        for kw in db_keywords[:20]:
            if kw["keyword"].lower() in content_lower:
                extracted.append({
                    "keyword": kw["keyword"],
                    "confidence": 0.7,
                    "category": kw["category_id"],
                })
                if len(extracted) >= 8:
                    break

    return {"keywords": extracted[:8]}


def _find_db_keyword(keyword: str, db_keywords: list[dict]) -> dict | None:
    """Find a matching keyword in the database list (case-insensitive)."""
    keyword_lower = keyword.lower()
    for db_kw in db_keywords:
        if db_kw["keyword"].lower() == keyword_lower:
            return db_kw
    return None
