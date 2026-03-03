/**
 * Large Language Model Integration
 * Supports OpenAI and Google Gemini APIs
 */

const config = require('../../config');
const logger = require('../../utils/logger');

class LLMProvider {
  constructor() {
    this.apiKey = config.google.apiKey;
  }

  /**
   * Generate typing feedback using AI
   */
  async generateFeedback(userText, originalText, wpm, accuracy) {
    try {
      if (!this.apiKey) {
        return {
          success: true,
          feedback: 'Great job! Keep practicing to improve your typing speed.',
          suggestions: []
        };
      }

      // Mock feedback generation
      const suggestions = this.generateSuggestions(accuracy, wpm);
      
      let feedback = `Your WPM: ${wpm}, Accuracy: ${accuracy}%. `;
      
      if (accuracy < 90) {
        feedback += 'Focus on accuracy over speed. Slow down and practice more carefully.';
      } else if (wpm < 50) {
        feedback += 'Good accuracy! Now try to increase your typing speed gradually.';
      } else {
        feedback += 'Excellent! You are doing great. Keep up the practice!';
      }

      return {
        success: true,
        feedback,
        suggestions
      };
    } catch (error) {
      logger.error('LLM feedback generation error:', error);
      return {
        success: false,
        error: 'Failed to generate feedback'
      };
    }
  }

  /**
   * Generate improvement suggestions
   */
  generateSuggestions(accuracy, wpm) {
    const suggestions = [];

    if (accuracy < 85) {
      suggestions.push('Practice typing slowly to improve accuracy');
      suggestions.push('Focus on correct finger positioning');
    }

    if (wpm < 40) {
      suggestions.push('Increased practice will help boost your speed');
      suggestions.push('Try typing for longer durations');
    }

    if (accuracy >= 95 && wpm >= 80) {
      suggestions.push('You are performing excellently!');
      suggestions.push('Try challenge mode for more difficult texts');
    }

    return suggestions;
  }

  /**
   * Get typing exercises from AI
   */
  async generateExercise(difficulty = 'medium') {
    try {
      // Mock exercise generation
      const exercises = {
        easy: [
          'The quick brown fox jumps over the lazy dog.',
          'Practice makes perfect in typing tests.',
          'Speed and accuracy are both important skills.'
        ],
        medium: [
          'Effective communication requires clear writing and proper grammar.',
          'Developing typing skills takes consistent practice and dedication.',
          'Programming languages have different syntax and coding requirements.'
        ],
        hard: [
          'Sophisticated algorithms utilize complex mathematical principles and optimization techniques.',
          'Cybersecurity infrastructure demands comprehensive understanding of cryptographic protocols.',
          'Microservices architecture facilitates scalable, distributed computing environments.'
        ]
      };

      const exerciseList = exercises[difficulty] || exercises.medium;
      const randomExercise = exerciseList[Math.floor(Math.random() * exerciseList.length)];

      return {
        success: true,
        exercise: randomExercise,
        difficulty,
        wordCount: randomExercise.split(' ').length
      };
    } catch (error) {
      logger.error('Exercise generation error:', error);
      return {
        success: false,
        error: 'Failed to generate exercise'
      };
    }
  }

  /**
   * Analyze typing patterns
   */
  analyzeTypingPatterns(scores) {
    try {
      if (scores.length === 0) {
        return {
          success: false,
          error: 'No scores to analyze'
        };
      }

      const avgWPM = scores.reduce((sum, s) => sum + s.wpm, 0) / scores.length;
      const avgAccuracy = scores.reduce((sum, s) => sum + s.accuracy, 0) / scores.length;
      const trend = this.calculateTrend(scores);

      return {
        success: true,
        analysis: {
          averageWPM: Math.round(avgWPM),
          averageAccuracy: Math.round(avgAccuracy),
          trend,
          recommendation: this.getRecommendation(avgWPM, avgAccuracy, trend)
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
   * Calculate typing trend
   */
  calculateTrend(scores) {
    if (scores.length < 2) return 'stable';

    const recentAvg = scores.slice(0, 5).reduce((sum, s) => sum + s.wpm, 0) / Math.min(5, scores.length);
    const olderAvg = scores.slice(-5).reduce((sum, s) => sum + s.wpm, 0) / Math.min(5, scores.length);

    if (recentAvg > olderAvg * 1.05) return 'improving';
    if (recentAvg < olderAvg * 0.95) return 'declining';
    return 'stable';
  }

  /**
   * Get personalized recommendation
   */
  getRecommendation(avgWPM, avgAccuracy, trend) {
    if (avgAccuracy < 85) {
      return 'Focus on accuracy improvement. Slow down and practice carefully.';
    }
    if (trend === 'declining') {
      return 'Your performance is declining. Take a break and practice more consistently.';
    }
    if (avgWPM < 50) {
      return 'Focus on speed. Use touch typing techniques and practice daily.';
    }
    return 'Great progress! Keep practicing to maintain and improve your skills.';
  }
}

module.exports = new LLMProvider();
