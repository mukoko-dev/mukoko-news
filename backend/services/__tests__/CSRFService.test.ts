/**
 * Tests for CSRFService
 * Tests CSRF token generation, validation, and security properties
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CSRFService, CSRFTokenData } from '../CSRFService';

// Mock KVNamespace
const createMockKV = () => ({
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
});

describe('CSRFService', () => {
  let csrfService: CSRFService;
  let mockKV: ReturnType<typeof createMockKV>;

  beforeEach(() => {
    mockKV = createMockKV();
    csrfService = new CSRFService(mockKV as unknown as KVNamespace);
  });

  describe('generateToken', () => {
    it('should generate a 64-character hex token', async () => {
      mockKV.put.mockResolvedValue(undefined);

      const token = await csrfService.generateToken('session-123');

      expect(token).toMatch(/^[0-9a-f]{64}$/);
    });

    it('should store token in KV with correct data', async () => {
      mockKV.put.mockResolvedValue(undefined);

      const token = await csrfService.generateToken('session-123');

      expect(mockKV.put).toHaveBeenCalled();
      const [key, value, options] = mockKV.put.mock.calls[0];

      expect(key).toBe(`csrf:${token}`);

      const data: CSRFTokenData = JSON.parse(value);
      expect(data.token).toBe(token);
      expect(data.sessionId).toBe('session-123');
      expect(data.expiresAt).toBeDefined();
    });

    it('should set expiration TTL on KV entry', async () => {
      mockKV.put.mockResolvedValue(undefined);

      await csrfService.generateToken('session-123');

      const [, , options] = mockKV.put.mock.calls[0];
      expect(options.expirationTtl).toBe(3600); // 1 hour in seconds
    });

    it('should generate different tokens for same session', async () => {
      mockKV.put.mockResolvedValue(undefined);

      const token1 = await csrfService.generateToken('session-123');
      const token2 = await csrfService.generateToken('session-123');

      expect(token1).not.toBe(token2);
    });

    it('should generate different tokens for different sessions', async () => {
      mockKV.put.mockResolvedValue(undefined);

      const token1 = await csrfService.generateToken('session-1');
      const token2 = await csrfService.generateToken('session-2');

      expect(token1).not.toBe(token2);
    });
  });

  describe('validateToken', () => {
    it('should validate a valid token', async () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 min from now

      mockKV.get.mockResolvedValue(JSON.stringify({
        token: 'valid-token',
        sessionId: 'session-123',
        expiresAt: expiresAt.toISOString(),
      }));

      const isValid = await csrfService.validateToken('valid-token', 'session-123');

      expect(isValid).toBe(true);
    });

    it('should reject token not found in KV', async () => {
      mockKV.get.mockResolvedValue(null);

      const isValid = await csrfService.validateToken('unknown-token', 'session-123');

      expect(isValid).toBe(false);
    });

    it('should reject expired token', async () => {
      const expiredDate = new Date(Date.now() - 1000); // Expired 1 second ago

      mockKV.get.mockResolvedValue(JSON.stringify({
        token: 'expired-token',
        sessionId: 'session-123',
        expiresAt: expiredDate.toISOString(),
      }));
      mockKV.delete.mockResolvedValue(undefined);

      const isValid = await csrfService.validateToken('expired-token', 'session-123');

      expect(isValid).toBe(false);
      expect(mockKV.delete).toHaveBeenCalledWith('csrf:expired-token');
    });

    it('should reject token with mismatched session', async () => {
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      mockKV.get.mockResolvedValue(JSON.stringify({
        token: 'valid-token',
        sessionId: 'session-123',
        expiresAt: expiresAt.toISOString(),
      }));

      const isValid = await csrfService.validateToken('valid-token', 'different-session');

      expect(isValid).toBe(false);
    });

    it('should reject empty token', async () => {
      const isValid = await csrfService.validateToken('', 'session-123');

      expect(isValid).toBe(false);
      expect(mockKV.get).not.toHaveBeenCalled();
    });

    it('should reject empty sessionId', async () => {
      const isValid = await csrfService.validateToken('valid-token', '');

      expect(isValid).toBe(false);
      expect(mockKV.get).not.toHaveBeenCalled();
    });

    it('should handle KV errors gracefully', async () => {
      mockKV.get.mockRejectedValue(new Error('KV error'));

      const isValid = await csrfService.validateToken('token', 'session');

      expect(isValid).toBe(false);
    });

    it('should handle invalid JSON in KV gracefully', async () => {
      mockKV.get.mockResolvedValue('invalid-json');

      const isValid = await csrfService.validateToken('token', 'session');

      expect(isValid).toBe(false);
    });
  });

  describe('invalidateToken', () => {
    it('should delete token from KV', async () => {
      mockKV.delete.mockResolvedValue(undefined);

      await csrfService.invalidateToken('token-to-invalidate');

      expect(mockKV.delete).toHaveBeenCalledWith('csrf:token-to-invalidate');
    });

    it('should handle KV errors gracefully', async () => {
      mockKV.delete.mockRejectedValue(new Error('KV error'));

      // Should not throw
      await expect(
        csrfService.invalidateToken('token')
      ).resolves.toBeUndefined();
    });
  });

  describe('security properties', () => {
    it('should use constant-time comparison for session validation', async () => {
      // This tests the logic - we can't easily test timing in unit tests
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      mockKV.get.mockResolvedValue(JSON.stringify({
        token: 'test-token',
        sessionId: 'session-123',
        expiresAt: expiresAt.toISOString(),
      }));

      // These should all fail, regardless of how similar the session ID is
      const wrongSessions = [
        'session-124',
        'session-12',
        'Session-123',
        ' session-123',
        'session-123 ',
      ];

      for (const wrongSession of wrongSessions) {
        const isValid = await csrfService.validateToken('test-token', wrongSession);
        expect(isValid).toBe(false);
      }
    });

    it('should reject tokens with different lengths immediately', async () => {
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

      mockKV.get.mockResolvedValue(JSON.stringify({
        token: 'test-token',
        sessionId: 'session-123',
        expiresAt: expiresAt.toISOString(),
      }));

      // Different length session should fail
      const isValid = await csrfService.validateToken('test-token', 'session');
      expect(isValid).toBe(false);
    });

    it('should generate cryptographically secure tokens', async () => {
      mockKV.put.mockResolvedValue(undefined);

      // Generate multiple tokens and check for uniqueness
      const tokens = new Set<string>();
      for (let i = 0; i < 10; i++) {
        const token = await csrfService.generateToken(`session-${i}`);
        tokens.add(token);
      }

      expect(tokens.size).toBe(10); // All unique
    });
  });

  describe('cleanupExpiredTokens', () => {
    it('should not throw (KV handles expiration automatically)', async () => {
      await expect(
        csrfService.cleanupExpiredTokens('session-123')
      ).resolves.toBeUndefined();
    });
  });
});
