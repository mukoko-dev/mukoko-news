/**
 * The article page's two reads, through the Nyuchi API when it is configured.
 *
 * Deliberately NOT a `'use server'` module: these are called from the page
 * during render, and exporting them from a Server Actions file would also make
 * them publicly POSTable endpoints. `getArticleAction` (in `actions/feed.ts`)
 * remains the client-callable door, and routes through `getArticleDetail` too.
 *
 * Both keep the page's three-valued contract — present, absent, could-not-look
 * — because a 404 for an outage would hand a crawler a deindex signal for a
 * live article.
 */

import type { Article } from '@/lib/api'
import { articleExists, getArticleById } from '@/lib/mongodb/articles'
import { viaGateway } from '@/lib/nyuchi-api/client'
import { fetchArticleDetail } from '@/lib/nyuchi-api/news-articles'

/** The article, `null` when absent (or not public via the API); throws when it could not look. */
export async function getArticleDetail(id: string): Promise<Article | null> {
  return viaGateway(
    'articles.detail',
    () => fetchArticleDetail(id),
    () => getArticleById(id)
  )
}

/**
 * `true` / `false` / `null` (could not look), as `articleExists`.
 *
 * Through the API this IS the detail read: Next memoises identical GETs within
 * one render, so the page's body reuses the same response instead of making a
 * second request, and there is no separate existence query to pay for.
 */
export async function getArticleExists(id: string): Promise<boolean | null> {
  return viaGateway(
    'articles.exists',
    async () => (await fetchArticleDetail(id)) !== null,
    () => articleExists(id)
  )
}
