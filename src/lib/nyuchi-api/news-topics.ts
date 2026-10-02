/**
 * `/v1/news/topics/{slug}/articles` — the `/topic/[slug]` timeline from the
 * Nyuchi API: matched in Doris, hydrated from MongoDB by `_id`, cached five
 * minutes per slug at the API.
 *
 * Replaces the direct read that produced ~21.6k 500s on 2026-10-02 (five
 * case-insensitive regex branches over 30 days of documents, no index can
 * serve them). Throws on failure; the caller decides what a failure renders.
 *
 * SERVER ONLY — see `./client`.
 */

import type { Article } from '@/lib/api'
import { articlesFromApi } from '@/lib/mongodb/articles'
import { gatewayGet } from './client'

export const TOPIC_REVALIDATE_SECONDS = 300

interface TopicWire {
  topic: string
  days: number
  total: number
  articles: unknown[]
  sources: unknown[]
}

export async function fetchTopicTimeline(
  slug: string,
  days: number,
): Promise<{ articles: Article[]; total: number }> {
  const { data } = await gatewayGet<TopicWire>(
    `/v1/news/topics/${encodeURIComponent(slug)}/articles`,
    { days, limit: 100 },
    { revalidate: TOPIC_REVALIDATE_SECONDS, tags: ['topic', `topic:${slug}`], timeoutMs: 8000 },
  )
  const articles = articlesFromApi(data.articles ?? [], data.sources ?? [])
  return { articles, total: Math.max(Number(data.total) || 0, articles.length) }
}
