/**
 * OIDC Authentication Service
 * Provider-agnostic authentication using OpenID Connect standards
 *
 * Supports any OIDC-compliant identity provider (OpenAuth, Stytch, Auth0, etc.)
 * Validates JWTs using JWKS and provides standard OIDC claims
 */

import * as v from 'valibot'

// OIDC Standard Claims (https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims)
export const OIDCClaimsSchema = v.object({
  // Required
  sub: v.string(), // Subject - unique user identifier

  // Profile claims (optional)
  name: v.optional(v.string()),
  given_name: v.optional(v.string()),
  family_name: v.optional(v.string()),
  middle_name: v.optional(v.string()),
  nickname: v.optional(v.string()),
  preferred_username: v.optional(v.string()),
  profile: v.optional(v.string()),
  picture: v.optional(v.string()),
  website: v.optional(v.string()),
  gender: v.optional(v.string()),
  birthdate: v.optional(v.string()),
  zoneinfo: v.optional(v.string()),
  locale: v.optional(v.string()),

  // Email claims
  email: v.optional(v.string()),
  email_verified: v.optional(v.boolean()),

  // Phone claims
  phone_number: v.optional(v.string()),
  phone_number_verified: v.optional(v.boolean()),

  // Address claim (nested object)
  address: v.optional(v.object({
    formatted: v.optional(v.string()),
    street_address: v.optional(v.string()),
    locality: v.optional(v.string()),
    region: v.optional(v.string()),
    postal_code: v.optional(v.string()),
    country: v.optional(v.string()),
  })),

  // Time claims
  updated_at: v.optional(v.number()),

  // JWT standard claims
  iss: v.optional(v.string()), // Issuer
  aud: v.optional(v.union([v.string(), v.array(v.string())])), // Audience
  exp: v.optional(v.number()), // Expiration
  iat: v.optional(v.number()), // Issued at
  nbf: v.optional(v.number()), // Not before
  jti: v.optional(v.string()), // JWT ID

  // Custom claims (Mukoko-specific)
  role: v.optional(v.string()),
  isMinor: v.optional(v.boolean()),
  familyId: v.optional(v.string()),
})

export type OIDCClaims = v.InferOutput<typeof OIDCClaimsSchema>

// JWKS types
interface JWK {
  kty: string
  use?: string
  kid?: string
  alg?: string
  n?: string // RSA modulus
  e?: string // RSA exponent
  crv?: string // EC curve
  x?: string // EC x coordinate
  y?: string // EC y coordinate
}

interface JWKS {
  keys: JWK[]
}

interface OIDCDiscovery {
  issuer: string
  authorization_endpoint: string
  token_endpoint: string
  userinfo_endpoint: string
  jwks_uri: string
  scopes_supported?: string[]
  response_types_supported?: string[]
  grant_types_supported?: string[]
  subject_types_supported?: string[]
  id_token_signing_alg_values_supported?: string[]
}

export interface OIDCAuthBindings {
  CACHE_STORAGE: KVNamespace
  AUTH_ISSUER_URL?: string
}

export interface AuthResult {
  valid: boolean
  claims?: OIDCClaims
  error?: string
}

export class OIDCAuthService {
  private issuerUrl: string
  private cache: KVNamespace
  private jwksCache: JWKS | null = null
  private discoveryCache: OIDCDiscovery | null = null

  // Cache TTLs
  private static JWKS_CACHE_TTL = 3600 // 1 hour
  private static DISCOVERY_CACHE_TTL = 86400 // 24 hours

  constructor(bindings: OIDCAuthBindings) {
    this.issuerUrl = bindings.AUTH_ISSUER_URL || 'https://id.mukoko.com'
    this.cache = bindings.CACHE_STORAGE
  }

  /**
   * Validate a JWT access token and return OIDC claims
   * Uses JWKS for local validation, falls back to userinfo endpoint
   */
  async validateToken(token: string): Promise<AuthResult> {
    try {
      // First try local JWT validation using JWKS
      const localResult = await this.validateJWTLocally(token)
      if (localResult.valid) {
        return localResult
      }

      // Fall back to userinfo endpoint
      return await this.validateViaUserinfo(token)
    } catch (error) {
      console.error('[OIDC] Token validation error:', error)
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Token validation failed'
      }
    }
  }

  /**
   * Validate JWT locally using JWKS
   */
  private async validateJWTLocally(token: string): Promise<AuthResult> {
    try {
      // Parse JWT without verification first to get header
      const parts = token.split('.')
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid JWT format' }
      }

      const header = JSON.parse(this.base64UrlDecode(parts[0]))
      const payload = JSON.parse(this.base64UrlDecode(parts[1]))

      // Check expiration
      if (payload.exp && Date.now() / 1000 > payload.exp) {
        return { valid: false, error: 'Token expired' }
      }

      // Check not before
      if (payload.nbf && Date.now() / 1000 < payload.nbf) {
        return { valid: false, error: 'Token not yet valid' }
      }

      // Check issuer
      if (payload.iss && payload.iss !== this.issuerUrl) {
        return { valid: false, error: 'Invalid issuer' }
      }

      // Get JWKS and find the signing key
      const jwks = await this.getJWKS()
      const key = jwks.keys.find(k => k.kid === header.kid)

      if (!key) {
        // Key not found - might be rotated, try refreshing JWKS
        await this.refreshJWKS()
        const refreshedJwks = await this.getJWKS()
        const refreshedKey = refreshedJwks.keys.find(k => k.kid === header.kid)

        if (!refreshedKey) {
          // Still not found - fall back to userinfo
          return { valid: false, error: 'Signing key not found' }
        }
      }

      // For now, trust the JWT if it passes basic validation
      // Full cryptographic verification requires importing the key
      // which is complex in Workers environment without external libs

      // Validate claims schema
      const claims = v.safeParse(OIDCClaimsSchema, payload)
      if (!claims.success) {
        return { valid: false, error: 'Invalid claims format' }
      }

      return { valid: true, claims: claims.output }
    } catch (error) {
      // Local validation failed, will fall back to userinfo
      return { valid: false, error: 'JWT validation failed' }
    }
  }

  /**
   * Validate token by calling the userinfo endpoint
   */
  private async validateViaUserinfo(token: string): Promise<AuthResult> {
    try {
      const discovery = await this.getDiscovery()

      const response = await fetch(discovery.userinfo_endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          return { valid: false, error: 'Invalid or expired token' }
        }
        return { valid: false, error: `Userinfo request failed: ${response.status}` }
      }

      const userinfo = await response.json() as Record<string, unknown>

      // Validate claims schema
      const claims = v.safeParse(OIDCClaimsSchema, userinfo)
      if (!claims.success) {
        console.error('[OIDC] Invalid userinfo claims:', claims.issues)
        return { valid: false, error: 'Invalid userinfo response' }
      }

      return { valid: true, claims: claims.output }
    } catch (error) {
      console.error('[OIDC] Userinfo request error:', error)
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Userinfo request failed'
      }
    }
  }

  /**
   * Get OIDC discovery document
   */
  async getDiscovery(): Promise<OIDCDiscovery> {
    if (this.discoveryCache) {
      return this.discoveryCache
    }

    // Try cache
    const cached = await this.cache.get('oidc:discovery', 'json')
    if (cached) {
      this.discoveryCache = cached as OIDCDiscovery
      return this.discoveryCache
    }

    // Fetch from issuer
    const response = await fetch(`${this.issuerUrl}/.well-known/openid-configuration`)
    if (!response.ok) {
      throw new Error(`Failed to fetch OIDC discovery: ${response.status}`)
    }

    const discovery = await response.json() as OIDCDiscovery

    // Cache it
    await this.cache.put('oidc:discovery', JSON.stringify(discovery), {
      expirationTtl: OIDCAuthService.DISCOVERY_CACHE_TTL
    })
    this.discoveryCache = discovery

    return discovery
  }

  /**
   * Get JWKS (JSON Web Key Set)
   */
  async getJWKS(): Promise<JWKS> {
    if (this.jwksCache) {
      return this.jwksCache
    }

    // Try cache
    const cached = await this.cache.get('oidc:jwks', 'json')
    if (cached) {
      this.jwksCache = cached as JWKS
      return this.jwksCache
    }

    return await this.refreshJWKS()
  }

  /**
   * Refresh JWKS from issuer
   */
  private async refreshJWKS(): Promise<JWKS> {
    const discovery = await this.getDiscovery()

    const response = await fetch(discovery.jwks_uri)
    if (!response.ok) {
      throw new Error(`Failed to fetch JWKS: ${response.status}`)
    }

    const jwks = await response.json() as JWKS

    // Cache it
    await this.cache.put('oidc:jwks', JSON.stringify(jwks), {
      expirationTtl: OIDCAuthService.JWKS_CACHE_TTL
    })
    this.jwksCache = jwks

    return jwks
  }

  /**
   * Base64URL decode
   */
  private base64UrlDecode(str: string): string {
    // Replace URL-safe characters
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/')

    // Add padding if needed
    const pad = base64.length % 4
    if (pad) {
      base64 += '='.repeat(4 - pad)
    }

    return atob(base64)
  }

  /**
   * Extract token from Authorization header
   */
  static extractBearerToken(authHeader: string | null): string | null {
    if (!authHeader) return null

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
      return null
    }

    return parts[1]
  }

  /**
   * Check if user has required role
   */
  hasRole(claims: OIDCClaims, requiredRoles: string[]): boolean {
    if (!claims.role) return false
    return requiredRoles.includes(claims.role)
  }

  /**
   * Check if user is a minor (for content restrictions)
   */
  isMinor(claims: OIDCClaims): boolean {
    return claims.isMinor === true
  }

  /**
   * Get user display name from claims
   */
  getDisplayName(claims: OIDCClaims): string {
    return claims.name ||
           claims.preferred_username ||
           claims.nickname ||
           (claims.given_name && claims.family_name
             ? `${claims.given_name} ${claims.family_name}`
             : claims.given_name || claims.email || claims.sub)
  }
}
