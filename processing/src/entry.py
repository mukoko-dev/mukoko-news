"""
Mukoko News — Python Data Processing Worker

FastAPI entrypoint called by the main TypeScript Worker via Service Binding.
All heavy data processing lives here: RSS parsing, content cleaning,
AI orchestration, clustering, search, and feed ranking.

Bindings available via self.env:
  - DB          : D1 database
  - AI          : Workers AI (embeddings) + AI Gateway (Anthropic Claude)
  - VECTORIZE_INDEX : Vectorize semantic search
  - CACHE_STORAGE   : KV cache
  - STORAGE         : R2 file storage
"""

from workers import WorkerEntrypoint, Response
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

app = FastAPI(
    title="Mukoko News Processing",
    version="0.1.0",
)

# ---------------------------------------------------------------------------
# Global env reference — set per-request by the WorkerEntrypoint
# Services access this to reach Cloudflare bindings (D1, AI, KV, etc.)
# ---------------------------------------------------------------------------
_env = None


def get_env():
    """Return the current request's Cloudflare env bindings."""
    return _env


# ---------------------------------------------------------------------------
# WorkerEntrypoint — receives Service Binding calls from the Hono Worker
# ---------------------------------------------------------------------------

class DataProcessor(WorkerEntrypoint):
    async def fetch(self, request):
        global _env
        _env = self.env

        # TODO: wire FastAPI via workers.serve once pywrangler supports it
        # For now, manual routing to keep things simple and testable
        from services.router import handle_request
        return await handle_request(request, self.env)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health")
async def health():
    return {"status": "ok", "service": "mukoko-news-processing"}
