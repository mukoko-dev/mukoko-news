/**
 * The /topic/[slug] read: through the Nyuchi API, back to Atlas if the API
 * cannot answer, and NEVER a thrown error.
 *
 * On 2026-10-02 this action was the one feed read without `safeRead`; its
 * timeouts reached the page as ~21.6k HTTP 500s a day, and ISR never caches a
 * thrown render, so every crawler retry paid the full scan again.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockFetch = vi.fn()
const getTopicTimeline = vi.fn()

function configure() {
  vi.stubEnv('NYUCHI_API_URL', 'https://api.nyuchi.com')
  vi.stubEnv('NYUCHI_API_CLIENT_ID', 'nyk_news')
  vi.stubEnv('NYUCHI_API_CLIENT_SECRET', 'nys_secret')
}

const DOC = {
  _id: 'art-1',
  headline: 'Cholera cases rise in Harare',
  description: 'Health officials report…',
  feedSourceId: 'src-herald',
  datePublished: '2026-10-01T09:00:00.000Z',
  createdAt: '2026-10-01T09:05:00.000Z',
  updatedAt: '2026-10-01T10:00:00.000Z',
  externalUrl: 'https://herald.example/cholera',
  engagement: { interest_categories: ['health'], tags: ['cholera'] },
}
const SOURCE = {
  _id: 'src-herald',
  name: 'The Herald',
  countryCode: 'ZW',
  sourceUrl: 'https://herald.example',
  lastSuccessfulFetchAt: '2026-10-02T06:00:00.000Z',
  createdAt: '2025-01-01T00:00:00.000Z',
}

beforeEach(() => {
  vi.resetModules()
  vi.stubGlobal('fetch', mockFetch)
  vi.stubEnv('NYUCHI_API_URL', '')
  vi.stubEnv('NYUCHI_API_CLIENT_ID', '')
  vi.stubEnv('NYUCHI_API_CLIENT_SECRET', '')
  vi.stubEnv('NEWS_DATA_SOURCE', '')
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
  vi.doMock('next/cache', () => ({ unstable_cache: (fn: (...a: unknown[]) => unknown) => fn }))
  vi.doMock('next/headers', () => ({ cookies: vi.fn() }))
  vi.doMock('@/lib/mongodb/articles', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/lib/mongodb/articles')>()),
    getTopicTimeline,
  }))
})

afterEach(() => {
  vi.doUnmock('next/cache')
  vi.doUnmock('next/headers')
  vi.doUnmock('@/lib/mongodb/articles')
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

async function action() {
  return (await import('@/lib/actions/feed')).getTopicTimelineAction
}

describe('getTopicTimelineAction', () => {
  it('reads the API, cached per slug, and builds cards with the shared mapper', async () => {
    configure()
    mockFetch.mockResolvedValueOnce(
      Response.json({ data: { topic: 'cholera', days: 30, total: 41, articles: [DOC], sources: [SOURCE] }, meta: {} })
    )
    const result = await (await action())('Cholera')

    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('https://api.nyuchi.com/v1/news/topics/cholera/articles?days=30&limit=100')
    expect(init.next).toEqual({ revalidate: 300, tags: ['topic', 'topic:cholera'] })
    expect(result.ok).toBe(true)
    expect(result.total).toBe(41)
    expect(result.articles).toHaveLength(1)
    const card = result.articles[0]
    expect(card.id).toBe('art-1')
    expect(card.source).toBe('The Herald')
    expect(card.country).toBe('ZW')
    expect(card.published_at).toBe('2026-10-01T09:00:00.000Z')
    expect(card.updated_at).toBe('2026-10-01T10:00:00.000Z')
    expect(getTopicTimeline).not.toHaveBeenCalled()
  })

  it('falls back to the direct read when the API answers 503', async () => {
    configure()
    mockFetch.mockResolvedValueOnce(new Response('{}', { status: 503 }))
    getTopicTimeline.mockResolvedValueOnce({ articles: [], total: 0 })
    const result = await (await action())('cholera')
    expect(getTopicTimeline).toHaveBeenCalledWith('cholera', { days: 30 })
    expect(result).toMatchObject({ ok: true, total: 0 })
  })

  it('never throws: a read that fails both ways is ok:false, not a 500', async () => {
    configure()
    mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'))
    getTopicTimeline.mockRejectedValueOnce(new Error('operation exceeded time limit'))
    const result = await (await action())('cholera')
    expect(result).toEqual({ topic: 'cholera', articles: [], total: 0, ok: false })
  })

  it('also never throws on the direct path alone', async () => {
    getTopicTimeline.mockRejectedValueOnce(new Error('MaxTimeMSExpired'))
    const result = await (await action())('cholera')
    expect(result.ok).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('a slug that is not a topic touches no store', async () => {
    configure()
    const result = await (await action())("robert'); drop")
    expect(result).toMatchObject({ articles: [], total: 0, ok: true })
    expect(mockFetch).not.toHaveBeenCalled()
    expect(getTopicTimeline).not.toHaveBeenCalled()
  })
})

describe('articlesFromApi', () => {
  it('revives dates and survives malformed documents', async () => {
    const { articlesFromApi } = await import('@/lib/mongodb/articles')
    const cards = articlesFromApi(
      [DOC, null, { _id: 42 }, { ...DOC, _id: 'no-dates', datePublished: 'nonsense', createdAt: undefined, updatedAt: undefined }],
      [SOURCE]
    )
    expect(cards.map((c) => c.id)).toEqual(['art-1'])
  })

  it('falls back to datePublished when createdAt/updatedAt are missing', async () => {
    const { articlesFromApi } = await import('@/lib/mongodb/articles')
    const [card] = articlesFromApi([{ ...DOC, createdAt: undefined, updatedAt: undefined }], [])
    expect(card.updated_at).toBe('2026-10-01T09:00:00.000Z')
    expect(card.source).toBe('src-herald')
  })
})
