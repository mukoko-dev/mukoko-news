/**
 * Shared constants for the agent-discovery surface (the `/.well-known/*` +
 * `/auth.md` + WebMCP endpoints that make news.mukoko.com discoverable to AI
 * agents). Values mirror the REAL config the gateway already advertises:
 *  - the MCP server lives at news.mukoko.dev/mcp (nyuchi/mukoko-news-gateway),
 *  - the OAuth authorization server is WorkOS AuthKit, read from the
 *    WORKOS_AUTHKIT_DOMAIN env var (set per environment, never hardcoded — the
 *    same value the gateway's /.well-known/oauth-authorization-server reads).
 * Keep these in sync with `index.ts` in the gateway if that config changes.
 */

/** The public site (this app). */
export const SITE_URL = 'https://news.mukoko.com'
/** The product API + MCP host (gateway). */
export const GATEWAY_URL = 'https://news.mukoko.dev'
/** The MCP JSON-RPC endpoint. */
export const MCP_ENDPOINT = `${GATEWAY_URL}/mcp`
/** Message used whenever the AuthKit domain is required and unset. */
export const AUTHKIT_DOMAIN_MISSING = 'WORKOS_AUTHKIT_DOMAIN is not configured'

/**
 * Parse — never concatenate — a configured AuthKit domain into an https origin.
 *
 * Accepts a bare host or an https origin, in any case. Any path, query or
 * fragment is dropped. A blank value, `http:`, any other scheme, embedded
 * credentials and anything `URL` cannot parse all throw an error whose message
 * starts with `AUTHKIT_DOMAIN_MISSING`. The result is `URL.origin`.
 */
export function normaliseAuthkitDomain(value: string | undefined): string {
  const raw = value?.trim()
  if (!raw) throw new Error(AUTHKIT_DOMAIN_MISSING)
  let url: URL
  try {
    url = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`)
  } catch {
    throw new Error(`${AUTHKIT_DOMAIN_MISSING} (not a valid host or URL)`)
  }
  if (url.protocol !== 'https:' || url.username || url.password) {
    throw new Error(`${AUTHKIT_DOMAIN_MISSING} (must be an https origin)`)
  }
  return url.origin
}

/**
 * WorkOS AuthKit issuer (the OAuth/OIDC authorization server), from
 * configuration only — `WORKOS_AUTHKIT_DOMAIN`, set per environment. No
 * compiled-in default. Parsed by `normaliseAuthkitDomain`; `null` when unset
 * or unusable (http, another scheme, credentials, unparseable), and callers
 * answer 503.
 */
export function oauthIssuer(): string | null {
  try {
    return normaliseAuthkitDomain(process.env.WORKOS_AUTHKIT_DOMAIN)
  } catch {
    return null
  }
}

/** 503 for discovery documents when the AuthKit domain is not configured. */
export function authkitMissingResponse(): Response {
  return new Response(JSON.stringify({ error: AUTHKIT_DOMAIN_MISSING }), {
    status: 503,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })
}
/** The public MCP OAuth client id (PKCE, no secret) — mirrors WORKOS_MCP_CLIENT_ID. */
export const MCP_CLIENT_ID = 'client_01KV2GGE5A7WRSFPWZ5HQJ3FNZ'

/**
 * OAuth 2.0 Authorization Server Metadata (RFC 8414) — mirrors the gateway.
 * `null` when WORKOS_AUTHKIT_DOMAIN is unset.
 */
export function oauthAuthorizationServerMetadata() {
  const issuer = oauthIssuer()
  if (!issuer) return null
  return {
    issuer,
    authorization_endpoint: new URL('/oauth2/authorize', issuer).href,
    token_endpoint: new URL('/oauth2/token', issuer).href,
    jwks_uri: new URL('/oauth2/jwks', issuer).href,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    scopes_supported: ['openid', 'profile', 'email'],
    client_id: MCP_CLIENT_ID,
  }
}

/** JSON response headers for a public, cacheable, agent-readable metadata document. */
export const AGENT_JSON_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Cache-Control': 'public, max-age=3600, s-maxage=3600',
}
