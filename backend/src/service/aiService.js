/**
 * AI Service - Provides AI-powered features
 */

const llm = require('../ai/llm');
const scoreModel = require('../../models/scoremodel');
const userModel = require('../../models/userModel');
const logger = require('../../utils/logger');

class AIService {
  /**
   * Get personalized recommendations for a user
   */
  async getRecommendations(userId) {
    try {
      const userScores = scoreModel.getUserScores(userId);

      if (userScores.length === 0) {
        return [
          'Start taking typing tests to get personalized recommendations',
          'Try different test types and difficulties to find what suits you',
          'Focus on accuracy before speed'
        ];
      }

      const analysis = llm.analyzeTypingPatterns(userScores);

      if (!analysis.success) {
        return [];
      }

      const recommendations = [analysis.analysis.recommendation];

      // Additional recommendations based on performance
      if (analysis.analysis.averageAccuracy < 90) {
        recommendations.push('Consider using an on-screen keyboard guide for reference');
        recommendations.push('Take breaks to avoid fatigue affecting accuracy');
      }

      if (analysis.analysis.averageWPM < 60) {
        recommendations.push('Try practicing with faster-paced exercises');
        recommendations.push('Attempt timed tests to push your speed');
      }

      if (analysis.analysis.trend === 'improving') {
        recommendations.push('Great improvement! Keep maintaining this progression');
        recommendations.push('Try challenging yourself with harder texts');
      }

      return recommendations;
    } catch (error) {
      logger.error('Recommendations generation error:', error);
      return [];
    }
  }

  /**
   * Chat with AI about typing
   */
  async chat(message, userId) {
    try {
      const user = userModel.findById(userId);

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Simple intent detection and response
      const response = this.generateChatResponse(message, user);

      logger.info(`Chat for user ${user.email}: ${message.substring(0, 50)}`);

      return {
        success: true,
        response,
        userId
      };
    } catch (error) {
      logger.error('Chat error:', error);
      return {
        success: false,
        error: 'Failed to process chat'
      };
    }
  }

  /**
   * Generate chat response based on user message
   */
  generateChatResponse(message, user) {
    const lowerMessage = message.toLowerCase();

    // Intent-based responses
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return {
        type: 'help',
        content: 'I can help you improve your typing! You can ask me about: improving speed, accuracy tips, exercise suggestions, or your progress statistics.'
      };
    }

    if (lowerMessage.includes('speed') || lowerMessage.includes('wpm')) {
      return {
        type: 'suggestion',
        content: 'To improve your WPM: 1) Practice regularly with timed tests 2) Focus on finger positioning 3) Avoid looking at the keyboard 4) Use proper posture. Would you like an exercise?'
      };
    }

    if (lowerMessage.includes('accuracy')) {
      return {
        type: 'suggestion',
        content: 'For better accuracy: 1) Slow down initially 2) Use touch typing 3) Practice specific difficult words 4) Take our accuracy-focused exercises.'
      };
    }

    if (lowerMessage.includes('exercise') || lowerMessage.includes('practice')) {
      return {
        type: 'suggestion',
        content: `Hi ${user.username}! Would you like an easy, medium, or hard typing exercise? Reply with your preference!`
      };
    }

    if (lowerMessage.includes('stats') || lowerMessage.includes('progress')) {
      const stats = scoreModel.getUserScores(user.id);
      if (stats.length === 0) {
        return {
          type: 'info',
          content: 'You haven\'t taken any tests yet. Start by taking a typing test to see your statistics!'
        };
      }
      return {
        type: 'info',
        content: `You've completed ${stats.length} tests. Keep testing to improve!`
      };
    }

    if (lowerMessage.includes('easy') || lowerMessage.includes('beginner')) {
      return {
        type: 'exercise',
        difficulty: 'easy',
        content: 'Great! I\'ll give you an easy exercise to start with.'
      };
    }

    if (lowerMessage.includes('medium') || lowerMessage.includes('intermediate')) {
      return {
        type: 'exercise',
        difficulty: 'medium',
        content: 'Perfect! Here\'s a medium-level exercise for you.'
      };
    }

    if (lowerMessage.includes('hard') || lowerMessage.includes('advanced')) {
      return {
        type: 'exercise',
        difficulty: 'hard',
        content: 'Challenge accepted! Here\'s a difficult exercise.'
      };
    }

    // Default response
    return {
      type: 'info',
      content: `Hi ${user.username}! You can ask me about typing tips, exercises, statistics, or just chat. What would you like to know?`
    };
  }

  /**
   * Generate performance insights
   */
  async generateInsights(userId) {
    try {
      const userScores = scoreModel.getUserScores(userId);

      if (userScores.length < 3) {
        return {
          success: false,
          error: 'Need at least 3 test results for insights'
        };
      }

      const analysis = llm.analyzeTypingPatterns(userScores);

      return {
        success: true,
        insights: {
          performance: analysis.analysis,
          summary: `${userScores.length} tests completed. Your best WPM is ${analysis.analysis.averageWPM}. Keep practicing!`
        }
      };
    } catch (error) {
      logger.error('Insights generation error:', error);
      return {
        success: false,
        error: 'Failed to generate insights'
      };
    }
  }

  /**
   * Get study plan recommendation
   */
  async getStudyPlan(userId) {
    try {
      const userScores = scoreModel.getUserScores(userId);
      const analysis = llm.analyzeTypingPatterns(userScores);

      if (!analysis.success) {
        return {
          success: false,
          error: 'Cannot generate study plan'
        };
      }

      const plan = {
        duration: '4 weeks',
        frequency: '5 days per week',
        activities: []
      };

      const { averageWPM, averageAccuracy } = analysis.analysis;

      if (averageAccuracy < 85) {
        plan.activities.push('10 mins - Accuracy focused exercises');
        plan.activities.push('10 mins - Slow typing practice');
      }

      if (averageWPM < 50) {
        plan.activities.push('15 mins - Speed building exercises');
      } else {
        plan.activities.push('10 mins - Challenging texts');
      }

      plan.activities.push('5 mins - Cool down with light practice');

      return {
        success: true,
        plan
      };
    } catch (error) {
      logger.error('Study plan generation error:', error);
      return {
        success: false,
        error: 'Failed to generate study plan'
      };
    }
  }
}

module.exports = new AIService();
