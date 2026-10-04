import { oauthAuthorizationServerMetadata, AGENT_JSON_HEADERS, authkitMissingResponse } from '@/lib/agent-discovery'

// OAuth 2.0 Authorization Server Metadata (RFC 8414). Mirrors what the gateway
// publishes (issuer = the WORKOS_AUTHKIT_DOMAIN AuthKit domain) so an agent discovering the
// site at news.mukoko.com finds the same authorization server. Served at
// /.well-known/oauth-authorization-server.
export const runtime = 'edge'

export function GET() {
  const metadata = oauthAuthorizationServerMetadata()
  if (!metadata) return authkitMissingResponse()
  return new Response(JSON.stringify(metadata, null, 2), {
    headers: AGENT_JSON_HEADERS,
  })
}
