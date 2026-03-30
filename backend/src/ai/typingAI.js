/**
 * Typing Practice AI Module
 * Provides intelligent feedback, exercises, and analysis for typing practice
 * Integrates with Google Gemini API for advanced NLP capabilities
 */

const config = require('../../config');
const logger = require('../../utils/logger');
const { normalizeLanguage, getDisplayName } = require('../utils/languageNormalizer');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

class TypingAI {
  constructor() {
    this.apiKey = config.google?.apiKey;
    this.model = 'gemini-2.5-flash';
  }

  /**
   * Generate personalized typing feedback based on performance
   * @param {Object} performanceData - { wpm, accuracy, language, duration, errors }
   * @returns {Promise<Object>} - Feedback and suggestions
   */
  async generatePersonalizedFeedback(performanceData) {
    try {
      const { wpm, accuracy, language, duration, errors } = performanceData;

      if (!this.apiKey) {
        return this.generateLocalFeedback(performanceData);
      }

      const prompt = `
You are a typing coach AI. Analyze this typing performance and provide constructive feedback:
- Language: ${language}
- WPM (Words Per Minute): ${wpm}
- Accuracy: ${accuracy}%
- Duration: ${duration} seconds
- Common errors: ${errors?.join(', ') || 'None recorded'}

Provide:
1. A brief performance assessment (1-2 sentences)
2. 2-3 specific, actionable improvement suggestions
3. A motivational message

Format your response as JSON with keys: assessment, suggestions (array), motivation
`;

      const response = await this.callGeminiAPI(prompt);
      
      try {
        return JSON.parse(response);
      } catch {
        return {
          assessment: response,
          suggestions: this.generateSuggestions(accuracy, wpm),
          motivation: 'Keep practicing! Every session makes you better.'
        };
      }
    } catch (error) {
      logger.error('Feedback generation error:', error);
      return this.generateLocalFeedback(performanceData);
    }
  }

  /**
   * Generate typing exercises for different languages and difficulty levels
   * @param {string} language - Programming language (python, javascript, java, c, cpp)
   * @param {string} difficulty - easy, medium, hard
   * @returns {Promise<Object>} - Exercise data
   */
  async generateExercise(language, difficulty = 'medium') {
    try {
      // Normalize language parameter before use
      const normalizedLang = normalizeLanguage(language);
      const displayName = getDisplayName(normalizedLang);

      if (!this.apiKey) {
        return this.generateLocalExercise(normalizedLang, difficulty);
      }

      const prompt = `
Generate a ${difficulty} difficulty typing exercise for ${displayName} programming.
The exercise should:
1. Be realistic code that a developer would type
2. Be 1-3 lines of code
3. Include proper syntax and formatting
4. Be suitable for typing practice

Return ONLY the code snippet, nothing else.
`;

      const exercise = await this.callGeminiAPI(prompt);
      
      return {
        success: true,
        exercise: exercise.trim(),
        language: displayName,
        difficulty,
        wordCount: exercise.split(/\s+/).length,
        characterCount: exercise.length
      };
    } catch (error) {
      logger.error('Exercise generation error:', error);
      return this.generateLocalExercise(normalizeLanguage(language), difficulty);
    }
  }

  /**
   * Analyze typing patterns and provide insights
   * @param {Array} scores - Array of score objects with wpm, accuracy, language
   * @returns {Object} - Analysis and recommendations
   */
  analyzeTypingPatterns(scores) {
    try {
      if (!scores || scores.length === 0) {
        return {
          success: false,
          error: 'No scores to analyze'
        };
      }

      // Calculate statistics by language
      const languageStats = {};
      scores.forEach(score => {
        const lang = score.language || 'general';
        if (!languageStats[lang]) {
          languageStats[lang] = {
            scores: [],
            avgWPM: 0,
            avgAccuracy: 0,
            maxWPM: 0,
            minWPM: Infinity
          };
        }
        languageStats[lang].scores.push(score);
        languageStats[lang].maxWPM = Math.max(languageStats[lang].maxWPM, score.wpm);
        languageStats[lang].minWPM = Math.min(languageStats[lang].minWPM, score.wpm);
      });

      // Calculate averages
      Object.keys(languageStats).forEach(lang => {
        const stats = languageStats[lang];
        stats.avgWPM = Math.round(
          stats.scores.reduce((sum, s) => sum + s.wpm, 0) / stats.scores.length
        );
        stats.avgAccuracy = Math.round(
          stats.scores.reduce((sum, s) => sum + s.accuracy, 0) / stats.scores.length
        );
      });

      // Overall statistics
      const allWPMs = scores.map(s => s.wpm);
      const allAccuracies = scores.map(s => s.accuracy);
      const overallAvgWPM = Math.round(allWPMs.reduce((a, b) => a + b) / allWPMs.length);
      const overallAvgAccuracy = Math.round(allAccuracies.reduce((a, b) => a + b) / allAccuracies.length);

      // Calculate trend
      const trend = this.calculateTrend(scores);

      // Get recommendations
      const recommendations = this.getRecommendations(
        overallAvgWPM,
        overallAvgAccuracy,
        trend,
        languageStats
      );

      return {
        success: true,
        analysis: {
          overall: {
            averageWPM: overallAvgWPM,
            averageAccuracy: overallAvgAccuracy,
            totalPractices: scores.length,
            trend
          },
          byLanguage: languageStats,
          recommendations,
          strengths: this.identifyStrengths(languageStats),
          areasForImprovement: this.identifyWeaknesses(languageStats)
        }
      };
    } catch (error) {
      logger.error('Pattern analysis error:', error);
      return {
        success: false,
        error: 'Failed to analyze patterns'
      };
    }
  }

  /**
   * Calculate typing trend from recent scores
   */
  calculateTrend(scores) {
    if (scores.length < 2) return 'stable';

    const recent = scores.slice(0, Math.min(5, scores.length));
    const older = scores.slice(Math.max(0, scores.length - 5));

    const recentAvg = recent.reduce((sum, s) => sum + s.wpm, 0) / recent.length;
    const olderAvg = older.reduce((sum, s) => sum + s.wpm, 0) / older.length;

    const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;

    if (percentChange > 5) return 'improving';
    if (percentChange < -5) return 'declining';
    return 'stable';
  }

  /**
   * Identify user's strengths
   */
  identifyStrengths(languageStats) {
    const strengths = [];

    Object.entries(languageStats).forEach(([lang, stats]) => {
      if (stats.avgAccuracy >= 95) {
        strengths.push(`Excellent accuracy in ${lang}`);
      }
      if (stats.avgWPM >= 80) {
        strengths.push(`High speed in ${lang}`);
      }
    });

    return strengths.length > 0 ? strengths : ['Keep practicing to build strengths'];
  }

  /**
   * Identify areas for improvement
   */
  identifyWeaknesses(languageStats) {
    const weaknesses = [];

    Object.entries(languageStats).forEach(([lang, stats]) => {
      if (stats.avgAccuracy < 85) {
        weaknesses.push(`Improve accuracy in ${lang} (currently ${stats.avgAccuracy}%)`);
      }
      if (stats.avgWPM < 40) {
        weaknesses.push(`Increase speed in ${lang} (currently ${stats.avgWPM} WPM)`);
      }
    });

    return weaknesses;
  }

  /**
   * Get personalized recommendations
   */
  getRecommendations(avgWPM, avgAccuracy, trend, languageStats) {
    const recommendations = [];

    // Accuracy-based recommendations
    if (avgAccuracy < 80) {
      recommendations.push({
        priority: 'high',
        message: 'Focus on accuracy first. Slow down and practice carefully.',
        action: 'Try easy difficulty exercises'
      });
    } else if (avgAccuracy < 90) {
      recommendations.push({
        priority: 'medium',
        message: 'Good progress! Improve accuracy to 95%+ for better results.',
        action: 'Practice medium difficulty exercises'
      });
    }

    // Speed-based recommendations
    if (avgWPM < 40) {
      recommendations.push({
        priority: 'high',
        message: 'Build typing speed with consistent practice.',
        action: 'Practice daily for 15-30 minutes'
      });
    } else if (avgWPM < 60) {
      recommendations.push({
        priority: 'medium',
        message: 'You are making good progress! Keep pushing for higher speeds.',
        action: 'Try harder difficulty exercises'
      });
    }

    // Trend-based recommendations
    if (trend === 'declining') {
      recommendations.push({
        priority: 'high',
        message: 'Your performance is declining. Take a break and come back refreshed.',
        action: 'Rest and practice tomorrow'
      });
    } else if (trend === 'improving') {
      recommendations.push({
        priority: 'low',
        message: 'Great! You are improving. Keep up the momentum!',
        action: 'Continue with current difficulty'
      });
    }

    // Language-specific recommendations
    const slowLanguages = Object.entries(languageStats)
      .filter(([_, stats]) => stats.avgWPM < 40)
      .map(([lang, _]) => lang);

    if (slowLanguages.length > 0) {
      recommendations.push({
        priority: 'medium',
        message: `Focus on ${slowLanguages.join(', ')} to improve overall speed.`,
        action: `Practice ${slowLanguages[0]} exercises`
      });
    }

    return recommendations;
  }

  /**
   * Call Gemini API
   */
  async callGeminiAPI(prompt) {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    const requestBody = {
      contents: [{
        role: 'user',
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024
      }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${this.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Gemini API error');
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }

  /**
   * Fallback: Generate local feedback (no API)
   */
  generateLocalFeedback(performanceData) {
    const { wpm, accuracy } = performanceData;
    const suggestions = this.generateSuggestions(accuracy, wpm);

    let assessment = `Your typing speed is ${wpm} WPM with ${accuracy}% accuracy. `;
    if (accuracy >= 95 && wpm >= 80) {
      assessment += 'Excellent performance!';
    } else if (accuracy >= 90 && wpm >= 60) {
      assessment += 'Good job! Keep practicing.';
    } else {
      assessment += 'Keep practicing to improve.';
    }

    return {
      assessment,
      suggestions,
      motivation: 'Every keystroke brings you closer to mastery!'
    };
  }

  /**
   * Fallback: Generate local exercise (no API)
   */
  generateLocalExercise(language, difficulty) {
    // Normalize language before dictionary lookup
    const normalizedLang = normalizeLanguage(language);
    const displayName = getDisplayName(normalizedLang);

    const exercises = {
      python: {
        easy: [
          'print("Hello, World!")',
          'x = 10\nprint(x)',
          'name = "Python"\nprint(name)'
        ],
        medium: [
          'def greet(name):\n    return f"Hello, {name}!"',
          'numbers = [1, 2, 3, 4, 5]\nprint(sum(numbers))',
          'for i in range(10):\n    print(i)'
        ],
        hard: [
          'class Calculator:\n    def add(self, a, b):\n        return a + b',
          'lambda x: [i for i in range(x) if i % 2 == 0]',
          'def fibonacci(n):\n    return n if n <= 1 else fibonacci(n-1) + fibonacci(n-2)'
        ]
      },
      javascript: {
        easy: [
          'console.log("Hello, World!");',
          'const x = 10;\nconsole.log(x);',
          'const name = "JavaScript";\nconsole.log(name);'
        ],
        medium: [
          'function greet(name) {\n    return `Hello, ${name}!`;\n}',
          'const numbers = [1, 2, 3, 4, 5];\nconsole.log(numbers.reduce((a, b) => a + b));',
          'for (let i = 0; i < 10; i++) {\n    console.log(i);\n}'
        ],
        hard: [
          'class Calculator {\n    add(a, b) {\n        return a + b;\n    }\n}',
          'const fibonacci = (n) => n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);',
          'const asyncFunc = async () => {\n    const data = await fetch("/api/data");\n    return data.json();\n};'
        ]
      },
      java: {
        easy: [
          'System.out.println("Hello, World!");',
          'int x = 10;\nSystem.out.println(x);',
          'String name = "Java";\nSystem.out.println(name);'
        ],
        medium: [
          'public String greet(String name) {\n    return "Hello, " + name + "!";\n}',
          'int[] numbers = {1, 2, 3, 4, 5};\nint sum = Arrays.stream(numbers).sum();',
          'for (int i = 0; i < 10; i++) {\n    System.out.println(i);\n}'
        ],
        hard: [
          'public class Calculator {\n    public int add(int a, int b) {\n        return a + b;\n    }\n}',
          'public int fibonacci(int n) {\n    return n <= 1 ? n : fibonacci(n - 1) + fibonacci(n - 2);\n}',
          'Stream.of(1, 2, 3, 4, 5).filter(n -> n % 2 == 0).forEach(System.out::println);'
        ]
      },
      c: {
        easy: [
          'printf("Hello, World!");',
          'int x = 10;\nprintf("%d", x);',
          'char name[] = "C";\nprintf("%s", name);'
        ],
        medium: [
          'int add(int a, int b) {\n    return a + b;\n}',
          'for (int i = 0; i < 10; i++) {\n    printf("%d\\n", i);\n}',
          'int arr[] = {1, 2, 3, 4, 5};\nint sum = 0;\nfor (int i = 0; i < 5; i++) sum += arr[i];'
        ],
        hard: [
          'typedef struct {\n    int x;\n    int y;\n} Point;\nPoint p = {10, 20};',
          'int* ptr = (int*)malloc(sizeof(int) * 10);\nfree(ptr);',
          'void quickSort(int arr[], int low, int high) {\n    if (low < high) {\n        int pi = partition(arr, low, high);\n        quickSort(arr, low, pi - 1);\n        quickSort(arr, pi + 1, high);\n    }\n}'
        ]
      },
      'c++': {
        easy: [
          'std::cout << "Hello, World!";',
          'int x = 10;\nstd::cout << x;',
          'std::string name = "C++";\nstd::cout << name;'
        ],
        medium: [
          'int add(int a, int b) {\n    return a + b;\n}',
          'std::vector<int> nums = {1, 2, 3, 4, 5};\nint sum = std::accumulate(nums.begin(), nums.end(), 0);',
          'for (int i = 0; i < 10; i++) {\n    std::cout << i << std::endl;\n}'
        ],
        hard: [
          'template<typename T>\nclass Stack {\n    std::vector<T> data;\npublic:\n    void push(T val) { data.push_back(val); }\n};',
          'std::unique_ptr<int> ptr(new int(42));\nstd::cout << *ptr;',
          'std::sort(vec.begin(), vec.end(), [](int a, int b) { return a > b; });'
        ]
      }
    };

    // Use normalized key for dictionary lookup
    const langExercises = exercises[normalizedLang] || exercises.javascript;
    const diffExercises = langExercises[difficulty] || langExercises.medium;
    const exercise = diffExercises[Math.floor(Math.random() * diffExercises.length)];

    return {
      success: true,
      exercise,
      language: displayName,
      difficulty,
      wordCount: exercise.split(/\s+/).length,
      characterCount: exercise.length
    };
  }

  /**
   * Generate suggestions based on performance
   */
  generateSuggestions(accuracy, wpm) {
    const suggestions = [];

    if (accuracy < 85) {
      suggestions.push('Focus on accuracy - slow down and type carefully');
      suggestions.push('Practice touch typing to reduce errors');
    }

    if (wpm < 40) {
      suggestions.push('Increase your typing speed with daily practice');
      suggestions.push('Try typing for longer sessions to build muscle memory');
    }

    if (accuracy >= 95 && wpm >= 80) {
      suggestions.push('Excellent! Try harder difficulty exercises');
      suggestions.push('Challenge yourself with different programming languages');
    }

    return suggestions.length > 0 ? suggestions : ['Keep practicing!'];
  }
}

module.exports = new TypingAI();
