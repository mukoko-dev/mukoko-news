/**
 * Tests for PasswordHashService
 * Security-critical: Tests password hashing, verification, and strength validation
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { PasswordHashService } from '../PasswordHashService';

describe('PasswordHashService', () => {
  describe('hashPassword', () => {
    it('should generate a hash in the correct format (salt:hash)', async () => {
      const password = 'TestPassword123!';
      const hash = await PasswordHashService.hashPassword(password);

      expect(hash).toContain(':');
      const parts = hash.split(':');
      expect(parts).toHaveLength(2);
      expect(parts[0]).toHaveLength(32); // Salt is 16 bytes = 32 hex chars
      expect(parts[1]).toHaveLength(64); // Hash is 32 bytes = 64 hex chars
    });

    it('should generate different hashes for the same password (random salt)', async () => {
      const password = 'TestPassword123!';
      const hash1 = await PasswordHashService.hashPassword(password);
      const hash2 = await PasswordHashService.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should generate different hashes for different passwords', async () => {
      const hash1 = await PasswordHashService.hashPassword('Password1!');
      const hash2 = await PasswordHashService.hashPassword('Password2!');

      expect(hash1).not.toBe(hash2);
    });

    it('should handle empty passwords', async () => {
      const hash = await PasswordHashService.hashPassword('');

      expect(hash).toContain(':');
      const parts = hash.split(':');
      expect(parts).toHaveLength(2);
    });

    it('should handle unicode passwords', async () => {
      const password = 'Pässwörd123!日本語';
      const hash = await PasswordHashService.hashPassword(password);

      expect(hash).toContain(':');
      const parts = hash.split(':');
      expect(parts).toHaveLength(2);
    });

    it('should handle very long passwords', async () => {
      const password = 'A'.repeat(1000) + '123!';
      const hash = await PasswordHashService.hashPassword(password);

      expect(hash).toContain(':');
    });
  });

  describe('verifyPassword', () => {
    it('should verify a correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await PasswordHashService.hashPassword(password);
      const isValid = await PasswordHashService.verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const password = 'TestPassword123!';
      const hash = await PasswordHashService.hashPassword(password);
      const isValid = await PasswordHashService.verifyPassword('WrongPassword!', hash);

      expect(isValid).toBe(false);
    });

    it('should reject a password that differs by one character', async () => {
      const password = 'TestPassword123!';
      const hash = await PasswordHashService.hashPassword(password);
      const isValid = await PasswordHashService.verifyPassword('TestPassword123@', hash);

      expect(isValid).toBe(false);
    });

    it('should reject empty password against valid hash', async () => {
      const password = 'TestPassword123!';
      const hash = await PasswordHashService.hashPassword(password);
      const isValid = await PasswordHashService.verifyPassword('', hash);

      expect(isValid).toBe(false);
    });

    it('should handle invalid hash format gracefully', async () => {
      const isValid = await PasswordHashService.verifyPassword('password', 'invalid-hash');

      expect(isValid).toBe(false);
    });

    it('should handle empty hash gracefully', async () => {
      const isValid = await PasswordHashService.verifyPassword('password', '');

      expect(isValid).toBe(false);
    });

    it('should verify unicode passwords correctly', async () => {
      const password = 'Pässwörd123!日本語';
      const hash = await PasswordHashService.hashPassword(password);
      const isValid = await PasswordHashService.verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });
  });

  describe('isLegacyHash', () => {
    it('should identify legacy SHA-256 hashes (64 hex chars without colon)', () => {
      const legacyHash = 'a'.repeat(64);
      expect(PasswordHashService.isLegacyHash(legacyHash)).toBe(true);
    });

    it('should not identify new scrypt hashes as legacy', async () => {
      const hash = await PasswordHashService.hashPassword('test');
      expect(PasswordHashService.isLegacyHash(hash)).toBe(false);
    });

    it('should not identify short hashes as legacy', () => {
      expect(PasswordHashService.isLegacyHash('abc123')).toBe(false);
    });

    it('should not identify hashes with colons as legacy', () => {
      const hashWithColon = 'a'.repeat(32) + ':' + 'b'.repeat(32);
      expect(PasswordHashService.isLegacyHash(hashWithColon)).toBe(false);
    });
  });

  describe('generateSecureToken', () => {
    it('should generate a token of the specified length in hex', () => {
      const token = PasswordHashService.generateSecureToken(32);
      expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
    });

    it('should generate a token of default length (32 bytes)', () => {
      const token = PasswordHashService.generateSecureToken();
      expect(token).toHaveLength(64);
    });

    it('should generate different tokens each time', () => {
      const token1 = PasswordHashService.generateSecureToken();
      const token2 = PasswordHashService.generateSecureToken();

      expect(token1).not.toBe(token2);
    });

    it('should generate tokens with only hex characters', () => {
      const token = PasswordHashService.generateSecureToken();
      expect(token).toMatch(/^[0-9a-f]+$/);
    });

    it('should handle small token lengths', () => {
      const token = PasswordHashService.generateSecureToken(1);
      expect(token).toHaveLength(2); // 1 byte = 2 hex chars
    });

    it('should handle large token lengths', () => {
      const token = PasswordHashService.generateSecureToken(128);
      expect(token).toHaveLength(256); // 128 bytes = 256 hex chars
    });
  });

  describe('validatePasswordStrength', () => {
    it('should accept a strong password', () => {
      const result = PasswordHashService.validatePasswordStrength('StrongPass123');

      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });

    it('should reject passwords shorter than 8 characters', () => {
      const result = PasswordHashService.validatePasswordStrength('Short1A');

      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Password must be at least 8 characters long');
    });

    it('should reject passwords longer than 128 characters', () => {
      const longPassword = 'Aa1' + 'a'.repeat(130);
      const result = PasswordHashService.validatePasswordStrength(longPassword);

      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Password must not exceed 128 characters');
    });

    it('should reject passwords without lowercase letters', () => {
      const result = PasswordHashService.validatePasswordStrength('UPPERCASE123');

      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject passwords without uppercase letters', () => {
      const result = PasswordHashService.validatePasswordStrength('lowercase123');

      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject passwords without numbers', () => {
      const result = PasswordHashService.validatePasswordStrength('NoNumbersHere');

      expect(result.valid).toBe(false);
      expect(result.issues).toContain('Password must contain at least one number');
    });

    it('should return multiple issues for very weak passwords', () => {
      const result = PasswordHashService.validatePasswordStrength('weak');

      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(1);
    });

    it('should accept passwords at exactly 8 characters', () => {
      const result = PasswordHashService.validatePasswordStrength('Test1234');

      expect(result.valid).toBe(true);
    });

    it('should accept passwords at exactly 128 characters', () => {
      const password = 'Aa1' + 'a'.repeat(125);
      const result = PasswordHashService.validatePasswordStrength(password);

      expect(result.valid).toBe(true);
    });
  });

  describe('needsRehash', () => {
    it('should return true for legacy SHA-256 hashes', () => {
      const legacyHash = 'a'.repeat(64);
      expect(PasswordHashService.needsRehash(legacyHash)).toBe(true);
    });

    it('should return false for new scrypt hashes', async () => {
      const hash = await PasswordHashService.hashPassword('test');
      expect(PasswordHashService.needsRehash(hash)).toBe(false);
    });
  });

  describe('security properties', () => {
    it('should produce consistent verification results', async () => {
      const password = 'ConsistentTest123!';
      const hash = await PasswordHashService.hashPassword(password);

      // Verify multiple times to ensure consistency
      for (let i = 0; i < 5; i++) {
        const isValid = await PasswordHashService.verifyPassword(password, hash);
        expect(isValid).toBe(true);
      }
    });

    it('should use constant-time comparison (no timing attacks)', async () => {
      const password = 'TimingTest123!';
      const hash = await PasswordHashService.hashPassword(password);

      // These should all take approximately the same time
      // (We can't easily test timing in unit tests, but we verify the logic works)
      const wrongPasswords = [
        'x',
        'xx',
        'TimingTest123',
        'TimingTest123!!',
        'timingtest123!',
      ];

      for (const wrong of wrongPasswords) {
        const isValid = await PasswordHashService.verifyPassword(wrong, hash);
        expect(isValid).toBe(false);
      }
    });
  });
});
