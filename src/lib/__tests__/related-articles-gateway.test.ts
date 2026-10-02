/**
 * The article page's related rail through the Nyuchi API.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockFetch = vi.fn()
const getRelatedArticles = vi.fn()

function configure() {
  vi.stubEnv('NYUCHI_API_URL', 'https://api.nyuchi.com')
  vi.stubEnv('NYUCHI_API_CLIENT_ID', 'nyk_news')
  vi.stubEnv('NYUCHI_API_CLIENT_SECRET', 'nys_secret')
}

const DOC = {
  _id: 'b1',
  headline: 'Related story',
  feedSourceId: 'src-herald',
  datePublished: '2026-10-01T09:00:00.000Z',
  createdAt: '2026-10-01T09:00:00.000Z',
  updatedAt: '2026-10-01T09:00:00.000Z',
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
    getRelatedArticles,
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
  return (await import('@/lib/actions/feed')).getRelatedArticlesAction
}

describe('getRelatedArticlesAction', () => {
  it('reads the API, cached an hour per article', async () => {
    configure()
    mockFetch.mockResolvedValueOnce(
      Response.json({ data: { articleId: 'a1', method: 'vector', articles: [DOC], sources: [] }, meta: {} })
    )
    const related = await (await action())('a1', 3)
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('https://api.nyuchi.com/v1/news/articles/a1/related?limit=3')
    expect(init.next).toEqual({ revalidate: 3600, tags: ['related', 'related:a1'] })
    expect(related.map((a) => a.id)).toEqual(['b1'])
    expect(getRelatedArticles).not.toHaveBeenCalled()
  })

  it('a 404 is "no related articles", not a reason to hit Atlas', async () => {
    configure()
    mockFetch.mockResolvedValueOnce(new Response('{}', { status: 404 }))
    expect(await (await action())('gone', 3)).toEqual([])
    expect(getRelatedArticles).not.toHaveBeenCalled()
  })

  it('a 503 falls back to the direct read', async () => {
    configure()
    mockFetch.mockResolvedValueOnce(new Response('{}', { status: 503 }))
    getRelatedArticles.mockResolvedValueOnce([])
    await (await action())('a1', 3)
    expect(getRelatedArticles).toHaveBeenCalledWith('a1', 3)
  })

  it('a double failure is an empty rail, never a thrown error', async () => {
    configure()
    mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'))
    getRelatedArticles.mockRejectedValueOnce(new Error('$vectorSearch rejected'))
    expect(await (await action())('a1', 3)).toEqual([])
  })
})
