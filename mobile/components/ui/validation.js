/**
 * Validation Utilities - Common validation functions for form inputs
 * Mukoko News - Nyuchi Brand System v6
 */

/**
 * Email validation
 * @param {string} email - Email address to validate
 * @returns {string|null} - Error message or null if valid
 */
export function validateEmail(email) {
  if (!email) {
    return 'Email is required';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }

  return null;
}

/**
 * Password validation
 * @param {string} password - Password to validate
 * @param {object} options - Validation options
 * @returns {string|null} - Error message or null if valid
 */
export function validatePassword(password, options = {}) {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumber = true,
    requireSpecialChar = false,
  } = options;

  if (!password) {
    return 'Password is required';
  }

  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters`;
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter';
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter';
  }

  if (requireNumber && !/\d/.test(password)) {
    return 'Password must contain at least one number';
  }

  if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character';
  }

  return null;
}

/**
 * Required field validation
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} - Error message or null if valid
 */
export function validateRequired(value, fieldName = 'This field') {
  if (value === null || value === undefined || value === '') {
    return `${fieldName} is required`;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return `${fieldName} is required`;
  }

  return null;
}

/**
 * Minimum length validation
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} - Error message or null if valid
 */
export function validateMinLength(value, minLength, fieldName = 'This field') {
  if (!value) {
    return null; // Use validateRequired for required checks
  }

  if (value.length < minLength) {
    return `${fieldName} must be at least ${minLength} characters`;
  }

  return null;
}

/**
 * Maximum length validation
 * @param {string} value - Value to validate
 * @param {number} maxLength - Maximum length
 * @param {string} fieldName - Field name for error message
 * @returns {string|null} - Error message or null if valid
 */
export function validateMaxLength(value, maxLength, fieldName = 'This field') {
  if (!value) {
    return null;
  }

  if (value.length > maxLength) {
    return `${fieldName} must be at most ${maxLength} characters`;
  }

  return null;
}

/**
 * URL validation
 * @param {string} url - URL to validate
 * @returns {string|null} - Error message or null if valid
 */
export function validateURL(url) {
  if (!url) {
    return 'URL is required';
  }

  try {
    new URL(url);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
}

/**
 * Phone number validation (basic)
 * @param {string} phone - Phone number to validate
 * @returns {string|null} - Error message or null if valid
 */
export function validatePhone(phone) {
  if (!phone) {
    return 'Phone number is required';
  }

  // Basic phone validation - at least 10 digits
  const phoneRegex = /^[\d\s\-+()]{10,}$/;
  if (!phoneRegex.test(phone)) {
    return 'Please enter a valid phone number';
  }

  return null;
}

/**
 * Number validation
 * @param {string|number} value - Value to validate
 * @param {object} options - Validation options
 * @returns {string|null} - Error message or null if valid
 */
export function validateNumber(value, options = {}) {
  const { min, max, integer = false } = options;

  if (value === null || value === undefined || value === '') {
    return 'Please enter a number';
  }

  const num = Number(value);

  if (isNaN(num)) {
    return 'Please enter a valid number';
  }

  if (integer && !Number.isInteger(num)) {
    return 'Please enter a whole number';
  }

  if (min !== undefined && num < min) {
    return `Number must be at least ${min}`;
  }

  if (max !== undefined && num > max) {
    return `Number must be at most ${max}`;
  }

  return null;
}

/**
 * Compose multiple validators
 * @param {...Function} validators - Validation functions
 * @returns {Function} - Combined validation function
 */
export function composeValidators(...validators) {
  return (value) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) {
        return error;
      }
    }
    return null;
  };
}
