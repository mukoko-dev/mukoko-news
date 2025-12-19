/**
 * API Key Authentication Middleware
 * Protects public API endpoints with bearer token authentication
 * Used by Vercel frontend and other authorized clients
 */

import { Context, Next } from 'hono';

/**
 * Extract bearer token from Authorization header
 */
function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

/**
 * API Key Authentication Middleware
 * Verifies bearer token is either:
 * 1. A valid OIDC user token (from id.mukoko.com)
 * 2. The API_SECRET (for frontend-to-backend auth)
 *
 * This allows both authenticated users and the frontend app to access the API
 *
 * @param options Configuration options
 * @param options.required If true, returns 401 for missing/invalid token. If false, continues without auth.
 */
export function apiAuth(options: { required?: boolean } = {}) {
  const { required = true } = options;

  return async (c: Context<any>, next: Next) => {
    const authHeader = c.req.header('Authorization');
    const token = extractBearerToken(authHeader);

    // Get API secret from environment
    const apiSecret = c.env.API_SECRET;

    if (!apiSecret) {
      console.error('[API Auth] API_SECRET not configured - API authentication disabled');
      // In development or if secret not set, allow requests to proceed
      return await next();
    }

    // Check if token is valid:
    // 1. Matches API_SECRET (frontend app authentication)
    // 2. Is a JWT token (user OIDC authentication - validated elsewhere)
    const isApiSecret = token && token === apiSecret;
    const isJWT = token && token.split('.').length === 3; // Basic JWT structure check

    const isValid = isApiSecret || isJWT;

    if (!isValid && required) {
      return c.json({
        error: 'Unauthorized',
        message: 'Valid API key or user token required. Include bearer token in Authorization header.',
        timestamp: new Date().toISOString()
      }, 401);
    }

    // Token is valid or not required - continue
    return await next();
  };
}

/**
 * Helper middleware that requires valid API key
 */
export function requireApiKey() {
  return apiAuth({ required: true });
}

/**
 * Helper middleware that allows requests without API key
 * Useful for optional auth where you want to track if client is authorized
 */
export function optionalApiKey() {
  return apiAuth({ required: false });
}
