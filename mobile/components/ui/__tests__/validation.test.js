/**
 * Validation Tests
 * Tests for form validation utility functions
 */

import {
  validateEmail,
  validatePassword,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateURL,
  validatePhone,
  validateNumber,
  composeValidators,
} from '../validation';

describe('Validation Utilities', () => {
  describe('validateEmail', () => {
    it('returns error for empty email', () => {
      expect(validateEmail('')).toBe('Email is required');
      expect(validateEmail(null)).toBe('Email is required');
    });

    it('returns error for invalid email format', () => {
      expect(validateEmail('invalid')).toContain('valid email');
      expect(validateEmail('test@')).toContain('valid email');
      expect(validateEmail('@test.com')).toContain('valid email');
      expect(validateEmail('test@test')).toContain('valid email');
    });

    it('returns null for valid email', () => {
      expect(validateEmail('test@example.com')).toBeNull();
      expect(validateEmail('user+tag@domain.co.uk')).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('returns error for empty password', () => {
      expect(validatePassword('')).toBe('Password is required');
    });

    it('validates minimum length', () => {
      expect(validatePassword('Short1', { minLength: 8 })).toContain('at least 8 characters');
      expect(validatePassword('LongEnough1', { minLength: 8 })).toBeNull();
    });

    it('validates uppercase requirement', () => {
      expect(validatePassword('lowercase1', { requireUppercase: true })).toContain('uppercase');
      expect(validatePassword('Uppercase1', { requireUppercase: true })).toBeNull();
    });

    it('validates lowercase requirement', () => {
      expect(validatePassword('UPPERCASE1', { requireLowercase: true })).toContain('lowercase');
      expect(validatePassword('Lowercase1', { requireLowercase: true })).toBeNull();
    });

    it('validates number requirement', () => {
      expect(validatePassword('NoNumbers', { requireNumber: true })).toContain('number');
      expect(validatePassword('WithNumber1', { requireNumber: true })).toBeNull();
    });

    it('validates special character requirement', () => {
      expect(validatePassword('NoSpecial1', { requireSpecialChar: true })).toContain('special character');
      expect(validatePassword('WithSpecial1!', { requireSpecialChar: true })).toBeNull();
    });
  });

  describe('validateRequired', () => {
    it('returns error for empty values', () => {
      expect(validateRequired('', 'Name')).toBe('Name is required');
      expect(validateRequired(null, 'Email')).toBe('Email is required');
      expect(validateRequired(undefined, 'Phone')).toBe('Phone is required');
      expect(validateRequired('   ', 'Title')).toBe('Title is required');
    });

    it('returns null for valid values', () => {
      expect(validateRequired('Value', 'Field')).toBeNull();
      expect(validateRequired(0, 'Number')).toBeNull();
      expect(validateRequired(false, 'Boolean')).toBeNull();
    });
  });

  describe('validateMinLength', () => {
    it('returns error for short values', () => {
      expect(validateMinLength('abc', 5, 'Username')).toContain('at least 5 characters');
    });

    it('returns null for valid length', () => {
      expect(validateMinLength('abcde', 5, 'Username')).toBeNull();
      expect(validateMinLength('abcdef', 5, 'Username')).toBeNull();
    });

    it('returns null for empty value', () => {
      expect(validateMinLength('', 5, 'Username')).toBeNull();
    });
  });

  describe('validateMaxLength', () => {
    it('returns error for long values', () => {
      expect(validateMaxLength('abcdefghijk', 10, 'Bio')).toContain('at most 10 characters');
    });

    it('returns null for valid length', () => {
      expect(validateMaxLength('abcdefghij', 10, 'Bio')).toBeNull();
      expect(validateMaxLength('abc', 10, 'Bio')).toBeNull();
    });
  });

  describe('validateURL', () => {
    it('returns error for invalid URLs', () => {
      expect(validateURL('')).toBe('URL is required');
      expect(validateURL('not-a-url')).toContain('valid URL');
      expect(validateURL('://example.com')).toContain('valid URL');
    });

    it('returns null for valid URLs', () => {
      expect(validateURL('https://example.com')).toBeNull();
      expect(validateURL('http://localhost:3000')).toBeNull();
      expect(validateURL('https://example.com/path?query=value')).toBeNull();
    });
  });

  describe('validatePhone', () => {
    it('returns error for invalid phone numbers', () => {
      expect(validatePhone('')).toBe('Phone number is required');
      expect(validatePhone('123')).toContain('valid phone number');
    });

    it('returns null for valid phone numbers', () => {
      expect(validatePhone('1234567890')).toBeNull();
      expect(validatePhone('+1 (555) 123-4567')).toBeNull();
      expect(validatePhone('+263 77 123 4567')).toBeNull();
    });
  });

  describe('validateNumber', () => {
    it('returns error for non-numbers', () => {
      expect(validateNumber('')).toContain('enter a number');
      expect(validateNumber('abc')).toContain('valid number');
    });

    it('validates min value', () => {
      expect(validateNumber('5', { min: 10 })).toContain('at least 10');
      expect(validateNumber('15', { min: 10 })).toBeNull();
    });

    it('validates max value', () => {
      expect(validateNumber('15', { max: 10 })).toContain('at most 10');
      expect(validateNumber('5', { max: 10 })).toBeNull();
    });

    it('validates integer requirement', () => {
      expect(validateNumber('5.5', { integer: true })).toContain('whole number');
      expect(validateNumber('5', { integer: true })).toBeNull();
    });

    it('returns null for valid numbers', () => {
      expect(validateNumber('42')).toBeNull();
      expect(validateNumber(42)).toBeNull();
      expect(validateNumber('3.14')).toBeNull();
    });
  });

  describe('composeValidators', () => {
    it('combines multiple validators', () => {
      const validator = composeValidators(
        (v) => validateRequired(v, 'Email'),
        validateEmail
      );

      expect(validator('')).toBe('Email is required');
      expect(validator('invalid')).toContain('valid email');
      expect(validator('test@example.com')).toBeNull();
    });

    it('stops at first error', () => {
      const validator = composeValidators(
        (v) => validateRequired(v, 'Field'),
        (v) => validateMinLength(v, 5, 'Field')
      );

      expect(validator('')).toBe('Field is required');
      expect(validator('abc')).toContain('at least 5 characters');
      expect(validator('abcdef')).toBeNull();
    });
  });
});
