/**
 * `/v1/news/analytics/*` — the analytics console, `/insights` and the coverage
 * claim, answered by the API gateway from Doris instead of this app's direct
 * Atlas reads.
 *
 * The gateway returns the same shapes `src/lib/mongodb/analytics.ts`,
 * `insights.ts` and `coverage.ts` produce (it owns the same domain rules now —
 * normalisation, topic hygiene, coverage concentration), so each function here
 * is a typed fetch plus the few adjustments listed at its definition, and the
 * pages render either path unchanged.
 *
 * Every function throws on failure (see `gatewayGet`); the callers in
 * `src/lib/actions/*` wrap them in `viaGateway`, which falls back to the direct
 * read. Nothing here returns a placeholder.
 *
 * SERVER ONLY — see `./client`.
 */

import { COUNTRIES } from '@/lib/constants'
import type {
  CorpusPreview,
  CorpusQueryParams,
  CorpusQueryResult,
  CoverageConcentration,
  QueryFacets,
} from '@/lib/mongodb/analytics'
import type { CoveredCountry } from '@/lib/mongodb/coverage'
import type {
  CategoryDistribution,
  CorpusSummary,
  CountryCoverage,
  PublishingVolume,
  SentimentBreakdown,
  SourceLeaderboardRow,
  TopTopic,
} from '@/lib/mongodb/insights'
import { gatewayGet, type QueryValue } from './client'

const BASE = '/v1/news/analytics'

/** The corpus query as `/corpus` query-string parameters. */
export function corpusParams(params: CorpusQueryParams): Record<string, QueryValue> {
  return {
    q: params.q,
    country: params.countries ?? [],
    category: params.categories ?? [],
    source: params.sources ?? [],
    from: params.from,
    to: params.to,
    sentiment: params.sentiments ?? [],
    minQuality: params.minQuality,
  }
}

/**
 * The signed-in console. `detail=full` needs a credential at the gateway; the
 * app sends its internal key AFTER `requireViewer()` has checked the reader,
 * so the gateway's gate and this app's gate are two locks on one door.
 *
 * Uncached here (`no-store`): the query is arbitrary, the answer is
 * credentialed, and the gateway caches it for a minute on its side.
 */
export async function fetchCorpusQuery(params: CorpusQueryParams): Promise<CorpusQueryResult> {
  const { data } = await gatewayGet<CorpusQueryResult>(
    `${BASE}/corpus`,
    { ...corpusParams(params), detail: 'full', sampleLimit: params.sampleLimit },
    { revalidate: 0, timeoutMs: 9000 },
  )
  // The gateway computes every panel over the whole match, so it never sets
  // the two flags the Atlas path needed for its partial passes; default them
  // rather than trust that every deploy sends them.
  return { ...data, ok: data.ok ?? true, deepFailed: data.deepFailed ?? false }
}

/** The anonymous preview: counts and shares only. Public, so briefly cacheable. */
export async function fetchCorpusPreview(params: CorpusQueryParams): Promise<CorpusPreview> {
  const { data } = await gatewayGet<CorpusPreview>(
    `${BASE}/corpus`,
    { ...corpusParams(params), detail: 'preview' },
    { revalidate: 60, tags: ['analytics-preview'], timeoutMs: 9000 },
  )
  return data
}

export async function fetchQueryFacets(days: number): Promise<QueryFacets> {
  const { data } = await gatewayGet<QueryFacets>(`${BASE}/facets`, { days }, { revalidate: 600, tags: ['analytics-facets'] })
  return data
}

interface ConcentrationWire extends Omit<CoverageConcentration, 'uncovered'> {
  /** `null` when the gateway could not read the places SSOT. */
  uncovered: CoverageConcentration['uncovered'] | null
}

export async function fetchCoverageConcentration(days: number): Promise<CoverageConcentration> {
  const { data } = await gatewayGet<ConcentrationWire>(
    `${BASE}/concentration`,
    { days },
    { revalidate: 600, tags: ['analytics-facets'] },
  )
  // `null` means the gateway could not read `places`, NOT that every country
  // is covered. Derive the gap from this app's own list rather than render an
  // empty one, which would read as "no uncovered countries".
  const uncovered =
    data.uncovered ??
    COUNTRIES.filter((c) => !data.countries.some((row) => row.code === c.code)).map((c) => ({
      code: c.code,
      name: c.name,
    }))
  return { ...data, uncovered }
}

/** Per-country volume, sources and newsrooms over the window (the coverage claim's input). */
export async function fetchWindowCountries(days: number): Promise<CoveredCountry[]> {
  const { data } = await gatewayGet<{ days: number; countries: CoveredCountry[] }>(
    `${BASE}/coverage`,
    { days },
    { revalidate: 3600, tags: ['coverage'] },
  )
  return data.countries
}

export interface InsightsPanels {
  summary: CorpusSummary
  volume: PublishingVolume
  leaderboard: SourceLeaderboardRow[]
  categories: CategoryDistribution
  countries: CountryCoverage
  sentiment: SentimentBreakdown
  topics: TopTopic[]
}

/**
 * The `/insights` open-data bundle. Each panel carries its own `ok`; a panel
 * the gateway could not answer arrives `ok: false`, and the page already
 * renders that as "unavailable" rather than as an empty corpus.
 */
export async function fetchInsightsPanels(): Promise<InsightsPanels> {
  const { data } = await gatewayGet<InsightsPanels>(`${BASE}/insights`, {}, { revalidate: 600, tags: ['insights'] })
  return data
}
