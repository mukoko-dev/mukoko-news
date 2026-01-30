/**
 * Tests for RateLimitService
 * Tests rate limiting logic, configurations, and edge cases
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RateLimitService, RateLimitConfig, RateLimitResult } from '../RateLimitService';

// Mock KVNamespace
const createMockKV = () => ({
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
});

describe('RateLimitService', () => {
  let rateLimitService: RateLimitService;
  let mockKV: ReturnType<typeof createMockKV>;
  let testConfig: RateLimitConfig;

  beforeEach(() => {
    mockKV = createMockKV();
    rateLimitService = new RateLimitService(mockKV as unknown as KVNamespace);
    testConfig = {
      maxAttempts: 5,
      windowMs: 15 * 60 * 1000, // 15 minutes
      blockDurationMs: 15 * 60 * 1000, // 15 minutes
    };
  });

  describe('checkRateLimit', () => {
    it('should allow first request when no previous data exists', async () => {
      mockKV.get.mockResolvedValue(null);

      const result = await rateLimitService.checkRateLimit('test-ip', testConfig);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4); // maxAttempts - 1
    });

    it('should allow requests within rate limit', async () => {
      const now = Date.now();
      mockKV.get.mockResolvedValue({
        attempts: 2,
        firstAttempt: now - 1000, // 1 second ago
      });

      const result = await rateLimitService.checkRateLimit('test-ip', testConfig);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2); // 5 - 2 - 1 = 2
    });

    it('should block when rate limit is exceeded', async () => {
      const now = Date.now();
      mockKV.get.mockResolvedValue({
        attempts: 5, // At max
        firstAttempt: now - 1000,
      });

      const result = await rateLimitService.checkRateLimit('test-ip', testConfig);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.retryAfter).toBeDefined();
    });

    it('should honor existing block', async () => {
      const now = Date.now();
      const blockedUntil = now + 60000; // Blocked for 1 more minute
      mockKV.get.mockResolvedValue({
        attempts: 6,
        firstAttempt: now - 10000,
        blockedUntil,
      });

      const result = await rateLimitService.checkRateLimit('test-ip', testConfig);

      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
    });

    it('should reset window when expired', async () => {
      const now = Date.now();
      mockKV.get.mockResolvedValue({
        attempts: 5,
        firstAttempt: now - testConfig.windowMs - 1000, // Window expired
      });

      const result = await rateLimitService.checkRateLimit('test-ip', testConfig);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it('should handle KV errors gracefully (fail open)', async () => {
      mockKV.get.mockRejectedValue(new Error('KV error'));

      const result = await rateLimitService.checkRateLimit('test-ip', testConfig);

      expect(result.allowed).toBe(true); // Fail open
    });
  });

  describe('recordAttempt', () => {
    it('should create new record for first attempt', async () => {
      mockKV.get.mockResolvedValue(null);
      mockKV.put.mockResolvedValue(undefined);

      await rateLimitService.recordAttempt('test-ip', testConfig);

      expect(mockKV.put).toHaveBeenCalled();
      const putCall = mockKV.put.mock.calls[0];
      const data = JSON.parse(putCall[1]);
      expect(data.attempts).toBe(1);
    });

    it('should increment attempts for existing record', async () => {
      const now = Date.now();
      mockKV.get.mockResolvedValue({
        attempts: 2,
        firstAttempt: now - 1000,
      });
      mockKV.put.mockResolvedValue(undefined);

      await rateLimitService.recordAttempt('test-ip', testConfig);

      const putCall = mockKV.put.mock.calls[0];
      const data = JSON.parse(putCall[1]);
      expect(data.attempts).toBe(3);
    });

    it('should set block when max attempts reached', async () => {
      const now = Date.now();
      mockKV.get.mockResolvedValue({
        attempts: 4, // Will become 5 (max)
        firstAttempt: now - 1000,
      });
      mockKV.put.mockResolvedValue(undefined);

      await rateLimitService.recordAttempt('test-ip', testConfig);

      const putCall = mockKV.put.mock.calls[0];
      const data = JSON.parse(putCall[1]);
      expect(data.blockedUntil).toBeDefined();
    });

    it('should start new window if previous expired', async () => {
      const now = Date.now();
      mockKV.get.mockResolvedValue({
        attempts: 5,
        firstAttempt: now - testConfig.windowMs - 1000, // Expired
      });
      mockKV.put.mockResolvedValue(undefined);

      await rateLimitService.recordAttempt('test-ip', testConfig);

      const putCall = mockKV.put.mock.calls[0];
      const data = JSON.parse(putCall[1]);
      expect(data.attempts).toBe(1); // Reset
    });

    it('should handle KV errors gracefully', async () => {
      mockKV.get.mockRejectedValue(new Error('KV error'));

      // Should not throw
      await expect(
        rateLimitService.recordAttempt('test-ip', testConfig)
      ).resolves.toBeUndefined();
    });
  });

  describe('resetRateLimit', () => {
    it('should delete rate limit data', async () => {
      mockKV.delete.mockResolvedValue(undefined);

      await rateLimitService.resetRateLimit('test-ip');

      expect(mockKV.delete).toHaveBeenCalledWith('ratelimit:test-ip');
    });

    it('should handle KV errors gracefully', async () => {
      mockKV.delete.mockRejectedValue(new Error('KV error'));

      await expect(
        rateLimitService.resetRateLimit('test-ip')
      ).resolves.toBeUndefined();
    });
  });

  describe('getLoginConfig', () => {
    it('should return login rate limit configuration', () => {
      const config = RateLimitService.getLoginConfig();

      expect(config.maxAttempts).toBe(5);
      expect(config.windowMs).toBe(15 * 60 * 1000); // 15 minutes
      expect(config.blockDurationMs).toBe(15 * 60 * 1000); // 15 minutes
    });
  });

  describe('getRegistrationConfig', () => {
    it('should return registration rate limit configuration', () => {
      const config = RateLimitService.getRegistrationConfig();

      expect(config.maxAttempts).toBe(3);
      expect(config.windowMs).toBe(60 * 60 * 1000); // 1 hour
      expect(config.blockDurationMs).toBe(60 * 60 * 1000); // 1 hour
    });
  });

  describe('getApiConfig', () => {
    it('should return API rate limit configuration', () => {
      const config = RateLimitService.getApiConfig();

      expect(config.maxAttempts).toBe(100);
      expect(config.windowMs).toBe(60 * 1000); // 1 minute
      expect(config.blockDurationMs).toBe(5 * 60 * 1000); // 5 minutes
    });
  });

  describe('edge cases', () => {
    it('should handle zero attempts remaining', async () => {
      const now = Date.now();
      mockKV.get.mockResolvedValue({
        attempts: 4, // Will have 0 remaining after check
        firstAttempt: now - 1000,
      });

      const result = await rateLimitService.checkRateLimit('test-ip', testConfig);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it('should handle very long identifiers', async () => {
      const longIdentifier = 'ip-' + 'a'.repeat(1000);
      mockKV.get.mockResolvedValue(null);

      const result = await rateLimitService.checkRateLimit(longIdentifier, testConfig);

      expect(result.allowed).toBe(true);
    });

    it('should handle special characters in identifiers', async () => {
      const specialIdentifier = 'user:test@example.com';
      mockKV.get.mockResolvedValue(null);

      const result = await rateLimitService.checkRateLimit(specialIdentifier, testConfig);

      expect(result.allowed).toBe(true);
      expect(mockKV.get).toHaveBeenCalledWith('ratelimit:user:test@example.com', 'json');
    });

    it('should correctly calculate retryAfter when blocked', async () => {
      const now = Date.now();
      const blockedUntil = now + 30000; // 30 seconds remaining
      mockKV.get.mockResolvedValue({
        attempts: 6,
        firstAttempt: now - 60000,
        blockedUntil,
      });

      const result = await rateLimitService.checkRateLimit('test-ip', testConfig);

      expect(result.retryAfter).toBeGreaterThanOrEqual(29);
      expect(result.retryAfter).toBeLessThanOrEqual(31);
    });
  });
});
