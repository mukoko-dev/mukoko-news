/**
 * Tests for API Key Authentication Middleware
 * Tests bearer token validation, API secret checking, and JWT detection
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { apiAuth, requireApiKey, optionalApiKey } from '../apiAuth';

// Mock Hono context
const createMockContext = (options: {
  authHeader?: string | null;
  apiSecret?: string | null;
  noApiSecret?: boolean;
} = {}) => {
  const { authHeader = null, apiSecret, noApiSecret = false } = options;

  return {
    req: {
      header: vi.fn((name: string) => {
        if (name === 'Authorization') return authHeader;
        return null;
      }),
    },
    env: {
      // If noApiSecret is true, don't set API_SECRET at all
      // Otherwise use provided apiSecret or default to 'test-api-secret'
      ...(noApiSecret ? {} : { API_SECRET: apiSecret ?? 'test-api-secret' }),
    },
    json: vi.fn((body: any, status?: number) => ({ body, status })),
  };
};

const createMockNext = () => vi.fn().mockResolvedValue('next-called');

describe('apiAuth Middleware', () => {
  describe('extractBearerToken (via middleware behavior)', () => {
    it('should reject requests without Authorization header when required', async () => {
      const c = createMockContext({ authHeader: null });
      const next = createMockNext();
      const middleware = apiAuth({ required: true });

      const result = await middleware(c as any, next);

      expect(c.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Unauthorized',
        }),
        401
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject malformed Authorization header', async () => {
      const c = createMockContext({ authHeader: 'InvalidHeader' });
      const next = createMockNext();
      const middleware = apiAuth({ required: true });

      const result = await middleware(c as any, next);

      expect(c.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Unauthorized',
        }),
        401
      );
    });

    it('should reject Authorization header with wrong type', async () => {
      const c = createMockContext({ authHeader: 'Basic dXNlcjpwYXNz' });
      const next = createMockNext();
      const middleware = apiAuth({ required: true });

      await middleware(c as any, next);

      expect(c.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Unauthorized',
        }),
        401
      );
    });

    it('should accept Bearer token format (case insensitive)', async () => {
      const c = createMockContext({ authHeader: 'bearer test-api-secret' });
      const next = createMockNext();
      const middleware = apiAuth({ required: true });

      await middleware(c as any, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('API Secret Validation', () => {
    it('should accept valid API secret', async () => {
      const c = createMockContext({
        authHeader: 'Bearer test-api-secret',
        apiSecret: 'test-api-secret'
      });
      const next = createMockNext();
      const middleware = apiAuth({ required: true });

      await middleware(c as any, next);

      expect(next).toHaveBeenCalled();
      expect(c.json).not.toHaveBeenCalled();
    });

    it('should reject invalid API secret', async () => {
      const c = createMockContext({
        authHeader: 'Bearer wrong-secret',
        apiSecret: 'test-api-secret'
      });
      const next = createMockNext();
      const middleware = apiAuth({ required: true });

      await middleware(c as any, next);

      expect(c.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Unauthorized',
        }),
        401
      );
    });

    it('should allow requests when API_SECRET is not configured', async () => {
      const c = createMockContext({
        authHeader: null,
        noApiSecret: true  // API_SECRET not in env at all
      });
      const next = createMockNext();
      const middleware = apiAuth({ required: true });

      await middleware(c as any, next);

      // When API_SECRET not configured, allow through (development mode)
      expect(next).toHaveBeenCalled();
    });
  });

  describe('JWT Token Detection', () => {
    it('should accept JWT tokens (3-part structure)', async () => {
      // Valid JWT structure: header.payload.signature
      const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
      const c = createMockContext({
        authHeader: `Bearer ${jwtToken}`,
        apiSecret: 'different-secret'
      });
      const next = createMockNext();
      const middleware = apiAuth({ required: true });

      await middleware(c as any, next);

      // JWT tokens should pass the basic structure check
      expect(next).toHaveBeenCalled();
    });

    it('should reject non-JWT, non-API-secret tokens', async () => {
      const c = createMockContext({
        authHeader: 'Bearer random-token-without-dots',
        apiSecret: 'test-api-secret'
      });
      const next = createMockNext();
      const middleware = apiAuth({ required: true });

      await middleware(c as any, next);

      expect(c.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Unauthorized',
        }),
        401
      );
    });

    it('should accept tokens with exactly 3 parts (JWT format)', async () => {
      const c = createMockContext({
        authHeader: 'Bearer part1.part2.part3',
        apiSecret: 'test-api-secret'
      });
      const next = createMockNext();
      const middleware = apiAuth({ required: true });

      await middleware(c as any, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('Optional Authentication', () => {
    it('should allow requests without token when not required', async () => {
      const c = createMockContext({ authHeader: null });
      const next = createMockNext();
      const middleware = apiAuth({ required: false });

      await middleware(c as any, next);

      expect(next).toHaveBeenCalled();
      expect(c.json).not.toHaveBeenCalled();
    });

    it('should allow requests with invalid token when not required', async () => {
      const c = createMockContext({
        authHeader: 'Bearer invalid-token',
        apiSecret: 'test-api-secret'
      });
      const next = createMockNext();
      const middleware = apiAuth({ required: false });

      await middleware(c as any, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('Response Format', () => {
    it('should return proper error response structure', async () => {
      const c = createMockContext({ authHeader: null });
      const next = createMockNext();
      const middleware = apiAuth({ required: true });

      await middleware(c as any, next);

      expect(c.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Unauthorized',
          message: expect.stringContaining('API key'),
          timestamp: expect.any(String),
        }),
        401
      );
    });

    it('should include ISO timestamp in error response', async () => {
      const c = createMockContext({ authHeader: null });
      const next = createMockNext();
      const middleware = apiAuth({ required: true });

      await middleware(c as any, next);

      const jsonCall = c.json.mock.calls[0];
      const timestamp = jsonCall[0].timestamp;

      // Verify it's a valid ISO date string
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });
  });

  describe('Helper Functions', () => {
    describe('requireApiKey', () => {
      it('should return middleware with required: true', async () => {
        const c = createMockContext({ authHeader: null });
        const next = createMockNext();
        const middleware = requireApiKey();

        await middleware(c as any, next);

        expect(c.json).toHaveBeenCalledWith(
          expect.objectContaining({ error: 'Unauthorized' }),
          401
        );
      });
    });

    describe('optionalApiKey', () => {
      it('should return middleware with required: false', async () => {
        const c = createMockContext({ authHeader: null });
        const next = createMockNext();
        const middleware = optionalApiKey();

        await middleware(c as any, next);

        expect(next).toHaveBeenCalled();
        expect(c.json).not.toHaveBeenCalled();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty Authorization header', async () => {
      const c = createMockContext({ authHeader: '' });
      const next = createMockNext();
      const middleware = apiAuth({ required: true });

      await middleware(c as any, next);

      expect(c.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Unauthorized' }),
        401
      );
    });

    it('should handle Bearer with no token', async () => {
      const c = createMockContext({ authHeader: 'Bearer ' });
      const next = createMockNext();
      const middleware = apiAuth({ required: true });

      await middleware(c as any, next);

      expect(c.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Unauthorized' }),
        401
      );
    });

    it('should handle Bearer with multiple spaces', async () => {
      const c = createMockContext({ authHeader: 'Bearer  token  extra' });
      const next = createMockNext();
      const middleware = apiAuth({ required: true });

      await middleware(c as any, next);

      // Multiple parts after split should fail
      expect(c.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Unauthorized' }),
        401
      );
    });
  });
});
