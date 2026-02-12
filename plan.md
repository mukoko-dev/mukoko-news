# Plan: Python Data Processing Worker + Anthropic AI Gateway Migration

## Problem Statement

Two issues with the current backend:

1. **Wrong AI models**: All 13 `ai.run()` calls use `@cf/meta/llama-3-8b-instruct` (Workers AI). We should be using **Anthropic Claude models via Cloudflare AI Gateway**.

2. **Wrong language for data processing**: Heavy processing (RSS parsing, HTML cleaning, article clustering, keyword extraction, content scraping, feed ranking) is hand-rolled TypeScript with fragile regex. Python has mature, battle-tested libraries for all of these.

## Target Architecture

```
Vercel (Next.js frontend)
    │
    │ API_SECRET (bearer token)
    ▼
TypeScript Worker (Hono)                Python Worker (FastAPI)
──────────────────────────              ───────────────────────────
 HTTP routing, auth, CORS   ──────►     RSS parsing (feedparser)
 Admin endpoints            Service     HTML cleaning (beautifulsoup4)
 D1 CRUD queries            Binding     Content extraction (trafilatura)
 Rate limiting, CSRF        (internal   Keyword extraction (AI Gateway + NLP)
 Durable Objects             RPC)       Article clustering (numpy + embeddings)
                                        Quality scoring (textstat)
                                        Semantic search (Vectorize FFI)
                                        Feed ranking (numpy/pandas)
                                │
                                ▼
                        Cloudflare AI Gateway
                          provider: anthropic
                          model: claude-sonnet-4-5-20250929
                                │
                                ▼
                        D1 / KV / Vectorize / R2
                        (via Python FFI bindings)
```

Both Workers live in the same repo. The Python Worker has its own `wrangler.jsonc` and `pyproject.toml`.

---

## Part 1: AI Model Migration (Anthropic via AI Gateway)

### What Changes

Every `this.ai.run('@cf/meta/llama-3-8b-instruct', ...)` call gets replaced with Anthropic Claude via AI Gateway.

**Current (wrong):**
```typescript
const response = await this.ai.run('@cf/meta/llama-3-8b-instruct', {
  prompt: "Extract keywords from this article..."
});
// response.response → string
```

**Target (correct):**
```python
# Python Worker — calling Anthropic via AI Gateway FFI
gateway = self.env.AI.gateway("mukoko-gateway")
result = await gateway.run([{
    "provider": "anthropic",
    "endpoint": "messages",
    "headers": {"x-api-key": self.env.ANTHROPIC_API_KEY},
    "query": {
        "model": "claude-sonnet-4-5-20250929",
        "max_tokens": 1024,
        "messages": [{"role": "user", "content": prompt}]
    }
}])
```

### Affected Calls (13 total)

| File | Line | Current Model | Purpose |
|------|------|---------------|---------|
| `ArticleAIService.ts` | 188 | `llama-3-8b-instruct` | Content cleaning (AI fallback) |
| `ArticleAIService.ts` | 274 | `llama-3-8b-instruct` | Keyword extraction |
| `ArticleAIService.ts` | 356 | `llama-3-8b-instruct` | Quality scoring |
| `ArticleAIService.ts` | 439 | `baai/bge-base-en-v1.5` | Embedding generation (keep for Vectorize) |
| `ArticleAIService.ts` | 540 | `llama-3-8b-instruct` | Default AI model param |
| `ArticleAIService.ts` | 624 | `llama-3-8b-instruct` | Author extraction |
| `ArticleAIService.ts` | 700 | `llama-3-8b-instruct` | Content classification |
| `ArticleAIService.ts` | 794 | `llama-3-8b-instruct` | Additional processing |
| `ArticleAIService.ts` | 857 | `llama-3-8b-instruct` | Grammar assessment |
| `ArticleAIService.ts` | 897 | `llama-3-8b-instruct` | Additional processing |
| `ArticleAIService.ts` | 935 | `llama-3-8b-instruct` | Additional processing |
| `AISearchService.ts` | 198 | `llama-3.1-8b-instruct` | Trending topic extraction |
| `AISearchService.ts` | 233 | `llama-3.1-8b-instruct` | AI insights generation |
| `AISearchService.ts` | 315 | `baai/bge-base-en-v1.5` | Search embedding (keep for Vectorize) |

**Note**: The 2 `baai/bge-base-en-v1.5` calls are for vector embeddings (Vectorize), not text generation. These stay as Workers AI since Vectorize requires specific embedding models. Everything else moves to Anthropic.

### New Secrets Required

```bash
npx wrangler secret put ANTHROPIC_API_KEY     # Anthropic API key
```

### AI Gateway Setup

Create gateway `mukoko-gateway` in Cloudflare dashboard (AI > AI Gateway), or configure in wrangler:
```jsonc
"ai": {
    "binding": "AI"
}
```

The gateway provides: request caching, rate limiting, logging, cost tracking, and provider fallback.

---

## Part 2: Python Worker for Data Processing

### Why Python

| Task | Current TS Approach | Python Replacement | Improvement |
|------|--------------------|--------------------|-------------|
| RSS parsing | `fast-xml-parser` + custom logic (943 lines) | `feedparser` (battle-tested, handles all RSS/Atom edge cases) | 50% less code, spec-compliant |
| HTML cleaning | 3-pass regex loops, manual entity map | `beautifulsoup4` (DOM-aware parsing) | Handles malformed HTML, no regex fragility |
| Image extraction | 8 separate regex patterns | `bs4` CSS selectors | Real CSS selectors, not regex approximations |
| Content scraping | 10+ regex patterns for CSS selectors | `trafilatura` (purpose-built for news) | Readability algorithm, auto metadata extraction |
| Keyword extraction | Substring matching, AI-only | AI Gateway + text analysis | Better confidence scoring, less AI dependency |
| Quality scoring | AI prompt + fixed heuristics | `textstat` readability + AI | Deterministic metrics, AI as enhancement not sole source |
| Article clustering | Jaccard similarity O(n^2), English-only stopwords | `numpy` vectorized ops + AI embeddings | Semantic similarity, multilingual, O(n log n) |
| Feed ranking | Loop-based fixed weights | `numpy` vectorized scoring | Faster, cleaner math |

### File Structure

```
processing/                           # Python Data Processing Worker
├── src/
│   └── entry.py                      # FastAPI entrypoint extending WorkerEntrypoint
├── services/
│   ├── __init__.py
│   ├── ai_client.py                  # Anthropic via AI Gateway wrapper
│   ├── rss_parser.py                 # feedparser + bs4
│   ├── content_cleaner.py            # bs4 HTML cleaning, entity decoding
│   ├── content_extractor.py          # trafilatura or bs4 web scraping
│   ├── keyword_extractor.py          # AI Gateway + text analysis
│   ├── quality_scorer.py             # textstat + AI enhancement
│   ├── clustering.py                 # numpy + AI embeddings
│   ├── search_processor.py           # Vectorize FFI + AI Gateway
│   └── feed_ranker.py               # numpy vectorized ranking
├── tests/
│   ├── __init__.py
│   ├── test_rss_parser.py
│   ├── test_content_cleaner.py
│   ├── test_keyword_extractor.py
│   ├── test_quality_scorer.py
│   ├── test_clustering.py
│   ├── test_search_processor.py
│   └── test_feed_ranker.py
├── pyproject.toml                    # Dependencies
└── wrangler.jsonc                    # Python Worker config
```

### Python Worker Config (`processing/wrangler.jsonc`)

```jsonc
{
    "name": "mukoko-news-processing",
    "main": "src/entry.py",
    "compatibility_date": "2025-12-01",
    "compatibility_flags": ["python_workers"],

    // Same D1 database as main worker
    "d1_databases": [{
        "binding": "DB",
        "database_name": "mukoko-news-db",
        "database_id": "2f2222f5-7122-4de1-8597-b12c73a9e3f9"
    }],

    // AI Gateway for Anthropic calls
    "ai": { "binding": "AI" },

    // Vectorize for semantic search
    "vectorize": [{
        "binding": "VECTORIZE_INDEX",
        "index_name": "mukoko-news-articles"
    }],

    // KV for caching
    "kv_namespaces": [{
        "binding": "CACHE_STORAGE",
        "id": "91721240e81943aa880dfc1b83fa75ff"
    }],

    // R2 for file storage
    "r2_buckets": [{
        "binding": "STORAGE",
        "bucket_name": "mukoko-news-storage"
    }]
}
```

### Main Worker Service Binding (`backend/wrangler.jsonc` addition)

```jsonc
"services": [{
    "binding": "DATA_PROCESSOR",
    "service": "mukoko-news-processing"
}]
```

### Python Dependencies (`processing/pyproject.toml`)

```toml
[project]
name = "mukoko-news-processing"
version = "0.1.0"
requires-python = ">=3.12"
dependencies = [
    "workers-py",
    "fastapi",
    "feedparser",
    "beautifulsoup4",
    "bleach",
    "numpy",
    "textstat",
]

[project.optional-dependencies]
dev = ["pytest", "pytest-asyncio"]

[tool.pytest.ini_options]
testpaths = ["tests"]
asyncio_mode = "auto"
```

**Note**: `pandas` and `trafilatura` are listed as optional — verify Pyodide compatibility before adding. `numpy` is confirmed available.

### FastAPI Entrypoint (`processing/src/entry.py`)

```python
from workers import WorkerEntrypoint, Response
from fastapi import FastAPI, Request

app = FastAPI()

class DataProcessor(WorkerEntrypoint):
    """Python Worker for data processing, called via Service Binding."""

    async def fetch(self, request):
        """Route incoming Service Binding requests to FastAPI."""
        from workers.serve import serve
        return await serve(app, request, self.env)

# --- Endpoints ---

@app.post("/rss/parse")
async def parse_rss(request: Request):
    """Parse RSS feed and extract articles with images."""
    ...

@app.post("/content/clean")
async def clean_content(request: Request):
    """Clean HTML content, extract images, decode entities."""
    ...

@app.post("/content/process")
async def process_article(request: Request):
    """Full AI processing pipeline: clean, keywords, quality, embedding."""
    ...

@app.post("/content/scrape")
async def scrape_content(request: Request):
    """Scrape web page and extract article content."""
    ...

@app.post("/keywords/extract")
async def extract_keywords(request: Request):
    """Extract keywords using AI Gateway + text analysis."""
    ...

@app.post("/clustering/cluster")
async def cluster_articles(request: Request):
    """Group similar articles using semantic similarity."""
    ...

@app.post("/search/query")
async def search_articles(request: Request):
    """Semantic search via Vectorize + AI Gateway."""
    ...

@app.get("/search/trending")
async def get_trending(request: Request):
    """Get trending topics from recent articles."""
    ...

@app.post("/feed/rank")
async def rank_feed(request: Request):
    """Rank articles for personalized feed."""
    ...
```

### How the Main Worker Calls the Python Worker

```typescript
// backend/services/ProcessingClient.ts — thin wrapper

export class ProcessingClient {
    private binding: Fetcher;

    constructor(dataProcessor: Fetcher) {
        this.binding = dataProcessor;
    }

    async parseRSS(feedUrl: string, feedXml: string) {
        const res = await this.binding.fetch("http://processing/rss/parse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: feedUrl, xml: feedXml })
        });
        return res.json();
    }

    async processArticle(article: { title: string; content: string; url: string }) {
        const res = await this.binding.fetch("http://processing/content/process", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(article)
        });
        return res.json();
    }

    async clusterArticles(articles: Array<{ id: string; title: string }>) {
        const res = await this.binding.fetch("http://processing/clustering/cluster", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ articles })
        });
        return res.json();
    }

    // ... similar methods for search, feed ranking, etc.
}
```

---

## Part 3: Service-by-Service Migration Details

### 3a. RSS Parsing (`SimpleRSSService` → `rss_parser.py`)

**Current TS (943 lines):**
- `fast-xml-parser` for XML parsing
- 8 regex patterns for image extraction (media tags, thumbnails, enclosures, WordPress fields, etc.)
- 3-pass loop-based HTML tag removal
- Hardcoded HTML entity map (amp, lt, gt, nbsp)
- Manual turndown HTML-to-Markdown conversion

**Python replacement:**
```python
import feedparser
from bs4 import BeautifulSoup
import bleach

def parse_feed(xml_content: str) -> list[dict]:
    feed = feedparser.parse(xml_content)
    articles = []

    for entry in feed.entries:
        # feedparser handles RSS 2.0, Atom, RDF, CDF automatically
        # Image extraction: feedparser understands media:content, enclosures, etc.
        image = (
            entry.get('media_thumbnail', [{}])[0].get('url') or
            entry.get('media_content', [{}])[0].get('url') or
            (entry.get('enclosures', [{}])[0].get('href') if entry.get('enclosures') else None)
        )

        # HTML cleaning with bs4 (not regex)
        soup = BeautifulSoup(entry.get('summary', ''), 'html.parser')
        for tag in soup(['script', 'style', 'iframe']):
            tag.decompose()
        clean_text = soup.get_text(separator=' ', strip=True)

        # If no image from feed metadata, extract from HTML content
        if not image:
            img_tag = soup.find('img', src=True)
            if img_tag:
                image = img_tag['src']

        articles.append({
            'title': entry.get('title', ''),
            'description': clean_text,
            'url': entry.get('link', ''),
            'image_url': image,
            'published': entry.get('published', ''),
            'author': entry.get('author', ''),
        })

    return articles
```

**What this eliminates:**
- 8 regex image extraction methods → `feedparser` built-in + 1 `bs4` fallback
- `fast-xml-parser` + custom RSS/Atom handling → `feedparser` handles all formats
- Manual entity decoding → `bs4` handles automatically
- 3-pass regex HTML removal → `bs4.decompose()` + `get_text()`

### 3b. Content Cleaning (`ArticleAIService.cleanContent` → `content_cleaner.py`)

**Current TS:**
- `do-while` loop regex for nested tag removal
- 4 regex patterns for image URL extraction
- Character filtering via `/[^\w\s\-.,!?;:()"'\[\]\/]/g`
- 8+ regex passes for whitespace normalization
- Falls back to Llama-3-8b AI call if cleaning fails

**Python replacement:**
```python
from bs4 import BeautifulSoup
import re

def clean_content(html: str) -> dict:
    soup = BeautifulSoup(html, 'html.parser')

    # Extract images BEFORE cleaning
    images = [img['src'] for img in soup.find_all('img', src=True)
              if img['src'].startswith(('http://', 'https://'))]

    # Remove unwanted elements
    for tag in soup(['script', 'style', 'iframe', 'nav', 'footer', 'header']):
        tag.decompose()
    for tag in soup.find_all(class_=re.compile(r'ad|sponsor|promo|sidebar')):
        tag.decompose()

    # Get clean text
    text = soup.get_text(separator=' ', strip=True)
    # Single-pass whitespace normalization
    text = re.sub(r'\s+', ' ', text).strip()

    return {
        'cleaned_content': text,
        'extracted_images': images,
    }
```

**What this eliminates:**
- do-while regex loops → `soup.decompose()`
- 4 image regex patterns → `soup.find_all('img')`
- Manual entity map → bs4 handles automatically
- AI fallback for cleaning → not needed, bs4 handles malformed HTML

### 3c. AI Processing (`ArticleAIService` → `article_ai.py` + `ai_client.py`)

**AI Client wrapper for Anthropic via Gateway:**
```python
class AnthropicClient:
    """Wrapper for Anthropic Claude calls via Cloudflare AI Gateway."""

    def __init__(self, env):
        self.gateway = env.AI.gateway("mukoko-gateway")
        self.api_key = env.ANTHROPIC_API_KEY

    async def complete(self, prompt: str, max_tokens: int = 1024) -> str:
        result = await self.gateway.run([{
            "provider": "anthropic",
            "endpoint": "messages",
            "headers": {"x-api-key": self.api_key},
            "query": {
                "model": "claude-sonnet-4-5-20250929",
                "max_tokens": max_tokens,
                "messages": [{"role": "user", "content": prompt}]
            }
        }])
        return result.content[0].text

    async def extract_json(self, prompt: str) -> dict:
        """Call Claude and parse JSON from response."""
        text = await self.complete(prompt)
        # Claude is much better at structured output than Llama-3-8b
        return json.loads(text)
```

**Benefits of Claude over Llama-3-8b for these tasks:**
- **Keyword extraction**: Claude follows JSON format instructions reliably; Llama-3-8b frequently returns malformed JSON (current code has extensive JSON parsing fallbacks)
- **Quality scoring**: Claude provides calibrated 0-1 scores; Llama returns "excellent quality" strings that need regex parsing
- **Author extraction**: Claude handles complex bylines ("By John Smith, with additional reporting from Jane Doe, AP") accurately
- **Content classification**: Claude distinguishes news vs opinion vs analysis more accurately

### 3d. Clustering (`StoryClusteringService` → `clustering.py`)

**Current TS (152 lines):**
- 69 hardcoded English stopwords
- Jaccard similarity on word sets (no semantic understanding)
- O(n^2) nested loop comparison
- Greedy cluster assignment

**Python replacement:**
```python
import numpy as np
from collections import defaultdict

# Multilingual stopwords (expandable)
STOP_WORDS = {
    'en': {'the', 'a', 'an', 'is', 'was', 'are', 'were', 'be', 'been', ...},
    'sw': {'na', 'ya', 'wa', 'kwa', 'ni', 'la', 'za', ...},  # Swahili
    'sn': {'ndi', 'iri', 'ari', 'ane', 'kuti', ...},           # Shona
}

async def cluster_articles(articles: list[dict], ai_client, threshold: float = 0.75) -> list[list[dict]]:
    """Cluster articles by semantic similarity using AI embeddings."""

    # Get embeddings from Workers AI (baai/bge-base-en-v1.5 via Vectorize)
    texts = [a['title'] for a in articles]
    embeddings = await get_embeddings(texts, ai_client)

    # Vectorized cosine similarity matrix (numpy, not O(n^2) loops)
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    normalized = embeddings / norms
    similarity_matrix = np.dot(normalized, normalized.T)

    # Greedy clustering with semantic threshold
    clusters = []
    assigned = set()
    for i in range(len(articles)):
        if i in assigned:
            continue
        cluster = [articles[i]]
        assigned.add(i)
        for j in range(i + 1, len(articles)):
            if j not in assigned and similarity_matrix[i][j] >= threshold:
                cluster.append(articles[j])
                assigned.add(j)
        clusters.append(cluster)

    return clusters
```

**What this improves:**
- Semantic similarity instead of word overlap ("economy" and "business" now match)
- Multilingual stopwords (Shona, Swahili, not just English)
- Vectorized numpy operations instead of nested JS loops
- Cosine similarity on embeddings (proven for NLP) vs Jaccard on word sets

### 3e. Quality Scoring (`ArticleAIService.assessQuality` → `quality_scorer.py`)

**Current TS:**
- Calls Llama-3-8b to score 0-1 (unreliable)
- Fallback: content length heuristic + "Zimbabwe" keyword count

**Python replacement:**
```python
from textstat import flesch_reading_ease, flesch_kincaid_grade

def score_quality(content: str, title: str) -> dict:
    """Deterministic quality scoring + optional AI enhancement."""

    word_count = len(content.split())
    reading_ease = flesch_reading_ease(content)  # 0-100 scale
    grade_level = flesch_kincaid_grade(content)

    # Base score from deterministic metrics (no AI needed)
    length_score = min(word_count / 500, 1.0)              # Longer = better, cap at 500
    readability_score = min(reading_ease / 70, 1.0)         # Higher ease = better
    title_score = 1.0 if 5 <= len(title.split()) <= 15 else 0.5  # Good title length

    base_score = (length_score * 0.4 + readability_score * 0.4 + title_score * 0.2)

    return {
        'quality_score': round(base_score, 2),
        'word_count': word_count,
        'reading_ease': round(reading_ease, 1),
        'grade_level': round(grade_level, 1),
    }
```

**What this improves:**
- Deterministic scoring (no AI call needed for basic quality)
- Reproducible results (same article always gets same score)
- Instant response (no AI latency)
- AI can be used as optional enhancement for edge cases

---

## Part 4: Migration Order

Incremental migration, not big-bang. Each step is independently deployable.

| Phase | Service | Risk | Reason for Order |
|-------|---------|------|-----------------|
| **1** | RSS Parser | Low | Most self-contained, `feedparser` is rock-solid |
| **2** | Content Cleaner | Low | Pure text processing, easy to verify parity |
| **3** | Quality Scorer | Low | `textstat` is deterministic, easy to compare |
| **4** | Keyword Extractor | Medium | Switches to Anthropic AI, needs prompt tuning |
| **5** | Content Extractor | Medium | Web scraping, depends on package availability |
| **6** | Clustering | Medium | Needs AI embeddings + numpy, more complex |
| **7** | Search Processor | Medium | Touches Vectorize, needs integration testing |
| **8** | Feed Ranker | Low | Pure math, numpy replacement |

**For each phase:**
1. Implement Python service with tests
2. Add FastAPI endpoint
3. Update TS service to call Python Worker via Service Binding
4. Keep TS fallback: if Python Worker call fails, fall back to existing TS logic
5. Deploy and monitor
6. Remove TS fallback once stable

---

## Part 5: Commands and CI/CD

### New Commands (root `package.json`)

```json
{
    "dev:processing": "cd processing && uv run pywrangler dev",
    "deploy:processing": "cd processing && uv run pywrangler deploy",
    "test:processing": "cd processing && uv run pytest",
    "typecheck:processing": "cd processing && uv run pyright"
}
```

### Development Workflow

```bash
# Terminal 1: Main TS Worker
cd backend && npm run dev          # port 8787

# Terminal 2: Python Processing Worker
cd processing && uv run pywrangler dev  # separate port

# Terminal 3: Next.js frontend
npm run dev                         # port 3000
```

### CI/CD Updates (`.github/workflows/deploy.yml`)

Add steps:
1. Install `uv` and Python 3.12
2. `cd processing && uv run pytest` (Python tests)
3. `cd processing && uv run pywrangler deploy` (deploy Python Worker)
4. Health check on Python Worker
5. Then deploy TS Worker (which has Service Binding to Python Worker)

**Deploy order matters**: Python Worker must deploy before TS Worker, since the Service Binding references it.

### New Secrets

```bash
# Anthropic API key for AI Gateway
npx wrangler secret put ANTHROPIC_API_KEY --config processing/wrangler.jsonc

# Also add to backend worker if needed during fallback period
npx wrangler secret put ANTHROPIC_API_KEY --config backend/wrangler.jsonc
```

---

## Part 6: What Stays in TypeScript

These services remain in the Hono Worker — they're lightweight or tied to Workers-specific features:

| Service | Reason to Keep in TS |
|---------|---------------------|
| `D1Service` / `D1CacheService` | Simple D1 CRUD, no processing |
| `D1UserService` | User database operations |
| `AuthProviderService` | Auth logic, session management |
| `OIDCAuthService` | OIDC token validation |
| `RateLimitService` | KV-based rate limiting |
| `CSRFService` | Request validation |
| `ObservabilityService` | Logging |
| `CloudflareImagesService` | Images API binding |
| `AnalyticsEngineService` | Analytics datasets |
| `CountryService` | Simple D1 queries |
| `CategoryManager` | Simple D1 queries |
| `NewsSourceManager` | Simple D1 queries |
| All Durable Objects | Workers runtime feature |

---

## Part 7: Risks and Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Python Workers beta instability | Medium | Keep TS fallbacks during migration |
| Package not in Pyodide | Medium | Verify each dep before committing; request via GitHub if missing |
| Service Binding latency | Low | Measure; internal RPC is ~1ms, not HTTP |
| AI Gateway/Anthropic costs | Low | Gateway provides caching; Claude is more efficient per-call than Llama (fewer retries, better JSON compliance) |
| Pyodide cold start | Medium | Memory snapshots mitigate; monitor P95 latency |
| Breaking change in Python Worker | Low | Versioned endpoints, backward-compatible response shapes |

---

## Part 8: Verification Checklist

Before removing each TS fallback:

- [ ] Python service returns identical response shape to TS service
- [ ] Python tests cover all edge cases from existing TS tests
- [ ] Latency P50/P95 within 20% of TS implementation
- [ ] Error rates equal or lower
- [ ] AI Gateway logs confirm Anthropic calls succeed
- [ ] No regressions in frontend behavior
- [ ] Backend test suite still passes (548 tests)
- [ ] Frontend test suite still passes (437 tests)
