/**
 * Language Normalization Utility
 * 
 * Provides centralized language normalization to ensure consistent language key
 * handling across all services. Handles case variations and language aliases.
 */

// Language mappings configuration
const LANGUAGE_MAPPINGS = {
  'python': {
    variations: ['python', 'py'],
    displayName: 'Python'
  },
  'javascript': {
    variations: ['javascript', 'js', 'node', 'nodejs'],
    displayName: 'JavaScript'
  },
  'java': {
    variations: ['java'],
    displayName: 'Java'
  },
  'c': {
    variations: ['c'],
    displayName: 'C'
  },
  'c++': {
    variations: ['c++', 'cpp', 'cplusplus', 'c plus plus'],
    displayName: 'C++'
  }
};

// Build reverse mapping for quick lookup
const variationToNormalizedMap = {};
Object.keys(LANGUAGE_MAPPINGS).forEach(normalizedKey => {
  const { variations } = LANGUAGE_MAPPINGS[normalizedKey];
  variations.forEach(variation => {
    variationToNormalizedMap[variation] = normalizedKey;
  });
});

/**
 * Normalize language name to consistent lowercase key
 * @param {string} language - Raw language name (e.g., "Python", "C++", "cpp")
 * @returns {string} - Normalized language key (e.g., "python", "c++")
 */
function normalizeLanguage(language) {
  if (!language || typeof language !== 'string') {
    return 'javascript'; // Default fallback
  }

  // Convert to lowercase and trim whitespace
  const lowercased = language.toLowerCase().trim();

  // Look up in variation map using hasOwnProperty to avoid prototype pollution
  if (Object.prototype.hasOwnProperty.call(variationToNormalizedMap, lowercased)) {
    return variationToNormalizedMap[lowercased];
  }

  // If not found, return the lowercased version as-is
  // (This handles unknown languages gracefully)
  return lowercased;
}

/**
 * Get display name for a normalized language key
 * @param {string} normalizedKey - Normalized language key
 * @returns {string} - Display name (e.g., "Python", "C++")
 */
function getDisplayName(normalizedKey) {
  if (!normalizedKey || typeof normalizedKey !== 'string') {
    return 'JavaScript'; // Default fallback
  }

  const mapping = LANGUAGE_MAPPINGS[normalizedKey.toLowerCase()];
  
  if (mapping) {
    return mapping.displayName;
  }

  // If not found, capitalize first letter of the key
  return normalizedKey.charAt(0).toUpperCase() + normalizedKey.slice(1);
}

/**
 * Check if a language is supported
 * @param {string} language - Language name to check
 * @returns {boolean} - True if supported
 */
function isSupported(language) {
  if (!language || typeof language !== 'string') {
    return false;
  }

  const normalized = normalizeLanguage(language);
  return Object.prototype.hasOwnProperty.call(LANGUAGE_MAPPINGS, normalized);
}

module.exports = {
  normalizeLanguage,
  getDisplayName,
  isSupported,
  LANGUAGE_MAPPINGS // Export for testing purposes
};
