/**
 * Input Validation Utilities
 */

const CONSTANTS = require('./constants');

const validation = {
  /**
   * Validate email format
   */
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate password strength
   */
  isValidPassword: (password) => {
    return password && password.length >= CONSTANTS.VALIDATION.MIN_PASSWORD_LENGTH;
  },

  /**
   * Validate username
   */
  isValidUsername: (username) => {
    if (!username) return false;
    const length = username.length;
    return length >= CONSTANTS.VALIDATION.MIN_USERNAME_LENGTH && 
           length <= CONSTANTS.VALIDATION.MAX_USERNAME_LENGTH &&
           /^[a-zA-Z0-9_-]+$/.test(username);
  },

  /**
   * Validate WPM (Words Per Minute)
   */
  isValidWPM: (wpm) => {
    return typeof wpm === 'number' && 
           wpm >= CONSTANTS.VALIDATION.MIN_WPM && 
           wpm <= CONSTANTS.VALIDATION.MAX_WPM;
  },

  /**
   * Validate accuracy
   */
  isValidAccuracy: (accuracy) => {
    return typeof accuracy === 'number' && 
           accuracy >= CONSTANTS.VALIDATION.MIN_ACCURACY && 
           accuracy <= CONSTANTS.VALIDATION.MAX_ACCURACY;
  },

  /**
   * Validate test type
   */
  isValidTestType: (testType) => {
    return Object.values(CONSTANTS.TEST_TYPES).includes(testType);
  },

  /**
   * Validate duration
   */
  isValidDuration: (duration) => {
    return Object.values(CONSTANTS.DURATIONS).includes(duration);
  },

  /**
   * Sanitize string input
   */
  sanitizeString: (str) => {
    if (typeof str !== 'string') return '';
    return str.trim().replace(/[<>]/g, '');
  },

  /**
   * Validate entire user registration data
   */
  validateRegistration: (data) => {
    const errors = [];

    if (!validation.isValidEmail(data.email)) {
      errors.push(CONSTANTS.ERRORS.INVALID_EMAIL);
    }

    if (!validation.isValidPassword(data.password)) {
      errors.push(CONSTANTS.ERRORS.INVALID_PASSWORD);
    }

    if (!validation.isValidUsername(data.username)) {
      errors.push('Username must be 3-20 characters with letters, numbers, underscore, or hyphen');
    }

    if (!data.fullName || data.fullName.length === 0) {
      errors.push('Full name is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate login data
   */
  validateLogin: (data) => {
    const errors = [];

    if (!validation.isValidEmail(data.email)) {
      errors.push(CONSTANTS.ERRORS.INVALID_EMAIL);
    }

    if (!data.password) {
      errors.push('Password is required');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Validate score data
   */
  validateScore: (data) => {
    const errors = [];

    if (!validation.isValidWPM(data.wpm)) {
      errors.push('Invalid WPM value');
    }

    if (!validation.isValidAccuracy(data.accuracy)) {
      errors.push('Invalid accuracy value');
    }

    if (data.testType && !validation.isValidTestType(data.testType)) {
      errors.push('Invalid test type');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
};

module.exports = validation;
