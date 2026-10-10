/**
 * The article page's reads through the Nyuchi API, keeping the page's
 * three-valued contract: present, absent (404), could-not-look (never a 404 —
 * that would be a deindex signal for a live article).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockFetch = vi.fn()
const getArticleById = vi.fn()
const articleExists = vi.fn()

function configure() {
  vi.stubEnv('NYUCHI_API_URL', 'https://api.nyuchi.com')
  vi.stubEnv('NYUCHI_API_CLIENT_ID', 'nyk_news')
  vi.stubEnv('NYUCHI_API_CLIENT_SECRET', 'nys_secret')
}

const DETAIL = {
  article: {
    _id: 'a1',
    headline: 'Cyclone warning',
    description: 'Met office…',
    articleBodyProcessed: '<p>Full text</p>',
    articleBodyMarkdown: '# Full text',
    feedSourceId: 'src-herald',
    mediaOrganizationId: 'org-1',
    datePublished: '2026-10-01T09:00:00.000Z',
    createdAt: '2026-10-01T09:00:00.000Z',
    updatedAt: '2026-10-01T10:00:00.000Z',
  },
  source: { _id: 'src-herald', name: 'The Herald', countryCode: 'ZW', createdAt: '2025-01-01T00:00:00.000Z' },
  publisher: { _id: 'org-1', name: 'Zimpapers', url: 'https://zimpapers.example', isVerified: true },
}

beforeEach(() => {
  vi.resetModules()
  vi.stubGlobal('fetch', mockFetch)
  vi.stubEnv('NYUCHI_API_URL', '')
  vi.stubEnv('NYUCHI_API_CLIENT_ID', '')
  vi.stubEnv('NYUCHI_API_CLIENT_SECRET', '')
  vi.stubEnv('NEWS_DATA_SOURCE', '')
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.doMock('@/lib/mongodb/articles', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@/lib/mongodb/articles')>()),
    getArticleById,
    articleExists,
  }))
})

afterEach(() => {
  vi.doUnmock('@/lib/mongodb/articles')
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

async function load() {
  return import('@/lib/article-read')
}

describe('getArticleDetail', () => {
  it('reads the API and builds the full article with its source and newsroom', async () => {
    configure()
    mockFetch.mockResolvedValueOnce(Response.json({ data: DETAIL, meta: {} }))
    const article = await (await load()).getArticleDetail('a1')

    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('https://api.nyuchi.com/v1/news/articles/a1/detail')
    expect(init.next).toEqual({ revalidate: 300, tags: ['article', 'article:a1'] })
    expect(article?.title).toBe('Cyclone warning')
    expect(article?.content_markdown).toBe('# Full text')
    expect(article?.source).toBe('The Herald')
    expect(article?.country).toBe('ZW')
    expect(article?.publisher).toMatchObject({ id: 'org-1', name: 'Zimpapers', isVerified: true })
    expect(getArticleById).not.toHaveBeenCalled()
  })

  it('the API 404 (missing, or moderated out) is null, with no Atlas read', async () => {
    configure()
    mockFetch.mockResolvedValueOnce(new Response('{}', { status: 404 }))
    expect(await (await load()).getArticleDetail('gone')).toBeNull()
    expect(getArticleById).not.toHaveBeenCalled()
  })

  it('a 503 falls back to the direct read', async () => {
    configure()
    mockFetch.mockResolvedValueOnce(new Response('{}', { status: 503 }))
    getArticleById.mockResolvedValueOnce(null)
    await (await load()).getArticleDetail('a1')
    expect(getArticleById).toHaveBeenCalledWith('a1')
  })

  it('unconfigured: the direct read, no request', async () => {
    getArticleById.mockResolvedValueOnce(null)
    await (await load()).getArticleDetail('a1')
    expect(mockFetch).not.toHaveBeenCalled()
    expect(getArticleById).toHaveBeenCalledOnce()
  })
})

describe('getArticleExists', () => {
  it('true / false from the API, and the direct check when the API cannot answer', async () => {
    configure()
    mockFetch
      .mockResolvedValueOnce(Response.json({ data: DETAIL, meta: {} }))
      .mockResolvedValueOnce(new Response('{}', { status: 404 }))
      .mockResolvedValueOnce(new Response('{}', { status: 503 }))
    articleExists.mockResolvedValueOnce(null)
    const { getArticleExists } = await load()
    expect(await getArticleExists('a1')).toBe(true)
    expect(await getArticleExists('gone')).toBe(false)
    // Could not look either way: null, which the page does NOT turn into a 404.
    expect(await getArticleExists('a1')).toBeNull()
    expect(articleExists).toHaveBeenCalledOnce()
  })
})
