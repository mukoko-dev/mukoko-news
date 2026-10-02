/**
 * `/v1/news/articles/{id}/related` — the article page's "Related" rail from the
 * Nyuchi API: Atlas Vector Search with the visibility gate after the search,
 * cached an hour per article at the API.
 *
 * SERVER ONLY — see `./client`.
 */

import type { Article } from '@/lib/api'
import { articleDetailFromApi, articlesFromApi } from '@/lib/mongodb/articles'
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

/**
 * One public article for its page, with its source and newsroom, cached five
 * minutes per article at the API and here.
 *
 * `null` is the API's 404: missing, or not public (moderated out). Anything
 * else that goes wrong throws, so the caller can tell "absent" from "could not
 * look" — the article page must never answer 404 for an outage, which would be
 * a deindex signal for a live article.
 */
export async function fetchArticleDetail(articleId: string): Promise<Article | null> {
  try {
    const { data } = await gatewayGet<{ article: unknown; source: unknown; publisher: unknown }>(
      `/v1/news/articles/${encodeURIComponent(articleId)}/detail`,
      {},
      { revalidate: 300, tags: ['article', `article:${articleId}`], timeoutMs: 6000 },
    )
    const article = articleDetailFromApi(data)
    if (!article) throw new GatewayError('article detail had no usable article document', 200)
    return article
  } catch (error) {
    if (error instanceof GatewayError && error.status === 404) return null
    throw error
  }
}
