/**
 * The analytics console, `/insights` and the coverage claim through the Nyuchi
 * API — and back to Atlas when the API cannot answer.
 *
 * The direct MongoDB modules are mocked with spies, so each test can say which
 * path served it. The API is a stubbed `fetch`.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockFetch = vi.fn()
const direct = {
  runCorpusQuery: vi.fn(async () => ({ ok: false, total: 0, source: 'mongo' })),
  runCorpusPreview: vi.fn(async () => ({ answered: false, total: 0, source: 'mongo' })),
  getCoverageConcentration: vi.fn(async () => ({ source: 'mongo' })),
  getQueryFacets: vi.fn(async () => ({ countries: [], categories: [], source: 'mongo' })),
}
const insightsDirect = {
  getCorpusSummary: vi.fn(async () => ({ ok: true, source: 'mongo' })),
  getPublishingVolume: vi.fn(async () => ({ ok: true })),
  getSourceLeaderboard: vi.fn(async () => []),
  getCategoryDistribution: vi.fn(async () => ({ ok: true })),
  getCountryCoverage: vi.fn(async () => ({ total: 0, countries: [] })),
  getSentimentBreakdown: vi.fn(async () => ({ ok: true })),
  getTopTopics: vi.fn(async () => []),
}

function configure() {
  vi.stubEnv('NYUCHI_API_URL', 'https://api.nyuchi.com')
  vi.stubEnv('NYUCHI_API_CLIENT_ID', 'nyk_news')
  vi.stubEnv('NYUCHI_API_CLIENT_SECRET', 'nys_secret')
}

function envelope(data: unknown) {
  return Response.json({ data, meta: { engine: 'doris', asOf: '2026-10-02T11:59:00Z', cached: false } })
}

beforeEach(() => {
  vi.resetModules()
  vi.stubGlobal('fetch', mockFetch)
  vi.stubEnv('NYUCHI_API_URL', '')
  vi.stubEnv('NYUCHI_API_CLIENT_ID', '')
  vi.stubEnv('NYUCHI_API_CLIENT_SECRET', '')
  vi.stubEnv('NEWS_DATA_SOURCE', '')
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  vi.doMock('next/cache', () => ({ unstable_cache: (fn: (...a: unknown[]) => unknown) => fn }))
  vi.doMock('@/lib/auth/guard', () => ({ requireViewer: vi.fn(async () => ({ id: 'u1' })) }))
  vi.doMock('@/lib/mongodb/analytics', () => direct)
  vi.doMock('@/lib/mongodb/insights', () => insightsDirect)
})

afterEach(() => {
  vi.doUnmock('next/cache')
  vi.doUnmock('@/lib/auth/guard')
  vi.doUnmock('@/lib/mongodb/analytics')
  vi.doUnmock('@/lib/mongodb/insights')
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

describe('the console query', () => {
  it('asks the API for the full detail, uncached, and returns its panels', async () => {
    configure()
    mockFetch.mockResolvedValueOnce(envelope({ ok: true, total: 42, exact: true, deepScanned: 42 }))
    const { runCorpusQueryAction } = await import('@/lib/actions/analytics')

    const result = await runCorpusQueryAction({ q: 'fuel', countries: ['ZW'], sampleLimit: 5 })

    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toContain('/v1/news/analytics/corpus?')
    expect(url).toContain('q=fuel')
    expect(url).toContain('country=ZW')
    expect(url).toContain('detail=full')
    expect(url).toContain('sampleLimit=5')
    expect(init.cache).toBe('no-store')
    expect(result).toMatchObject({ ok: true, total: 42, deepFailed: false })
    expect(direct.runCorpusQuery).not.toHaveBeenCalled()
  })

  it('still requires a signed-in viewer before any read', async () => {
    configure()
    vi.doMock('@/lib/auth/guard', () => ({
      requireViewer: vi.fn(async () => {
        throw new Error('NEXT_REDIRECT')
      }),
    }))
    const { runCorpusQueryAction } = await import('@/lib/actions/analytics')
    await expect(runCorpusQueryAction({})).rejects.toThrow('NEXT_REDIRECT')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('falls back to the direct read when the API answers 503', async () => {
    configure()
    mockFetch.mockResolvedValueOnce(new Response('{}', { status: 503 }))
    const { runCorpusQueryAction } = await import('@/lib/actions/analytics')
    const result = await runCorpusQueryAction({ q: 'fuel' })
    expect(result).toMatchObject({ source: 'mongo' })
    expect(direct.runCorpusQuery).toHaveBeenCalledOnce()
  })

  it('makes no request at all when the API is not configured', async () => {
    const { runCorpusQueryAction } = await import('@/lib/actions/analytics')
    await runCorpusQueryAction({})
    expect(mockFetch).not.toHaveBeenCalled()
    expect(direct.runCorpusQuery).toHaveBeenCalledOnce()
  })
})

describe('the anonymous preview', () => {
  it('asks for the preview detail, briefly cacheable', async () => {
    configure()
    mockFetch.mockResolvedValueOnce(envelope({ answered: true, total: 7 }))
    const { runCorpusPreviewAction } = await import('@/lib/actions/analytics')
    const preview = await runCorpusPreviewAction({ countries: ['NG'] })
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toContain('detail=preview')
    expect(init.next).toMatchObject({ revalidate: 60 })
    expect(preview).toMatchObject({ answered: true, total: 7 })
    expect(direct.runCorpusPreview).not.toHaveBeenCalled()
  })
})

describe('coverage concentration', () => {
  it('derives the uncovered list when the API could not read places', async () => {
    configure()
    mockFetch.mockResolvedValueOnce(
      envelope({
        days: 30,
        from: '2026-09-03',
        to: '2026-10-02',
        countries: [{ code: 'ZW', name: 'Zimbabwe', articles: 10, sources: 1, topSourceShare: 100, topSourceName: 'X', hhi: 10000 }],
        uncovered: null,
        singleSourceCount: 1,
      })
    )
    const { getCoverageConcentrationAction } = await import('@/lib/actions/analytics')
    const result = await getCoverageConcentrationAction(30)
    // `null` is "could not read places", never "everything is covered".
    expect(result.uncovered.length).toBeGreaterThan(40)
    expect(result.uncovered.some((c) => c.code === 'ZW')).toBe(false)
  })
})

describe('/insights', () => {
  it('takes the whole bundle from the API in one call', async () => {
    configure()
    mockFetch.mockResolvedValueOnce(
      envelope({
        summary: { ok: true, totalArticles: 150935 },
        volume: { ok: true },
        leaderboard: [],
        categories: { ok: true },
        countries: { total: 0, countries: [] },
        sentiment: { ok: true },
        topics: [{ tag: 'Harare', count: 60 }],
      })
    )
    const { getInsightsBundleAction } = await import('@/lib/actions/insights')
    const bundle = await getInsightsBundleAction()
    expect(mockFetch).toHaveBeenCalledOnce()
    expect(mockFetch.mock.calls[0][0]).toBe('https://api.nyuchi.com/v1/news/analytics/insights')
    expect(bundle.summary).toMatchObject({ totalArticles: 150935 })
    expect(bundle.topics).toEqual([{ tag: 'Harare', count: 60 }])
    expect(typeof bundle.generatedAt).toBe('string')
    expect(insightsDirect.getCorpusSummary).not.toHaveBeenCalled()
  })

  it('falls back to the direct panels when the API is down', async () => {
    configure()
    mockFetch.mockRejectedValueOnce(new TypeError('fetch failed'))
    const { getInsightsBundleAction } = await import('@/lib/actions/insights')
    const bundle = await getInsightsBundleAction()
    expect(bundle.summary).toMatchObject({ source: 'mongo' })
    expect(insightsDirect.getCorpusSummary).toHaveBeenCalledOnce()
  })
})

describe('the coverage claim', () => {
  it('reads per-country coverage from the API when configured', async () => {
    configure()
    vi.doMock('@/lib/mongodb/coverage', () => ({
      getWindowCountries: vi.fn(async () => []),
      LIVE_COUNTRY_MIN_RECENT_ARTICLES: 500,
      LIVE_COUNTRY_WINDOW_DAYS: 30,
    }))
    mockFetch.mockResolvedValueOnce(
      envelope({
        days: 30,
        countries: [
          { code: 'NG', recent: 11019, sources: 71, newsrooms: 70 },
          { code: 'SO', recent: 487, sources: 3, newsrooms: 3 },
        ],
      })
    )
    const { getLiveCoverageAction } = await import('@/lib/actions/coverage')
    const coverage = await getLiveCoverageAction()
    expect(mockFetch.mock.calls[0][0]).toBe('https://api.nyuchi.com/v1/news/analytics/coverage?days=30')
    expect(coverage.codes).toEqual(['NG'])
    expect(coverage.allCountries.map((c) => c.code)).toEqual(['NG', 'SO'])
    expect(coverage.stale).toBe(false)
    vi.doUnmock('@/lib/mongodb/coverage')
  })
})
