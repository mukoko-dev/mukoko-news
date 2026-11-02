import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within, fireEvent } from '@testing-library/react'
import AnalyticsPage from '../page'
import type {
  CorpusQueryResult,
  CoverageConcentration,
  QueryFacets,
} from '@/lib/mongodb/analytics'

// Mirrors the one behaviour of `next/link` the console depends on: it handles
// its own click in the bubble phase — preventDefault plus a navigation the
// console's transition cannot see — unless something earlier already
// prevented default.
const mockLinkNavigate = vi.fn()
vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a
      href={href}
      {...props}
      onClick={(e) => {
        if (e.defaultPrevented) return
        e.preventDefault()
        mockLinkNavigate(href)
      }}
    >
      {children}
    </a>
  ),
}))

const mockRedirect = vi.fn((url: string) => {
  // Mirrors next/navigation: redirect() throws to halt rendering.
  throw new Error(`NEXT_REDIRECT:${url}`)
})
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn(), refresh: mockRefresh }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/analytics',
  redirect: (url: string) => mockRedirect(url),
}))

// The console is signed-in only. The guard wraps WorkOS, which cannot resolve
// under jsdom, so it is mocked here and the access rules are asserted directly.
const mockSignedIn = vi.fn()
// The page asks the ACCESS SEAM now, not "is there a session" — so the gate
// and the locked card a reader sees read the same table. The mock follows.
vi.mock('@/lib/auth/guard', () => ({
  isViewerSignedIn: () => mockSignedIn(),
  viewerCanAccess: async () => mockSignedIn(),
}))

// The page reads via Server Actions, so mock the action module (not mongodb/).
const mockRunCorpusQuery = vi.fn()
const mockRunCorpusPreview = vi.fn()
const mockGetQueryFacets = vi.fn()
const mockGetCoverageConcentration = vi.fn()
vi.mock('@/lib/actions/analytics', () => ({
  runCorpusQueryAction: (...args: unknown[]) => mockRunCorpusQuery(...args),
  runCorpusPreviewAction: (...args: unknown[]) => mockRunCorpusPreview(...args),
  getQueryFacetsAction: (...args: unknown[]) => mockGetQueryFacets(...args),
  getCoverageConcentrationAction: (...args: unknown[]) => mockGetCoverageConcentration(...args),
}))

const baseResult: CorpusQueryResult = {
  query: {
    q: 'accident',
    countries: ['ZW'],
    categories: [],
    sources: [],
    from: '2026-08-02',
    to: '2026-08-31',
    sentiments: [],
    minQuality: null,
    days: 30,
  },
  ok: true,
  deepFailed: false,
  total: 412,
  usedSearchIndex: true,
  exact: true,
  deepScanned: 412,
  series: [
    { date: '2026-08-29', count: 10 },
    { date: '2026-08-30', count: 25 },
    { date: '2026-08-31', count: 17 },
  ],
  bySource: [
    { sourceId: 'src-herald', name: 'The Herald', country: 'ZW', count: 220, share: 53.4 },
    { sourceId: 'src-chron', name: 'Chronicle', country: 'ZW', count: 192, share: 46.6 },
  ],
  byCountry: [{ code: 'ZW', name: 'Zimbabwe', count: 412, share: 100 }],
  byCategory: [{ term: 'transport', count: 88 }],
  byKeyword: [
    { term: 'road safety', count: 140 },
    { term: 'kombi', count: 62 },
  ],
  byEntity: [
    { name: 'Harare', type: 'LOCATION', count: 90 },
    { name: 'ZRP', type: 'ORGANIZATION', count: 45 },
  ],
  byAuthor: [],
  bylineCoverage: { covered: 0, coverage: 0 },
  sentiment: {
    positive: 12,
    neutral: 90,
    negative: 140,
    mixed: 8,
    covered: 250,
    coverage: 60.7,
  },
  quality: { avg: 0.62, covered: 250, coverage: 60.7 },
  sample: [
    {
      id: 'a1',
      headline: 'Bus crash on Harare-Bulawayo road',
      description: 'Several injured.',
      source: 'The Herald',
      country: 'ZW',
      publishedAt: '2026-08-31T09:00:00.000Z',
      url: 'https://herald.co.zw/a1',
      sentiment: 'negative',
      qualityScore: 0.71,
    },
  ],
  generatedAt: '2026-09-01T00:00:00.000Z',
}

const baseFacets: QueryFacets = {
  countries: [
    { code: 'ZW', name: 'Zimbabwe', articles: 997 },
    { code: 'NG', name: 'Nigeria', articles: 4729 },
  ],
  categories: [{ slug: 'transport', articles: 300 }],
}

const baseConcentration: CoverageConcentration = {
  days: 30,
  from: '2026-08-02',
  to: '2026-08-31',
  countries: [
    {
      code: 'ZW',
      name: 'Zimbabwe',
      articles: 997,
      sources: 13,
      topSourceShare: 41,
      topSourceName: 'The Herald',
      hhi: 1800,
    },
    {
      code: 'LS',
      name: 'Lesotho',
      articles: 239,
      sources: 1,
      topSourceShare: 100,
      topSourceName: 'Lesotho Times',
      hhi: 10000,
    },
  ],
  uncovered: [{ code: 'BI', name: 'Burundi' }],
  singleSourceCount: 1,
}

async function renderPage(sp: Record<string, string | string[]> = {}) {
  return render(await AnalyticsPage({ searchParams: Promise.resolve(sp) }))
}

describe('AnalyticsPage (query console)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignedIn.mockResolvedValue(true)
    mockRunCorpusQuery.mockResolvedValue(baseResult)
    mockRunCorpusPreview.mockResolvedValue({
      query: baseResult.query,
      answered: true,
      total: 42,
      usedSearchIndex: baseResult.usedSearchIndex,
      series: [],
      bySource: [],
      byCountry: [],
      byCategory: [],
      byKeyword: [],
      sentiment: { positive: 0, neutral: 0, negative: 0, mixed: 0, coverage: 0, covered: 0 },
      generatedAt: '2026-09-19T00:00:00.000Z',
    })
    mockGetQueryFacets.mockResolvedValue(baseFacets)
    mockGetCoverageConcentration.mockResolvedValue(baseConcentration)
  })

  it('forwards the URL query string to the corpus query action', async () => {
    await renderPage({ q: 'accident', country: 'ZW', from: '2026-08-02', to: '2026-08-31' })
    expect(mockRunCorpusQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        q: 'accident',
        countries: ['ZW'],
        from: '2026-08-02',
        to: '2026-08-31',
      })
    )
  })

  it('parses a repeated and a comma-joined country param the same way', async () => {
    await renderPage({ country: ['ZW', 'ZA,KE'] })
    expect(mockRunCorpusQuery).toHaveBeenCalledWith(
      expect.objectContaining({ countries: ['ZW', 'ZA', 'KE'] })
    )
  })

  it('renders the match total and the window it was computed over', async () => {
    await renderPage({ q: 'accident', country: 'ZW' })
    expect(screen.getByText('412 articles')).toBeInTheDocument()
    expect(screen.getByText(/30 days/)).toBeInTheDocument()
  })

  it('ranks topics from AI keywords, not feed categories', async () => {
    await renderPage({ q: 'accident' })
    expect(screen.getByText('road safety')).toBeInTheDocument()
    expect(screen.getByText('kombi')).toBeInTheDocument()
  })

  it('groups named entities by the type enrichment assigned', async () => {
    await renderPage({ q: 'accident' })
    expect(screen.getByText('Places')).toBeInTheDocument()
    expect(screen.getByText('Organizations')).toBeInTheDocument()
    expect(screen.getByText('Harare')).toBeInTheDocument()
  })

  it('states sentiment coverage rather than implying it covers the whole match', async () => {
    await renderPage({ q: 'accident' })
    expect(screen.getByText(/60.7% of the match/)).toBeInTheDocument()
    expect(screen.getByText(/excluded rather than counted as neutral/)).toBeInTheDocument()
  })

  it('says bylines are unavailable instead of ranking an empty list', async () => {
    await renderPage({ q: 'accident' })
    expect(screen.getByText('No bylines on this result')).toBeInTheDocument()
    expect(screen.getByText(/does not currently persist the author field/)).toBeInTheDocument()
  })

  it('reports byline coverage when some articles do carry one', async () => {
    mockRunCorpusQuery.mockResolvedValue({
      ...baseResult,
      byAuthor: [{ name: 'Joshua Jere', count: 3 }],
      bylineCoverage: { covered: 3, coverage: 0.7 },
    })
    await renderPage({ q: 'accident' })
    expect(screen.getByText('Joshua Jere')).toBeInTheDocument()
    expect(screen.getByText(/0.7\s*%\) carry a byline/)).toBeInTheDocument()
  })

  it('flags a country served by a single source', async () => {
    await renderPage({})
    const row = screen.getByText('Lesotho').closest('tr')
    expect(row).not.toBeNull()
    expect(within(row as HTMLElement).getByText('Single source')).toBeInTheDocument()
    expect(within(row as HTMLElement).getByText('100%')).toBeInTheDocument()
  })

  it('names the countries with no coverage at all', async () => {
    await renderPage({})
    expect(screen.getByText('1 countries have no coverage at all')).toBeInTheDocument()
    expect(screen.getByText(/Burundi/)).toBeInTheDocument()
  })

  it('never claims a substring fallback — the console has none', async () => {
    // The old caption "substring match (full-text index unavailable)" fired off
    // `usedSearchIndex: false`, which only the FAILURE result carried. It told
    // the owner the Search index was down when the query had simply timed out.
    mockRunCorpusQuery.mockResolvedValue({ ...baseResult, usedSearchIndex: false })
    await renderPage({ q: 'accident' })
    expect(screen.queryByText(/full-text index unavailable/)).not.toBeInTheDocument()
  })

  describe('a query that did not finish', () => {
    const failed: CorpusQueryResult = {
      ...baseResult,
      ok: false,
      total: 0,
      usedSearchIndex: false,
      series: [],
      bySource: [],
      byCountry: [],
      byKeyword: [],
      byEntity: [],
      sample: [],
    }

    it('says it failed instead of "Nothing matched"', async () => {
      // Regression, 2026-10-02: every signed-in query hit MaxTimeMSExpired and
      // the console reported "0 articles — Nothing matched" over a corpus of
      // 150,935 articles.
      mockRunCorpusQuery.mockResolvedValue(failed)
      await renderPage({ country: 'ZW' })
      expect(screen.getByTestId('analytics-query-failed')).toBeInTheDocument()
      expect(screen.getByText(/this is not an empty result/)).toBeInTheDocument()
      expect(screen.queryByText('Nothing matched')).not.toBeInTheDocument()
      expect(screen.queryByText('0 articles')).not.toBeInTheDocument()
      expect(screen.queryByText('Export CSV')).not.toBeInTheDocument()
    })

    it('offers a retry', async () => {
      mockRunCorpusQuery.mockResolvedValue(failed)
      await renderPage({ country: 'ZW' })
      fireEvent.click(screen.getByRole('button', { name: 'Try again' }))
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  describe('when only the document pass timed out', () => {
    const partial: CorpusQueryResult = {
      ...baseResult,
      deepFailed: true,
      deepScanned: 0,
      byEntity: [],
      byAuthor: [],
      sample: [],
      sentiment: { positive: 0, neutral: 0, negative: 0, mixed: 0, covered: 0, coverage: 0 },
    }

    it('still renders the exact counts', async () => {
      mockRunCorpusQuery.mockResolvedValue(partial)
      await renderPage({ q: 'accident' })
      expect(screen.getByText('412 articles')).toBeInTheDocument()
      expect(screen.getAllByText('The Herald').length).toBeGreaterThan(0)
    })

    it('marks the document-backed panels as timed out, not as empty findings', async () => {
      mockRunCorpusQuery.mockResolvedValue(partial)
      await renderPage({ q: 'accident' })
      expect(screen.getAllByTestId('analytics-deep-timed-out').length).toBeGreaterThanOrEqual(3)
      expect(screen.queryByText('No named entities extracted for this query.')).not.toBeInTheDocument()
      expect(screen.queryByText('No bylines on this result')).not.toBeInTheDocument()
      expect(screen.queryByText(/has been through AI enrichment yet/)).not.toBeInTheDocument()
    })
  })

  describe('while a query is running', () => {
    it('shows a running state on Run, never the previous total', async () => {
      // `push` that never settles keeps the transition pending, which is what
      // a slow server render looks like from the client.
      mockPush.mockImplementation(() => new Promise(() => {}))
      await renderPage({ q: 'accident' })
      fireEvent.submit(screen.getByRole('search'))
      expect(await screen.findByTestId('analytics-query-running')).toBeInTheDocument()
      expect(screen.getByText('Analysing the corpus…')).toBeInTheDocument()
      expect(screen.queryByText('412 articles')).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: /Running/ })).toBeDisabled()
    })

    it('routes a preset through the same transition, so it shows the running state too', async () => {
      mockPush.mockImplementation(() => new Promise(() => {}))
      await renderPage({ q: 'accident' })
      fireEvent.click(screen.getByText('Zimbabwe, all coverage'))
      expect(mockPush).toHaveBeenCalledWith('/analytics?country=ZW')
      // `<Link>` must have stood down, or the navigation would have run outside
      // the transition and the page would show nothing while it waited.
      expect(mockLinkNavigate).not.toHaveBeenCalled()
      expect(await screen.findByTestId('analytics-query-running')).toBeInTheDocument()
    })

    it('leaves links out of the console, and modified clicks, to Link and the browser', async () => {
      await renderPage({ q: 'accident' })
      fireEvent.click(screen.getByText('Insights'))
      fireEvent.click(screen.getByText('Zimbabwe, all coverage'), { metaKey: true })
      expect(mockPush).not.toHaveBeenCalled()
      expect(mockLinkNavigate).toHaveBeenCalledWith('/insights')
    })
  })

  it('carries the active query into the CSV export link', async () => {
    await renderPage({ q: 'accident', country: 'ZW' })
    const link = screen.getByText('Export CSV').closest('a')
    expect(link?.getAttribute('href')).toContain('/api/analytics/export')
    expect(link?.getAttribute('href')).toContain('q=accident')
    expect(link?.getAttribute('href')).toContain('country=ZW')
    expect(link?.getAttribute('href')).toContain('format=csv')
  })

  it('carries source and sentiment filters into the export link', async () => {
    // Regression: exportHref appended only q/country/category/from/to, so
    // arriving via a "Who is covering it" bar (/analytics?source=…) produced an
    // Export CSV link that downloaded the UNFILTERED corpus under a filename
    // implying it was the query on screen. The old test only asserted q and
    // country, so it could not see this.
    mockRunCorpusQuery.mockResolvedValue({
      ...baseResult,
      query: {
        ...baseResult.query,
        sources: ['newsdata-herald'],
        sentiments: ['negative'],
      },
    })
    await renderPage({ source: 'newsdata-herald', sentiment: 'negative' })
    const href = screen.getByText('Export CSV').closest('a')?.getAttribute('href') ?? ''
    expect(href).toContain('source=newsdata-herald')
    expect(href).toContain('sentiment=negative')
  })

  it('shows an empty state, and no export link, when nothing matched', async () => {
    mockRunCorpusQuery.mockResolvedValue({
      ...baseResult,
      total: 0,
      series: [],
      bySource: [],
      byCountry: [],
      byKeyword: [],
      byEntity: [],
      sample: [],
    })
    await renderPage({ q: 'zzzzz' })
    expect(screen.getByText('Nothing matched')).toBeInTheDocument()
    expect(screen.queryByText('Export CSV')).not.toBeInTheDocument()
  })

  /*
   * These three used to assert a redirect to `/sign-in`, and the change that
   * replaced it was deliberate rather than a regression: `/insights` is open and
   * links in here, so the redirect fired at exactly the moment a reader chose to
   * go deeper, and replaced their page with a form that never said what was
   * behind it. The console now previews the reader's own query and asks for the
   * account afterwards.
   *
   * What did NOT change is the part worth keeping: an anonymous visitor must
   * still never reach the expensive read, and their query must still survive the
   * round trip. Both are asserted below against the new shape.
   */
  describe('access', () => {
    beforeEach(() => mockSignedIn.mockResolvedValue(false))

    it('previews for an anonymous visitor instead of turning them away', async () => {
      await renderPage({})
      expect(mockRedirect).not.toHaveBeenCalled()
      expect(mockRunCorpusPreview).toHaveBeenCalled()
    })

    it('preserves the query across the sign-in round trip', async () => {
      // A shared console link must survive signing in, or the analyst lands on a
      // blank console instead of the query they were sent. The return trip is
      // now carried on the unlock link rather than forced on arrival.
      await renderPage({ q: 'accident', country: 'ZW' })
      const cta = screen.getByRole('link', { name: /create a free account/i })
      const returnTo = decodeURIComponent(
        (cta.getAttribute('href') ?? '').split('returnTo=')[1] ?? ''
      )
      expect(returnTo).toContain('q=accident')
      expect(returnTo).toContain('country=ZW')
    })

    /**
     * The one that still matters most. `guard.ts` gates this console partly
     * because it "makes the expensive path reachable without a cost owner", and
     * the preview is only safe because it runs the cheap facet pass instead. If
     * an edit ever points the anonymous branch at the full query, this fails.
     */
    it('never runs the corpus query for an anonymous visitor', async () => {
      await renderPage({ q: 'accident' })
      expect(mockRunCorpusQuery).not.toHaveBeenCalled()
    })
  })

  it('links back to the insights headline view', async () => {
    await renderPage({})
    const link = screen.getByText('Insights').closest('a')
    expect(link).toHaveAttribute('href', '/insights')
  })
})
