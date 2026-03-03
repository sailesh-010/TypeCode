/**
 * Application Constants
 */

module.exports = {
  // User Roles
  ROLES: {
    ADMIN: 'admin',
    USER: 'user',
    MODERATOR: 'moderator'
  },

  // Test Types
  TEST_TYPES: {
    STANDARD: 'standard',
    TIMED: 'timed',
    PRACTICE: 'practice',
    CHALLENGE: 'challenge'
  },

  // Test Durations
  DURATIONS: {
    THIRTY_SECONDS: 30,
    ONE_MINUTE: 60,
    TWO_MINUTES: 120,
    FIVE_MINUTES: 300,
    TEN_MINUTES: 600
  },

  // Validation Rules
  VALIDATION: {
    MIN_USERNAME_LENGTH: 3,
    MAX_USERNAME_LENGTH: 20,
    MIN_PASSWORD_LENGTH: 6,
    MAX_PASSWORD_LENGTH: 128,
    MIN_WPM: 0,
    MAX_WPM: 300,
    MIN_ACCURACY: 0,
    MAX_ACCURACY: 100
  },

  // Error Messages
  ERRORS: {
    INVALID_EMAIL: 'Invalid email format',
    INVALID_PASSWORD: 'Password must be at least 6 characters',
    USER_EXISTS: 'User already exists',
    USER_NOT_FOUND: 'User not found',
    INVALID_CREDENTIALS: 'Invalid email or password',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    SERVER_ERROR: 'Internal server error'
  },

  // Success Messages
  SUCCESS: {
    REGISTRATION: 'Registration successful',
    LOGIN: 'Login successful',
    LOGOUT: 'Logout successful',
    PROFILE_UPDATED: 'Profile updated successfully',
    SCORE_RECORDED: 'Score recorded successfully'
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
  }
};
