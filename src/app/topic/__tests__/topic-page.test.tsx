/**
 * /topic/[slug] under the three states a crawler can meet, none of them a 500.
 *
 *   - populated: indexable, the timeline renders;
 *   - empty: "No recent coverage", `noindex` (thin page, unbounded URL space);
 *   - degraded (the read did not finish): an honest "temporarily unavailable",
 *     `noindex` — never "nothing has been published", which would be a false
 *     statement about the story;
 *   - a malformed escape in the URL: a 404, not a thrown URIError.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const getTopicTimelineAction = vi.fn()

vi.mock('@/lib/actions/feed', () => ({
  getTopicTimelineAction: (...args: unknown[]) => getTopicTimelineAction(...args),
}))
vi.mock('@/components/topic-timeline', () => ({
  TopicTimeline: ({ articles }: { articles: unknown[] }) => <div data-testid="timeline">{articles.length}</div>,
}))
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND')
  },
}))

beforeEach(() => {
  vi.resetModules()
  getTopicTimelineAction.mockReset()
})

async function page() {
  return import('../[slug]/page')
}

const params = (slug: string) => ({ params: Promise.resolve({ slug }) })

describe('/topic/[slug]', () => {
  it('a populated topic is indexable and renders its timeline', async () => {
    getTopicTimelineAction.mockResolvedValue({ topic: 'cholera', articles: [{ id: 'a' }], total: 41, ok: true })
    const { default: TopicPage, generateMetadata } = await page()
    const meta = await generateMetadata(params('cholera'))
    expect(meta.robots).toBeUndefined()
    render(await TopicPage(params('cholera')))
    expect(screen.getByTestId('timeline').textContent).toBe('1')
    expect(screen.getByText('41 reports in the last 30 days')).toBeTruthy()
  })

  it('an empty topic says so and is noindex', async () => {
    getTopicTimelineAction.mockResolvedValue({ topic: 'cholera', articles: [], total: 0, ok: true })
    const { default: TopicPage, generateMetadata } = await page()
    expect((await generateMetadata(params('cholera'))).robots).toEqual({ index: false, follow: true })
    render(await TopicPage(params('cholera')))
    expect(screen.getByText('No recent coverage')).toBeTruthy()
  })

  it('a read that did not finish is "unavailable", not "nothing published", and noindex', async () => {
    getTopicTimelineAction.mockResolvedValue({ topic: 'cholera', articles: [], total: 0, ok: false })
    const { default: TopicPage, generateMetadata } = await page()
    expect((await generateMetadata(params('cholera'))).robots).toEqual({ index: false, follow: true })
    render(await TopicPage(params('cholera')))
    expect(screen.getByText('Coverage is temporarily unavailable')).toBeTruthy()
    expect(screen.queryByText('No recent coverage')).toBeNull()
  })

  it('a malformed escape is a 404, not a URIError', async () => {
    const { default: TopicPage, generateMetadata } = await page()
    expect(await generateMetadata(params('%E0%A4%A'))).toEqual({})
    await expect(TopicPage(params('%E0%A4%A'))).rejects.toThrow('NEXT_NOT_FOUND')
    expect(getTopicTimelineAction).not.toHaveBeenCalled()
  })
})
