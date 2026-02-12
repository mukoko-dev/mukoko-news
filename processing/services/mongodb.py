"""
MongoDB Atlas Data API client.

Primary data store for Mukoko News. D1 is used only as an edge cache.

MongoDB Atlas Data API is HTTP-based (no TCP driver needed), which works
perfectly in Cloudflare Workers / Pyodide. All CRUD operations go through
REST endpoints.

Env bindings required:
  - MONGODB_DATA_API_URL : Base URL for the Data API
  - MONGODB_APP_ID       : Atlas App Services app ID (secret)
  - MONGODB_API_KEY      : Data API key (secret)
  - MONGODB_CLUSTER      : Cluster name (e.g. "mukoko-news")
  - MONGODB_DATABASE     : Database name (e.g. "mukoko_news")

Usage:
    db = MongoDBClient(env)
    articles = await db.find("articles", {"category": "news"}, limit=20)
    article = await db.find_one("articles", {"_id": article_id})
    result = await db.insert_one("articles", {"title": "...", ...})
    await db.update_one("articles", {"_id": id}, {"$set": {"score": 0.8}})

Atlas Data API docs: https://www.mongodb.com/docs/atlas/app-services/data-api/
"""

import json

# TODO: use httpx (async, supported in Python Workers) once confirmed;
# for now, use the JS fetch via FFI as the transport layer
# import httpx


class MongoDBClient:
    """HTTP client for MongoDB Atlas Data API."""

    def __init__(self, env):
        self.env = env
        self.base_url = getattr(env, "MONGODB_DATA_API_URL", "")
        self.app_id = getattr(env, "MONGODB_APP_ID", "")
        self.api_key = getattr(env, "MONGODB_API_KEY", "")
        self.cluster = getattr(env, "MONGODB_CLUSTER", "mukoko-news")
        self.database = getattr(env, "MONGODB_DATABASE", "mukoko_news")

    def _endpoint(self, action: str) -> str:
        """Build the Data API endpoint URL."""
        return f"{self.base_url}/{self.app_id}/endpoint/data/v1/action/{action}"

    def _headers(self) -> dict:
        return {
            "Content-Type": "application/json",
            "api-key": self.api_key,
        }

    def _base_body(self, collection: str) -> dict:
        return {
            "dataSource": self.cluster,
            "database": self.database,
            "collection": collection,
        }

    # ------------------------------------------------------------------
    # Read operations
    # ------------------------------------------------------------------

    async def find(
        self,
        collection: str,
        filter: dict | None = None,
        projection: dict | None = None,
        sort: dict | None = None,
        limit: int = 20,
        skip: int = 0,
    ) -> list[dict]:
        """
        Find multiple documents.

        Args:
            collection: Collection name (e.g. "articles")
            filter: MongoDB query filter (e.g. {"category": "news"})
            projection: Fields to include/exclude
            sort: Sort order (e.g. {"published_at": -1})
            limit: Max documents to return
            skip: Number of documents to skip (for pagination)

        Returns:
            List of document dicts
        """
        body = {
            **self._base_body(collection),
            "filter": filter or {},
            "limit": limit,
            "skip": skip,
        }
        if projection:
            body["projection"] = projection
        if sort:
            body["sort"] = sort

        result = await self._request("find", body)
        return result.get("documents", [])

    async def find_one(self, collection: str, filter: dict, projection: dict | None = None) -> dict | None:
        """Find a single document."""
        body = {
            **self._base_body(collection),
            "filter": filter,
        }
        if projection:
            body["projection"] = projection

        result = await self._request("findOne", body)
        return result.get("document")

    async def count(self, collection: str, filter: dict | None = None) -> int:
        """Count documents matching a filter."""
        # TODO: Data API doesn't have a direct count endpoint;
        # use aggregate with $count stage
        body = {
            **self._base_body(collection),
            "pipeline": [
                {"$match": filter or {}},
                {"$count": "total"},
            ],
        }
        result = await self._request("aggregate", body)
        docs = result.get("documents", [])
        return docs[0]["total"] if docs else 0

    async def aggregate(self, collection: str, pipeline: list[dict]) -> list[dict]:
        """Run an aggregation pipeline."""
        body = {
            **self._base_body(collection),
            "pipeline": pipeline,
        }
        result = await self._request("aggregate", body)
        return result.get("documents", [])

    # ------------------------------------------------------------------
    # Write operations
    # ------------------------------------------------------------------

    async def insert_one(self, collection: str, document: dict) -> dict:
        """Insert a single document. Returns {"insertedId": ...}."""
        body = {
            **self._base_body(collection),
            "document": document,
        }
        return await self._request("insertOne", body)

    async def insert_many(self, collection: str, documents: list[dict]) -> dict:
        """Insert multiple documents. Returns {"insertedIds": [...]}."""
        body = {
            **self._base_body(collection),
            "documents": documents,
        }
        return await self._request("insertMany", body)

    async def update_one(self, collection: str, filter: dict, update: dict, upsert: bool = False) -> dict:
        """
        Update a single document.

        Args:
            filter: Query to match the document
            update: MongoDB update expression (e.g. {"$set": {"score": 0.8}})
            upsert: Create document if it doesn't exist

        Returns:
            {"matchedCount": int, "modifiedCount": int}
        """
        body = {
            **self._base_body(collection),
            "filter": filter,
            "update": update,
            "upsert": upsert,
        }
        return await self._request("updateOne", body)

    async def update_many(self, collection: str, filter: dict, update: dict) -> dict:
        """Update multiple documents."""
        body = {
            **self._base_body(collection),
            "filter": filter,
            "update": update,
        }
        return await self._request("updateMany", body)

    async def delete_one(self, collection: str, filter: dict) -> dict:
        """Delete a single document. Returns {"deletedCount": int}."""
        body = {
            **self._base_body(collection),
            "filter": filter,
        }
        return await self._request("deleteOne", body)

    async def delete_many(self, collection: str, filter: dict) -> dict:
        """Delete multiple documents."""
        body = {
            **self._base_body(collection),
            "filter": filter,
        }
        return await self._request("deleteMany", body)

    # ------------------------------------------------------------------
    # Internal
    # ------------------------------------------------------------------

    async def _request(self, action: str, body: dict) -> dict:
        """
        Make an HTTP request to the MongoDB Atlas Data API.

        TODO: switch to httpx once confirmed in Pyodide:
            async with httpx.AsyncClient() as client:
                resp = await client.post(url, json=body, headers=headers)

        For now, uses the JS fetch via Python Workers FFI.
        """
        url = self._endpoint(action)
        headers = self._headers()

        try:
            # Python Workers FFI: use globalThis.fetch from JS
            from js import fetch, Headers, JSON as JS_JSON
            from pyodide.ffi import to_js

            js_headers = Headers.new()
            for k, v in headers.items():
                js_headers.set(k, v)

            response = await fetch(
                url,
                to_js({
                    "method": "POST",
                    "headers": js_headers,
                    "body": json.dumps(body, default=str),
                }, dict_converter=lambda x: x),
            )

            if not response.ok:
                text = await response.text()
                print(f"[MONGODB] {action} failed ({response.status}): {text[:200]}")
                return {}

            text = await response.text()
            return json.loads(text) if text else {}

        except ImportError:
            # Not running in Workers — fallback for local testing
            print(f"[MONGODB] JS FFI not available, cannot make request to {action}")
            return {}
        except Exception as e:
            print(f"[MONGODB] Request failed: {e}")
            return {}
