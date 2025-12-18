/**
 * OIDC Authentication Middleware for Hono
 * Provider-agnostic authentication using OpenID Connect standards
 */

import { Context, MiddlewareHandler } from 'hono'
import { OIDCAuthService, OIDCClaims } from '../services/OIDCAuthService.js'

// Extend Hono context with user claims
declare module 'hono' {
  interface ContextVariableMap {
    user: OIDCClaims | null
    userId: string | null
    isAuthenticated: boolean
  }
}

export interface AuthMiddlewareOptions {
  /** Require authentication (returns 401 if not authenticated) */
  required?: boolean
  /** Required roles (returns 403 if user doesn't have one of these roles) */
  roles?: string[]
  /** Block minors from accessing this route */
  blockMinors?: boolean
}

/**
 * Create OIDC authentication middleware
 *
 * Usage:
 * ```typescript
 * // Optional auth - sets user if token present
 * app.use('/api/*', oidcAuth())
 *
 * // Required auth - returns 401 if no valid token
 * app.get('/api/user/profile', oidcAuth({ required: true }), handler)
 *
 * // Role-based auth
 * app.get('/api/admin/*', oidcAuth({ required: true, roles: ['admin', 'super_admin'] }), handler)
 *
 * // Block minors
 * app.post('/api/comment', oidcAuth({ required: true, blockMinors: true }), handler)
 * ```
 */
export function oidcAuth(options: AuthMiddlewareOptions = {}): MiddlewareHandler {
  const { required = false, roles = [], blockMinors = false } = options

  return async (c: Context, next) => {
    // Initialize context variables
    c.set('user', null)
    c.set('userId', null)
    c.set('isAuthenticated', false)

    // Get auth service
    const authService = new OIDCAuthService({
      CACHE_STORAGE: c.env.CACHE_STORAGE,
      AUTH_ISSUER_URL: c.env.AUTH_ISSUER_URL
    })

    // Extract token from Authorization header
    const authHeader = c.req.header('Authorization')
    const token = OIDCAuthService.extractBearerToken(authHeader)

    if (!token) {
      if (required) {
        return c.json({
          error: 'Authentication required',
          code: 'UNAUTHORIZED'
        }, 401)
      }
      return next()
    }

    // Validate token
    const result = await authService.validateToken(token)

    if (!result.valid || !result.claims) {
      if (required) {
        return c.json({
          error: result.error || 'Invalid token',
          code: 'INVALID_TOKEN'
        }, 401)
      }
      return next()
    }

    // Set user in context
    c.set('user', result.claims)
    c.set('userId', result.claims.sub)
    c.set('isAuthenticated', true)

    // Check role requirements
    if (roles.length > 0) {
      if (!authService.hasRole(result.claims, roles)) {
        return c.json({
          error: 'Insufficient permissions',
          code: 'FORBIDDEN',
          requiredRoles: roles
        }, 403)
      }
    }

    // Check minor restriction
    if (blockMinors && authService.isMinor(result.claims)) {
      return c.json({
        error: 'This feature is not available for users under 18',
        code: 'MINOR_RESTRICTED'
      }, 403)
    }

    return next()
  }
}

/**
 * Require authentication middleware (shorthand)
 */
export function requireAuth(): MiddlewareHandler {
  return oidcAuth({ required: true })
}

/**
 * Require admin role middleware (shorthand)
 */
export function requireAdmin(): MiddlewareHandler {
  return oidcAuth({
    required: true,
    roles: ['admin', 'super_admin', 'moderator']
  })
}

/**
 * Require super admin role middleware (shorthand)
 */
export function requireSuperAdmin(): MiddlewareHandler {
  return oidcAuth({
    required: true,
    roles: ['super_admin']
  })
}

/**
 * Get current user from context (type-safe helper)
 */
export function getCurrentUser(c: Context): OIDCClaims | null {
  return c.get('user')
}

/**
 * Get current user ID from context (type-safe helper)
 */
export function getCurrentUserId(c: Context): string | null {
  return c.get('userId')
}

/**
 * Check if request is authenticated (type-safe helper)
 */
export function isAuthenticated(c: Context): boolean {
  return c.get('isAuthenticated')
}
