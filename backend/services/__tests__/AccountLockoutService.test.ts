/**
 * Tests for AccountLockoutService
 * Tests account lockout logic, escalating lockouts, and admin unlock
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AccountLockoutService, LockoutStatus } from '../AccountLockoutService';

// Mock D1Database
const createMockDb = () => {
  const mockStatement = {
    bind: vi.fn().mockReturnThis(),
    first: vi.fn(),
    run: vi.fn(),
  };

  return {
    prepare: vi.fn().mockReturnValue(mockStatement),
    _mockStatement: mockStatement,
  };
};

describe('AccountLockoutService', () => {
  let lockoutService: AccountLockoutService;
  let mockDb: ReturnType<typeof createMockDb>;

  beforeEach(() => {
    mockDb = createMockDb();
    lockoutService = new AccountLockoutService(mockDb as unknown as D1Database);
  });

  describe('getLockoutLevel (internal logic)', () => {
    // Test the lockout level calculation
    const getLockoutLevel = (failedAttempts: number): number => {
      if (failedAttempts >= 20) return 4; // Permanent
      if (failedAttempts >= 15) return 3; // 24 hours
      if (failedAttempts >= 10) return 2; // 1 hour
      if (failedAttempts >= 5) return 1; // 15 minutes
      return 0; // No lockout
    };

    it('should return level 0 for less than 5 attempts', () => {
      expect(getLockoutLevel(0)).toBe(0);
      expect(getLockoutLevel(1)).toBe(0);
      expect(getLockoutLevel(4)).toBe(0);
    });

    it('should return level 1 (15 min) for 5-9 attempts', () => {
      expect(getLockoutLevel(5)).toBe(1);
      expect(getLockoutLevel(7)).toBe(1);
      expect(getLockoutLevel(9)).toBe(1);
    });

    it('should return level 2 (1 hour) for 10-14 attempts', () => {
      expect(getLockoutLevel(10)).toBe(2);
      expect(getLockoutLevel(12)).toBe(2);
      expect(getLockoutLevel(14)).toBe(2);
    });

    it('should return level 3 (24 hours) for 15-19 attempts', () => {
      expect(getLockoutLevel(15)).toBe(3);
      expect(getLockoutLevel(17)).toBe(3);
      expect(getLockoutLevel(19)).toBe(3);
    });

    it('should return level 4 (permanent) for 20+ attempts', () => {
      expect(getLockoutLevel(20)).toBe(4);
      expect(getLockoutLevel(25)).toBe(4);
      expect(getLockoutLevel(100)).toBe(4);
    });
  });

  describe('recordFailedAttempt', () => {
    it('should return unlocked status for non-existent user', async () => {
      mockDb._mockStatement.first.mockResolvedValue(null);

      const result = await lockoutService.recordFailedAttempt('user-123', '192.168.1.1');

      expect(result.isLocked).toBe(false);
      expect(result.lockoutLevel).toBe(0);
      expect(result.failedAttempts).toBe(0);
    });

    it('should return locked status for permanently locked account', async () => {
      mockDb._mockStatement.first.mockResolvedValue({
        failed_login_attempts: 25,
        account_locked_permanently: true,
        account_locked_until: null,
      });

      const result = await lockoutService.recordFailedAttempt('user-123', '192.168.1.1');

      expect(result.isLocked).toBe(true);
      expect(result.isPermanent).toBe(true);
      expect(result.lockoutLevel).toBe(4);
    });

    it('should return locked status for temporarily locked account', async () => {
      const futureDate = new Date(Date.now() + 60000).toISOString();
      mockDb._mockStatement.first.mockResolvedValue({
        failed_login_attempts: 6,
        account_locked_permanently: false,
        account_locked_until: futureDate,
      });

      const result = await lockoutService.recordFailedAttempt('user-123', '192.168.1.1');

      expect(result.isLocked).toBe(true);
      expect(result.isPermanent).toBe(false);
      expect(result.lockedUntil).toBeDefined();
    });

    it('should increment failed attempts and apply level 1 lockout at 5 attempts', async () => {
      mockDb._mockStatement.first.mockResolvedValue({
        failed_login_attempts: 4,
        account_locked_permanently: false,
        account_locked_until: null,
      });
      mockDb._mockStatement.run.mockResolvedValue({ success: true });

      const result = await lockoutService.recordFailedAttempt('user-123', '192.168.1.1');

      expect(result.failedAttempts).toBe(5);
      expect(result.lockoutLevel).toBe(1);
      expect(result.isLocked).toBe(true);
      expect(result.lockedUntil).toBeDefined();
    });

    it('should apply level 2 lockout at 10 attempts', async () => {
      mockDb._mockStatement.first.mockResolvedValue({
        failed_login_attempts: 9,
        account_locked_permanently: false,
        account_locked_until: null,
      });
      mockDb._mockStatement.run.mockResolvedValue({ success: true });

      const result = await lockoutService.recordFailedAttempt('user-123', '192.168.1.1');

      expect(result.failedAttempts).toBe(10);
      expect(result.lockoutLevel).toBe(2);
    });

    it('should apply level 3 lockout at 15 attempts', async () => {
      mockDb._mockStatement.first.mockResolvedValue({
        failed_login_attempts: 14,
        account_locked_permanently: false,
        account_locked_until: null,
      });
      mockDb._mockStatement.run.mockResolvedValue({ success: true });

      const result = await lockoutService.recordFailedAttempt('user-123', '192.168.1.1');

      expect(result.failedAttempts).toBe(15);
      expect(result.lockoutLevel).toBe(3);
    });

    it('should apply permanent lockout at 20 attempts', async () => {
      mockDb._mockStatement.first.mockResolvedValue({
        failed_login_attempts: 19,
        account_locked_permanently: false,
        account_locked_until: null,
      });
      mockDb._mockStatement.run.mockResolvedValue({ success: true });

      const result = await lockoutService.recordFailedAttempt('user-123', '192.168.1.1');

      expect(result.failedAttempts).toBe(20);
      expect(result.lockoutLevel).toBe(4);
      expect(result.isPermanent).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      mockDb._mockStatement.first.mockRejectedValue(new Error('DB error'));

      const result = await lockoutService.recordFailedAttempt('user-123', '192.168.1.1');

      expect(result.isLocked).toBe(false);
      expect(result.failedAttempts).toBe(0);
    });
  });

  describe('checkLockoutStatus', () => {
    it('should return unlocked for non-existent user', async () => {
      mockDb._mockStatement.first.mockResolvedValue(null);

      const result = await lockoutService.checkLockoutStatus('user-123');

      expect(result.isLocked).toBe(false);
    });

    it('should return permanent lockout status', async () => {
      mockDb._mockStatement.first.mockResolvedValue({
        failed_login_attempts: 25,
        account_locked_permanently: true,
        account_locked_until: null,
      });

      const result = await lockoutService.checkLockoutStatus('user-123');

      expect(result.isLocked).toBe(true);
      expect(result.isPermanent).toBe(true);
      expect(result.lockoutLevel).toBe(4);
    });

    it('should return temporary lockout if not yet expired', async () => {
      const futureDate = new Date(Date.now() + 60000).toISOString();
      mockDb._mockStatement.first.mockResolvedValue({
        failed_login_attempts: 6,
        account_locked_permanently: false,
        account_locked_until: futureDate,
      });

      const result = await lockoutService.checkLockoutStatus('user-123');

      expect(result.isLocked).toBe(true);
      expect(result.isPermanent).toBe(false);
    });

    it('should return unlocked if temporary lockout has expired', async () => {
      const pastDate = new Date(Date.now() - 60000).toISOString();
      mockDb._mockStatement.first.mockResolvedValue({
        failed_login_attempts: 6,
        account_locked_permanently: false,
        account_locked_until: pastDate,
      });

      const result = await lockoutService.checkLockoutStatus('user-123');

      expect(result.isLocked).toBe(false);
    });

    it('should handle database errors gracefully', async () => {
      mockDb._mockStatement.first.mockRejectedValue(new Error('DB error'));

      const result = await lockoutService.checkLockoutStatus('user-123');

      expect(result.isLocked).toBe(false);
    });
  });

  describe('resetFailedAttempts', () => {
    it('should reset attempts for non-permanently locked account', async () => {
      mockDb._mockStatement.run.mockResolvedValue({ success: true });

      await lockoutService.resetFailedAttempts('user-123');

      expect(mockDb.prepare).toHaveBeenCalled();
      expect(mockDb._mockStatement.bind).toHaveBeenCalledWith('user-123');
      expect(mockDb._mockStatement.run).toHaveBeenCalled();
    });

    it('should handle database errors gracefully', async () => {
      mockDb._mockStatement.run.mockRejectedValue(new Error('DB error'));

      // Should not throw
      await expect(
        lockoutService.resetFailedAttempts('user-123')
      ).resolves.toBeUndefined();
    });
  });

  describe('unlockAccount', () => {
    it('should unlock account and return true on success', async () => {
      mockDb._mockStatement.run.mockResolvedValue({ success: true });

      const result = await lockoutService.unlockAccount('user-123', 'admin-456');

      expect(result).toBe(true);
      expect(mockDb._mockStatement.run).toHaveBeenCalled();
    });

    it('should return false on database error', async () => {
      mockDb._mockStatement.run.mockRejectedValue(new Error('DB error'));

      const result = await lockoutService.unlockAccount('user-123', 'admin-456');

      expect(result).toBe(false);
    });
  });

  describe('lockout duration calculation', () => {
    it('should set 15 minute lockout for level 1', async () => {
      mockDb._mockStatement.first.mockResolvedValue({
        failed_login_attempts: 4,
        account_locked_permanently: false,
        account_locked_until: null,
      });
      mockDb._mockStatement.run.mockResolvedValue({ success: true });

      const result = await lockoutService.recordFailedAttempt('user-123', '192.168.1.1');

      const expectedMinTime = Date.now() + 14 * 60 * 1000; // 14 minutes
      const expectedMaxTime = Date.now() + 16 * 60 * 1000; // 16 minutes

      expect(result.lockedUntil?.getTime()).toBeGreaterThan(expectedMinTime);
      expect(result.lockedUntil?.getTime()).toBeLessThan(expectedMaxTime);
    });

    it('should set 1 hour lockout for level 2', async () => {
      mockDb._mockStatement.first.mockResolvedValue({
        failed_login_attempts: 9,
        account_locked_permanently: false,
        account_locked_until: null,
      });
      mockDb._mockStatement.run.mockResolvedValue({ success: true });

      const result = await lockoutService.recordFailedAttempt('user-123', '192.168.1.1');

      const expectedMinTime = Date.now() + 59 * 60 * 1000; // 59 minutes
      const expectedMaxTime = Date.now() + 61 * 60 * 1000; // 61 minutes

      expect(result.lockedUntil?.getTime()).toBeGreaterThan(expectedMinTime);
      expect(result.lockedUntil?.getTime()).toBeLessThan(expectedMaxTime);
    });

    it('should set 24 hour lockout for level 3', async () => {
      mockDb._mockStatement.first.mockResolvedValue({
        failed_login_attempts: 14,
        account_locked_permanently: false,
        account_locked_until: null,
      });
      mockDb._mockStatement.run.mockResolvedValue({ success: true });

      const result = await lockoutService.recordFailedAttempt('user-123', '192.168.1.1');

      const expectedMinTime = Date.now() + 23 * 60 * 60 * 1000; // 23 hours
      const expectedMaxTime = Date.now() + 25 * 60 * 60 * 1000; // 25 hours

      expect(result.lockedUntil?.getTime()).toBeGreaterThan(expectedMinTime);
      expect(result.lockedUntil?.getTime()).toBeLessThan(expectedMaxTime);
    });
  });
});
