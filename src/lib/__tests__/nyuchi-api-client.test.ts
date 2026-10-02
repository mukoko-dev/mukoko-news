/**
 * The Nyuchi API client and its switch.
 *
 * What must hold, because each one failing is silent:
 *   - with the gateway unconfigured, NOTHING changes: no request is made and the
 *     direct read runs (merging the migration before its infrastructure exists
 *     must be a no-op);
 *   - `NEWS_DATA_SOURCE=mongo` forces the direct path even when configured;
 *   - a gateway failure (503, timeout, a body with no envelope) falls back to
 *     the direct read instead of becoming an error page or a fabricated zero;
 *   - the internal key travels in headers and never in the URL;
 *   - credentialed reads are `no-store`; public ones carry `next.revalidate`.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockFetch = vi.fn()

function configure() {
  vi.stubEnv('NYUCHI_API_URL', 'https://api.nyuchi.com/')
  vi.stubEnv('NYUCHI_API_CLIENT_ID', 'nyk_news')
  vi.stubEnv('NYUCHI_API_CLIENT_SECRET', 'nys_secret')
}

async function load() {
  return import('../nyuchi-api/client')
}

beforeEach(() => {
  vi.resetModules()
  vi.stubGlobal('fetch', mockFetch)
  vi.stubEnv('NYUCHI_API_URL', '')
  vi.stubEnv('NYUCHI_API_CLIENT_ID', '')
  vi.stubEnv('NYUCHI_API_CLIENT_SECRET', '')
  vi.stubEnv('NEWS_DATA_SOURCE', '')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.clearAllMocks()
  vi.restoreAllMocks()
})

describe('the switch', () => {
  it('defaults to the gateway, but only takes it when configured', async () => {
    const { dataSource, gatewayEnabled } = await load()
    expect(dataSource()).toBe('gateway')
    expect(gatewayEnabled()).toBe(false)
    configure()
    expect(gatewayEnabled()).toBe(true)
  })

  it('NEWS_DATA_SOURCE=mongo forces the direct path even when configured', async () => {
    configure()
    vi.stubEnv('NEWS_DATA_SOURCE', 'MONGO')
    const { gatewayEnabled, viaGateway } = await load()
    expect(gatewayEnabled()).toBe(false)
    const api = vi.fn()
    expect(await viaGateway('t', api, async () => 'direct')).toBe('direct')
    expect(api).not.toHaveBeenCalled()
  })

  it('unconfigured: the direct read runs and no request is made', async () => {
    const { viaGateway } = await load()
    const api = vi.fn()
    expect(await viaGateway('t', api, async () => 'direct')).toBe('direct')
    expect(api).not.toHaveBeenCalled()
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('a gateway failure falls back to the direct read and says so', async () => {
    configure()
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { viaGateway, GatewayError } = await load()
    const result = await viaGateway(
      'analytics.corpus',
      async () => {
        throw new GatewayError('down', 503)
      },
      async () => 'direct'
    )
    expect(result).toBe('direct')
    expect(warn.mock.calls[0][0]).toBe('[gateway-fallback] analytics.corpus (503):')
  })
})

describe('gatewayGet', () => {
  it('sends the key in headers, repeats array params, and drops empties', async () => {
    configure()
    mockFetch.mockResolvedValueOnce(Response.json({ data: { ok: 1 }, meta: { engine: 'doris' } }))
    const { gatewayGet } = await load()
    const body = await gatewayGet(
      '/v1/news/analytics/corpus',
      { q: 'fuel', country: ['ZW', 'NG'], category: [], to: undefined, minQuality: 0.5 },
      { revalidate: 60, tags: ['x'] }
    )
    expect(body.data).toEqual({ ok: 1 })
    const [url, init] = mockFetch.mock.calls[0]
    expect(url).toBe('https://api.nyuchi.com/v1/news/analytics/corpus?q=fuel&country=ZW&country=NG&minQuality=0.5')
    expect(url).not.toContain('nys_secret')
    expect(init.headers['X-Client-Id']).toBe('nyk_news')
    expect(init.headers['X-Client-Secret']).toBe('nys_secret')
    expect(init.next).toEqual({ revalidate: 60, tags: ['x'] })
    expect(init.cache).toBeUndefined()
  })

  it('a credentialed read is no-store', async () => {
    configure()
    mockFetch.mockResolvedValueOnce(Response.json({ data: {}, meta: {} }))
    const { gatewayGet } = await load()
    await gatewayGet('/v1/x', {}, { revalidate: 0 })
    expect(mockFetch.mock.calls[0][1].cache).toBe('no-store')
    expect(mockFetch.mock.calls[0][1].next).toBeUndefined()
  })

  it('a 503 is an error carrying its status, never a value', async () => {
    configure()
    mockFetch.mockResolvedValueOnce(new Response('{"detail":"down"}', { status: 503 }))
    const { gatewayGet, GatewayError } = await load()
    const err = await gatewayGet('/v1/x', {}, { revalidate: 0 }).catch((e) => e)
    expect(err).toBeInstanceOf(GatewayError)
    expect(err.status).toBe(503)
  })

  it('a body without a data envelope is an error', async () => {
    configure()
    mockFetch.mockResolvedValueOnce(Response.json({ total: 0 }))
    const { gatewayGet, GatewayError } = await load()
    await expect(gatewayGet('/v1/x', {}, { revalidate: 0 })).rejects.toBeInstanceOf(GatewayError)
  })

  it('a network failure or timeout is an error', async () => {
    configure()
    mockFetch.mockRejectedValueOnce(new DOMException('timed out', 'TimeoutError'))
    const { gatewayGet, GatewayError } = await load()
    await expect(gatewayGet('/v1/x', {}, { revalidate: 0 })).rejects.toBeInstanceOf(GatewayError)
  })
})
