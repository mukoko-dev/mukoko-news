/**
 * `/v1/news/articles/{id}/related` — the article page's "Related" rail from the
 * Nyuchi API: Atlas Vector Search with the visibility gate after the search,
 * cached an hour per article at the API.
 *
 * SERVER ONLY — see `./client`.
 */

import type { Article } from '@/lib/api'
import { articlesFromApi } from '@/lib/mongodb/articles'
import { GatewayError, gatewayGet } from './client'

interface RelatedWire {
  articleId: string
  method: string
  articles: unknown[]
  sources: unknown[]
}

export async function fetchRelatedArticles(articleId: string, limit: number): Promise<Article[]> {
  try {
    const { data } = await gatewayGet<RelatedWire>(
      `/v1/news/articles/${encodeURIComponent(articleId)}/related`,
      { limit },
      { revalidate: 3600, tags: ['related', `related:${articleId}`], timeoutMs: 6000 },
    )
    return articlesFromApi(data.articles ?? [], data.sources ?? [])
  } catch (error) {
    // 404 is an answer — the article is gone or not public, so it has no
    // related rail — not a failure to fall back from. The direct read answers
    // the same question the same way (`[]`).
    if (error instanceof GatewayError && error.status === 404) return []
    throw error
  }
}
