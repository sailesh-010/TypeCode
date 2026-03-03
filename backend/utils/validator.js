/**
 * Advanced Validation and Sanitization Utilities
 */

class Validator {
  /**
   * Validate that all required fields are present
   */
  static validateRequired(data, requiredFields) {
    const missing = requiredFields.filter(field => !data[field]);
    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Validate data types
   */
  static validateTypes(data, typeMap) {
    const errors = [];
    
    Object.entries(typeMap).forEach(([field, expectedType]) => {
      if (data[field] !== undefined) {
        const actualType = typeof data[field];
        if (actualType !== expectedType) {
          errors.push(`${field} must be of type ${expectedType}, got ${actualType}`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate string length
   */
  static validateLength(str, min, max, fieldName = 'string') {
    if (typeof str !== 'string') {
      return { valid: false, error: `${fieldName} must be a string` };
    }

    if (str.length < min) {
      return { valid: false, error: `${fieldName} must be at least ${min} characters` };
    }

    if (str.length > max) {
      return { valid: false, error: `${fieldName} must not exceed ${max} characters` };
    }

    return { valid: true };
  }

  /**
   * Validate number range
   */
  static validateRange(num, min, max, fieldName = 'number') {
    if (typeof num !== 'number') {
      return { valid: false, error: `${fieldName} must be a number` };
    }

    if (num < min || num > max) {
      return { valid: false, error: `${fieldName} must be between ${min} and ${max}` };
    }

    return { valid: true };
  }

  /**
   * Sanitize and validate email
   */
  static sanitizeAndValidateEmail(email) {
    const sanitized = email?.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return {
      valid: emailRegex.test(sanitized),
      sanitized
    };
  }

  /**
   * Sanitize username (remove special characters except _ and -)
   */
  static sanitizeUsername(username) {
    return username?.trim().replace(/[^a-zA-Z0-9_-]/g, '') || '';
  }

  /**
   * Check for SQL injection patterns
   */
  static checkSQLInjection(input) {
    if (typeof input !== 'string') return false;
    
    const sqlPatterns = [
      /['"|;\\]/g,
      /(-{2})/g,
      /(\/\*|\*\/)/g,
      /(xp_|sp_)/gi
    ];

    return sqlPatterns.some(pattern => pattern.test(input));
  }

  /**
   * Sanitize input to prevent XSS
   */
  static sanitizeXSS(input) {
    if (typeof input !== 'string') return input;
    
    const xssPatterns = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    };

    return input.replace(/[&<>"/']/g, char => xssPatterns[char]);
  }

  /**
   * Validate and parse JSON
   */
  static parseJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      return { valid: true, data: parsed };
    } catch (error) {
      return { valid: false, error: 'Invalid JSON format' };
    }
  }

  /**
   * Validate URL
   */
  static validateURL(url) {
    try {
      new URL(url);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: 'Invalid URL format' };
    }
  }

  /**
   * Validate phone number (basic format)
   */
  static validatePhone(phone) {
    const phoneRegex = /^\+?[\d\s\-()]{7,}$/;
    return phoneRegex.test(phone?.toString() || '');
  }

  /**
   * Bulk sanitize object
   */
  static sanitizeObject(obj, allowedFields = null) {
    const sanitized = {};
    
    Object.entries(obj).forEach(([key, value]) => {
      // Skip if not in allowed fields
      if (allowedFields && !allowedFields.includes(key)) {
        return;
      }

      if (typeof value === 'string') {
        sanitized[key] = this.sanitizeXSS(value.trim());
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (value === null || value === undefined) {
        // Skip null/undefined
      } else {
        // For objects/arrays, just copy
        sanitized[key] = value;
      }
    });

    return sanitized;
  }
}

module.exports = Validator;
