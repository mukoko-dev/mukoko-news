/**
 * The Nyuchi API (`api.nyuchi.com/v1`) — the one read path this app is moving to.
 *
 * WHY
 * ---
 * On 2026-10-02 this app's direct MongoDB reads saturated the Atlas cluster
 * that ingestion writes to: the analytics console timed out on every query and
 * `/topic/[slug]` returned ~21.6k 500s in a day. The agreed architecture
 * (nyuchi/api-gateway `docs/architecture/data-access.md`) puts the API gateway
 * in front of the data — Doris for aggregation and search, MongoDB for single
 * records, cached and rate limited there — and makes this app a thin client of
 * the same `/v1` contracts the super apps will use.
 *
 * THE SWITCH, AND WHY MERGING THIS CHANGES NOTHING ON ITS OWN
 * ----------------------------------------------------------
 * `NEWS_DATA_SOURCE` picks the path: `gateway` (the default) or `mongo`. The
 * gateway path is taken only when it is CONFIGURED — `NYUCHI_API_URL` plus the
 * internal key pair `NYUCHI_API_CLIENT_ID` / `NYUCHI_API_CLIENT_SECRET`. With
 * any of those unset, every read runs exactly as it did before. And when the
 * gateway is configured but a call fails, `viaGateway` falls back to the
 * direct read for that call and logs `[gateway-fallback]`, so a gateway outage
 * degrades to today's behaviour instead of to an error page.
 *
 * The fallback is a migration aid, not a design: once a path has been clean
 * for two weeks it is deleted, and with the last one goes this app's
 * `MONGODB_URI`.
 *
 * SERVER ONLY. The key pair is a first-party credential; it is read from
 * server env and must never reach a client bundle. Import this only from
 * Server Actions, Server Components and Route Handlers.
 */

export type DataSource = 'gateway' | 'mongo'

/** `NEWS_DATA_SOURCE`, defaulting to the gateway. Anything unrecognised is the default. */
export function dataSource(): DataSource {
  return process.env.NEWS_DATA_SOURCE?.trim().toLowerCase() === 'mongo' ? 'mongo' : 'gateway'
}

interface GatewayConfig {
  baseUrl: string
  clientId: string
  clientSecret: string
}

function config(): GatewayConfig | null {
  const baseUrl = process.env.NYUCHI_API_URL?.trim().replace(/\/+$/, '')
  const clientId = process.env.NYUCHI_API_CLIENT_ID?.trim()
  const clientSecret = process.env.NYUCHI_API_CLIENT_SECRET?.trim()
  if (!baseUrl || !clientId || !clientSecret) return null
  return { baseUrl, clientId, clientSecret }
}

/** True when reads should go to the gateway: selected AND configured. */
export function gatewayEnabled(): boolean {
  return dataSource() === 'gateway' && config() !== null
}

/** The gateway answered, but not with data. Carries the status so callers can tell 503 from 401. */
export class GatewayError extends Error {
  constructor(
    message: string,
    readonly status: number | null,
  ) {
    super(message)
    this.name = 'GatewayError'
  }
}

export interface GatewayEnvelope<T> {
  data: T
  meta: {
    engine?: string
    asOf?: string | null
    cached?: boolean
    [key: string]: unknown
  }
}

export type QueryValue = string | number | null | undefined | ReadonlyArray<string>

export interface GatewayGetOptions {
  /**
   * Next.js data-cache lifetime for this response, in seconds. `0` means
   * `no-store`: use it for credentialed or per-request answers.
   */
  revalidate: number
  /** Cache tags, so a future `revalidateTag` can drop them. */
  tags?: string[]
  /** Whole-call budget. A slow gateway falls back rather than holding the render. */
  timeoutMs?: number
}

/** Build `?a=1&b=x&b=y` — arrays repeat the key, empties are omitted. */
export function buildQuery(params: Record<string, QueryValue>): string {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      for (const v of value) if (v) qs.append(key, v)
    } else {
      qs.append(key, String(value))
    }
  }
  const s = qs.toString()
  return s ? `?${s}` : ''
}

/**
 * GET a `/v1` path and return its `{data, meta}` envelope.
 *
 * Throws `GatewayError` for a missing configuration, a non-2xx (the gateway
 * answers 503 rather than an empty 200 when it cannot count), a timeout, or a
 * body that is not an envelope. It never returns a placeholder: a value that
 * comes back from here was produced by the API.
 */
export async function gatewayGet<T>(
  path: string,
  params: Record<string, QueryValue>,
  options: GatewayGetOptions,
): Promise<GatewayEnvelope<T>> {
  const cfg = config()
  if (!cfg) throw new GatewayError('Nyuchi API is not configured', null)

  const url = `${cfg.baseUrl}${path}${buildQuery(params)}`
  let res: Response
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Client-Id': cfg.clientId,
        'X-Client-Secret': cfg.clientSecret,
      },
      signal: AbortSignal.timeout(options.timeoutMs ?? 8000),
      ...(options.revalidate > 0
        ? { next: { revalidate: options.revalidate, tags: options.tags } }
        : { cache: 'no-store' as const }),
    })
  } catch (error) {
    throw new GatewayError(`GET ${path} failed: ${(error as Error)?.name ?? 'Error'}`, null)
  }

  if (!res.ok) {
    await res.body?.cancel()
    throw new GatewayError(`GET ${path} answered ${res.status}`, res.status)
  }

  let body: unknown
  try {
    body = await res.json()
  } catch {
    throw new GatewayError(`GET ${path} returned a body that is not JSON`, res.status)
  }
  if (!body || typeof body !== 'object' || !('data' in body)) {
    throw new GatewayError(`GET ${path} returned no data envelope`, res.status)
  }
  return body as GatewayEnvelope<T>
}

/**
 * Run `viaApi` when the gateway is enabled, else `direct`; if `viaApi` throws,
 * log it and run `direct` instead.
 *
 * `name` is the read being migrated, so the logs say which path fell back and
 * how often — the evidence for deleting the fallback, or for not doing so yet.
 */
export async function viaGateway<T>(
  name: string,
  viaApi: () => Promise<T>,
  direct: () => Promise<T>,
): Promise<T> {
  if (!gatewayEnabled()) return direct()
  try {
    return await viaApi()
  } catch (error) {
    const status = error instanceof GatewayError ? error.status : null
    console.warn(`[gateway-fallback] ${name}${status ? ` (${status})` : ''}:`, (error as Error)?.message)
    return direct()
  }
}
