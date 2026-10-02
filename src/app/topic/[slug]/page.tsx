import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { ArrowLeft, Newspaper } from 'lucide-react'
import { getTopicTimelineAction } from '@/lib/actions/feed'
import { getFullUrl } from '@/lib/constants'
import { TopicTimeline } from '@/components/topic-timeline'

// Developing-story surface: everything published on a topic in the last 30
// days, on the Mzizi date-railed timeline (nyuchi-timeline). Reached from
// article tags and trending topics. ISR keeps it fresh without per-hit reads.
export const revalidate = 300

/*
 * CRAWLER SAFETY (2026-10-02: ~21.6k 500s in 24 h on this route, mostly bots).
 *
 * The slug space is unbounded — every tag and keyword the corpus has ever
 * carried is a URL — so this page is built to be cheap and quiet for a crawler:
 *
 *   - It never 500s. The read is fail-soft (`ok: false`), and a malformed
 *     percent-escape in the URL is a 404, not a thrown URIError.
 *   - A page with nothing on it, or a read that did not finish, is `noindex`:
 *     a crawler should not file an empty or degraded page as this topic.
 *   - The read comes from the Nyuchi API (cached per slug there) and is shared
 *     by `generateMetadata` and the page through React `cache()`, so one render
 *     is one read.
 *   - ISR caches whatever rendered for `revalidate` seconds — including the
 *     degraded state, deliberately: a retry storm against a struggling backend
 *     is exactly what produced the 500s, and five minutes of an honest
 *     "temporarily unavailable" is the cheaper failure.
 */

/** The decoded slug, or null when the URL carries a malformed escape. */
function decodeSlug(raw: string): string | null {
  try {
    return decodeURIComponent(raw)
  } catch {
    return null
  }
}

const loadTopic = cache((slug: string) => getTopicTimelineAction(slug))

interface TopicPageProps {
  params: Promise<{ slug: string }>
}

function topicTitle(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { slug } = await params
  const decoded = decodeSlug(slug)
  if (decoded === null) return {}
  const title = topicTitle(decoded)
  const { total, ok } = await loadTopic(decoded)
  return {
    // Empty or degraded: still followable, never indexed as this topic.
    ...(total === 0 || !ok ? { robots: { index: false, follow: true } } : {}),
    title: `${title} — Ongoing coverage`,
    description: `Follow the ${title} story as it develops: every report, day by day, from newsrooms across Africa.`,
    // Declared explicitly: without it this route inherited the root canonical
    // and pointed every developing-story page at the homepage.
    alternates: { canonical: getFullUrl(`/topic/${slug}`) },
    openGraph: {
      title: `${title} — Ongoing coverage`,
      description: `Every report on ${title}, day by day, from newsrooms across Africa.`,
      url: getFullUrl(`/topic/${slug}`),
      type: 'website',
    },
  }
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { slug } = await params
  const decoded = decodeSlug(slug)
  if (decoded === null) notFound()
  const { topic, articles, total, ok } = await loadTopic(decoded)
  const title = topicTitle(topic || decoded)

  return (
    <div className="mx-auto w-full max-w-[var(--width-reading)] px-[var(--page-gutter)] sm:px-[var(--page-gutter-sm)] py-[var(--page-block-reading)]">
      <Link
        href="/discover"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-foreground transition-colors focus-visible:outline-none focus-visible:underline"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        Discover
      </Link>

      <header className="mb-8">
        <p className="font-mono text-[13px] uppercase tracking-wide text-text-tertiary mb-1">
          Ongoing coverage
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">{title}</h1>
        {total > 0 && (
          <p className="mt-2 text-sm text-text-secondary">
            {total} {total === 1 ? 'report' : 'reports'} in the last 30 days
          </p>
        )}
      </header>

      {articles.length > 0 ? (
        <TopicTimeline articles={articles} />
      ) : !ok ? (
        <div className="text-center py-20" role="status">
          <h2 className="font-serif text-xl font-bold mb-2">Coverage is temporarily unavailable</h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            We couldn&apos;t load reports on this topic just now. That is our fault, not a sign the
            story has gone quiet — please try again in a few minutes.
          </p>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            Explore other topics
          </Link>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center mx-auto mb-6">
            <Newspaper className="w-10 h-10 text-text-tertiary" aria-hidden="true" />
          </div>
          <h2 className="font-serif text-xl font-bold mb-2">No recent coverage</h2>
          <p className="text-text-secondary mb-6 max-w-md mx-auto">
            Nothing has been published on this topic in the last 30 days. It may pick up again —
            check back later.
          </p>
          <Link
            href="/discover"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            Explore other topics
          </Link>
        </div>
      )}
    </div>
  )
}
