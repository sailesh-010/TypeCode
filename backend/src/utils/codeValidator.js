/**
 * Code Validation Utility
 * 
 * Validates that generated code matches the requested programming language
 * by checking for language-specific syntax markers and patterns.
 */

// Language-specific syntax markers
const LANGUAGE_MARKERS = {
  'python': {
    required: [
      /\bprint\s*\(/,           // print() function
      /\bdef\s+\w+/,            // function definition
      /\bimport\s+\w+/,         // import statement
      /:\s*$/m,                 // colon at end of line (if/for/def/class)
    ],
    optional: [
      /^\s+/m,                  // indentation (Python uses significant whitespace)
      /\bclass\s+\w+/,          // class definition
      /\bif\s+.*:/,             // if statement
      /\bfor\s+.*:/,            // for loop
      /\bwhile\s+.*:/,          // while loop
      /\breturn\s+/,            // return statement
      /\belif\s+/,              // elif keyword
      /\belse\s*:/,             // else keyword
    ],
    forbidden: [
      /console\.log/,           // JavaScript
      /System\.out\.println/,   // Java
      /std::/,                  // C++
      /printf\s*\(/,            // C
      /\bconst\s+/,             // JavaScript
      /\blet\s+/,               // JavaScript
      /\bvar\s+/,               // JavaScript
      /public\s+class/,         // Java
    ]
  },
  'javascript': {
    required: [
      /console\.log/,           // console.log
      /\b(const|let|var)\s+/,   // variable declarations
      /\bfunction\s+\w+/,       // function declaration
      /=>/,                     // arrow function
    ],
    optional: [
      /\{[\s\S]*\}/,            // curly braces for blocks
      /\breturn\s+/,            // return statement
      /\bif\s*\(/,              // if statement
      /\bfor\s*\(/,             // for loop
      /\bwhile\s*\(/,           // while loop
      /\bclass\s+\w+/,          // class definition
      /async\s+/,               // async keyword
      /await\s+/,               // await keyword
    ],
    forbidden: [
      /\bdef\s+\w+/,            // Python
      /System\.out\.println/,   // Java
      /std::/,                  // C++
      /printf\s*\(/,            // C
      /:\s*$/m,                 // Python-style colons
    ]
  },
  'java': {
    required: [
      /System\.out\.println/,   // System.out.println
      /\bpublic\s+/,            // public keyword
      /\bclass\s+\w+/,          // class definition
      /\bvoid\s+/,              // void keyword
    ],
    optional: [
      /String\[\]/,             // String array
      /\bprivate\s+/,           // private keyword
      /\bstatic\s+/,            // static keyword
      /\bint\s+/,               // int type
      /\breturn\s+/,            // return statement
      /\bif\s*\(/,              // if statement
      /\bfor\s*\(/,             // for loop
      /\bnew\s+\w+/,            // object instantiation
    ],
    forbidden: [
      /console\.log/,           // JavaScript
      /\bdef\s+\w+/,            // Python
      /std::/,                  // C++
      /printf\s*\(/,            // C
      /\bconst\s+/,             // JavaScript
      /\blet\s+/,               // JavaScript
    ]
  },
  'c': {
    required: [
      /printf\s*\(/,            // printf function
      /#include/,               // include directive
      /stdio\.h/,               // stdio.h header
      /int\s+main\s*\(/,        // main function
    ],
    optional: [
      /\bint\s+/,               // int type
      /\bchar\s+/,              // char type
      /\bfloat\s+/,             // float type
      /\bdouble\s+/,            // double type
      /\bvoid\s+/,              // void type
      /\breturn\s+/,            // return statement
      /\bif\s*\(/,              // if statement
      /\bfor\s*\(/,             // for loop
      /\bwhile\s*\(/,           // while loop
    ],
    forbidden: [
      /std::/,                  // C++
      /iostream/,               // C++
      /console\.log/,           // JavaScript
      /System\.out\.println/,   // Java
      /\bdef\s+\w+/,            // Python
      /\bconst\s+/,             // JavaScript (C has const but different usage)
      /\blet\s+/,               // JavaScript
    ]
  },
  'c++': {
    required: [
      /std::/,                  // std namespace
      /cout/,                   // cout stream
      /iostream/,               // iostream header
      /#include/,               // include directive
    ],
    optional: [
      /::/,                     // scope resolution operator
      /\bint\s+/,               // int type
      /\bchar\s+/,              // char type
      /\bvoid\s+/,              // void type
      /\bclass\s+\w+/,          // class definition
      /\breturn\s+/,            // return statement
      /\bif\s*\(/,              // if statement
      /\bfor\s*\(/,             // for loop
      /\bwhile\s*\(/,           // while loop
      /int\s+main\s*\(/,        // main function
    ],
    forbidden: [
      /console\.log/,           // JavaScript
      /System\.out\.println/,   // Java
      /\bdef\s+\w+/,            // Python
      /\bconst\s+/,             // JavaScript
      /\blet\s+/,               // JavaScript
      /stdio\.h/,               // C (not typically used in C++)
    ]
  }
};

/**
 * Detect the programming language of a code snippet
 * @param {string} code - Code snippet to analyze
 * @returns {string|null} - Detected language or null if uncertain
 */
function detectLanguage(code) {
  if (!code || typeof code !== 'string') {
    return null;
  }

  const scores = {};
  const languages = Object.keys(LANGUAGE_MARKERS);

  // Calculate score for each language
  languages.forEach(lang => {
    const markers = LANGUAGE_MARKERS[lang];
    let score = 0;
    let requiredCount = 0;
    let optionalCount = 0;
    let forbiddenCount = 0;

    // Check required markers (high weight)
    markers.required.forEach(pattern => {
      if (pattern.test(code)) {
        requiredCount++;
        score += 3;
      }
    });

    // Check optional markers (medium weight)
    markers.optional.forEach(pattern => {
      if (pattern.test(code)) {
        optionalCount++;
        score += 1;
      }
    });

    // Check forbidden markers (negative weight)
    markers.forbidden.forEach(pattern => {
      if (pattern.test(code)) {
        forbiddenCount++;
        score -= 5;
      }
    });

    // Require at least one required marker to be considered
    if (requiredCount > 0) {
      scores[lang] = {
        score,
        requiredCount,
        optionalCount,
        forbiddenCount
      };
    }
  });

  // Find language with highest score
  let maxScore = -Infinity;
  let detectedLang = null;

  Object.keys(scores).forEach(lang => {
    if (scores[lang].score > maxScore) {
      maxScore = scores[lang].score;
      detectedLang = lang;
    }
  });

  // Return null if score is too low or negative
  if (maxScore <= 0) {
    return null;
  }

  return detectedLang;
}

/**
 * Validate that code matches the expected language
 * @param {string} code - Generated code snippet
 * @param {string} language - Expected language (normalized)
 * @returns {Object} - { isValid: boolean, detectedLanguage: string|null, confidence: number, markers: string[] }
 */
function validateLanguage(code, language) {
  if (!code || typeof code !== 'string') {
    return {
      isValid: false,
      detectedLanguage: null,
      confidence: 0,
      markers: []
    };
  }

  if (!language || typeof language !== 'string') {
    return {
      isValid: false,
      detectedLanguage: null,
      confidence: 0,
      markers: []
    };
  }

  const normalizedLang = language.toLowerCase();
  const markers = LANGUAGE_MARKERS[normalizedLang];

  if (!markers) {
    // Unknown language, cannot validate
    return {
      isValid: false,
      detectedLanguage: null,
      confidence: 0,
      markers: []
    };
  }

  const detectedLang = detectLanguage(code);
  const foundMarkers = [];

  // Count matching markers
  let requiredMatches = 0;
  let optionalMatches = 0;
  let forbiddenMatches = 0;

  markers.required.forEach(pattern => {
    if (pattern.test(code)) {
      requiredMatches++;
      foundMarkers.push(pattern.source);
    }
  });

  markers.optional.forEach(pattern => {
    if (pattern.test(code)) {
      optionalMatches++;
    }
  });

  markers.forbidden.forEach(pattern => {
    if (pattern.test(code)) {
      forbiddenMatches++;
    }
  });

  // Calculate confidence score
  const totalRequired = markers.required.length;
  const totalOptional = markers.optional.length;
  
  // Confidence based on:
  // - Required markers found (70% weight)
  // - Optional markers found (20% weight)
  // - No forbidden markers (10% weight)
  const requiredScore = (requiredMatches / totalRequired) * 0.7;
  const optionalScore = (optionalMatches / totalOptional) * 0.2;
  const forbiddenScore = forbiddenMatches > 0 ? 0 : 0.1;
  
  const confidence = requiredScore + optionalScore + forbiddenScore;

  // Valid if:
  // 1. At least one required marker is present
  // 2. No forbidden markers are present
  // 3. Detected language matches expected language (if detection succeeded)
  // 4. Confidence > 0.6
  const isValid = 
    requiredMatches > 0 &&
    forbiddenMatches === 0 &&
    (detectedLang === null || detectedLang === normalizedLang) &&
    confidence > 0.6;

  return {
    isValid,
    detectedLanguage: detectedLang,
    confidence: Math.min(confidence, 1.0), // Cap at 1.0
    markers: foundMarkers
  };
}

module.exports = {
  validateLanguage,
  detectLanguage,
  LANGUAGE_MARKERS // Export for testing purposes
};
