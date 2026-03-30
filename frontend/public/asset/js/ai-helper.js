/**
 * AI Helper Module
 * Handles communication with backend AI endpoints
 */

const AIHelper = {
  /**
   * Generate a typing challenge
   */
  async generateChallenge(language = 'JavaScript', difficulty = 'Medium', topic = 'Random') {
    try {
      // Build query parameters
      const params = new URLSearchParams({
        language: language,
        difficulty: difficulty,
        topic: topic || 'Random'
      });

      const url = `/api/ai/exercise?${params.toString()}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Check if we have data (even if success is false, we might have fallback)
      if (data.data && data.data.content) {
        return data.data.content;
      } else {
        return this.getLocalChallenge(language, difficulty);
      }
    } catch (error) {
      return this.getLocalChallenge(language, difficulty);
    }
  },

  /**
   * Get performance feedback
   */
  async getPerformanceFeedback(accuracy, wpm, language = 'javascript') {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          wpm,
          accuracy,
          language,
          duration: 0,
          errors: []
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.success && data.data.assessment) {
        return data.data.assessment;
      }
      return null;
    } catch (error) {
      console.error('Failed to get feedback:', error);
      return this.getLocalFeedback(accuracy, wpm).assessment;
    }
  },

  /**
   * Get feedback for a practice session
   */
  async getFeedback(wpm, accuracy, language, duration, errors = []) {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          wpm,
          accuracy,
          language,
          duration,
          errors
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Failed to get feedback:', error);
      return this.getLocalFeedback(wpm, accuracy);
    }
  },

  /**
   * Get code review (placeholder)
   */
  async getCodeReview(userCode, language, accuracy, wpm) {
    // Placeholder for future code review feature
    return `Great effort! Your accuracy is ${accuracy}% and speed is ${wpm} WPM. Keep practicing!`;
  },

  /**
   * Analyze typing patterns
   */
  async analyzePatterns(scores) {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ scores })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.success ? data.data : null;
    } catch (error) {
      console.error('Failed to analyze patterns:', error);
      return null;
    }
  },

  /**
   * Fallback: Get local challenge (no API)
   */
  getLocalChallenge(language, difficulty) {
    // Normalize language for local fallback
    const normalizedLang = language.toLowerCase();
    const normalizedDiff = difficulty.toLowerCase();
    
    const challenges = {
      javascript: {
        easy: 'console.log("Hello, World!");',
        medium: 'const greet = (name) => `Hello, ${name}!`;',
        hard: 'const fibonacci = (n) => n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2);'
      },
      python: {
        easy: 'print("Hello, World!")',
        medium: 'def greet(name):\n    return f"Hello, {name}!"',
        hard: 'def fibonacci(n):\n    return n if n <= 1 else fibonacci(n-1) + fibonacci(n-2)'
      },
      java: {
        easy: 'System.out.println("Hello, World!");',
        medium: 'public String greet(String name) {\n    return "Hello, " + name + "!";\n}',
        hard: 'public int fibonacci(int n) {\n    return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2);\n}'
      },
      c: {
        easy: 'printf("Hello, World!");',
        medium: 'int add(int a, int b) {\n    return a + b;\n}',
        hard: 'int fibonacci(int n) {\n    return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2);\n}'
      },
      'c++': {
        easy: 'std::cout << "Hello, World!";',
        medium: 'int add(int a, int b) {\n    return a + b;\n}',
        hard: 'int fibonacci(int n) {\n    return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2);\n}'
      },
      cpp: {
        easy: 'std::cout << "Hello, World!";',
        medium: 'int add(int a, int b) {\n    return a + b;\n}',
        hard: 'int fibonacci(int n) {\n    return n <= 1 ? n : fibonacci(n-1) + fibonacci(n-2);\n}'
      }
    };

    const langChallenges = challenges[normalizedLang] || challenges.javascript;
    return langChallenges[normalizedDiff] || langChallenges.easy;
  },

  /**
   * Fallback: Get local feedback (no API)
   */
  getLocalFeedback(wpm, accuracy) {
    let assessment = `Your typing speed is ${wpm} WPM with ${accuracy}% accuracy. `;
    
    if (accuracy >= 95 && wpm >= 80) {
      assessment += 'Excellent performance!';
    } else if (accuracy >= 90 && wpm >= 60) {
      assessment += 'Good job! Keep practicing.';
    } else {
      assessment += 'Keep practicing to improve.';
    }

    const suggestions = [];
    if (accuracy < 85) {
      suggestions.push('Focus on accuracy - slow down and type carefully');
    }
    if (wpm < 40) {
      suggestions.push('Increase your typing speed with daily practice');
    }
    if (accuracy >= 95 && wpm >= 80) {
      suggestions.push('Try harder difficulty exercises');
    }

    return {
      assessment,
      suggestions: suggestions.length > 0 ? suggestions : ['Keep practicing!'],
      motivation: 'Every keystroke brings you closer to mastery!'
    };
  }
};
