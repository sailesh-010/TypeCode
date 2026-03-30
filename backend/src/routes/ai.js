/**
 * AI Routes
 * Endpoints for typing practice AI features
 */

const express = require('express');
const router = express.Router();
const typingAI = require('../ai/typingAI');
const aiService = require('../service/aiService');
const { verifyToken } = require('../../middleware/auth');
const logger = require('../../utils/logger');

/**
 * POST /api/ai/feedback
 * Generate personalized typing feedback
 */
router.post('/feedback', verifyToken, async (req, res) => {
  try {
    const { wpm, accuracy, language, duration, errors } = req.body;

    // Validate input
    if (typeof wpm !== 'number' || typeof accuracy !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Invalid performance data'
      });
    }

    const feedback = await typingAI.generatePersonalizedFeedback({
      wpm,
      accuracy,
      language: language || 'general',
      duration: duration || 0,
      errors: errors || []
    });

    res.json({
      success: true,
      data: feedback
    });
  } catch (error) {
    logger.error('Feedback generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate feedback'
    });
  }
});

/**
 * GET /api/ai/exercise
 * Generate a typing exercise using AI Service (with language normalization and validation)
 * Query params: language, difficulty, topic
 */
router.get('/exercise', async (req, res) => {
  try {
    const { language = 'JavaScript', difficulty = 'Medium', topic = 'Random' } = req.query;

    // Use the main AI service with language normalization and validation
    const result = await aiService.generateCodeForPractice(language, difficulty, topic);

    // Ensure we always have exercise data
    if (!result || !result.exercise) {
      logger.error('AI service returned invalid result:', result);
      return res.status(500).json({
        success: false,
        data: {},
        message: 'Failed to generate exercise'
      });
    }

    res.json({
      success: result.success !== false, // Handle both success: true and success: false
      data: result.exercise,
      fallback: result.success === false // Indicate if fallback was used
    });
  } catch (error) {
    logger.error('Exercise generation error:', error);
    res.status(500).json({
      success: false,
      data: {},
      message: 'Failed to generate exercise'
    });
  }
});

/**
 * GET /api/ai/exercise/simple
 * Generate a simple typing exercise using TypingAI (legacy endpoint)
 * Query params: language, difficulty
 */
router.get('/exercise/simple', async (req, res) => {
  try {
    const { language = 'python', difficulty = 'medium' } = req.query;

    // Validate difficulty
    if (!['easy', 'medium', 'hard'].includes(difficulty.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid difficulty level'
      });
    }

    const exercise = await typingAI.generateExercise(language, difficulty);

    res.json({
      success: true,
      data: exercise
    });
  } catch (error) {
    logger.error('Exercise generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate exercise'
    });
  }
});

/**
 * POST /api/ai/analyze
 * Analyze typing patterns and provide insights
 */
router.post('/analyze', verifyToken, async (req, res) => {
  try {
    const { scores } = req.body;

    if (!Array.isArray(scores) || scores.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid scores data'
      });
    }

    const analysis = typingAI.analyzeTypingPatterns(scores);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    logger.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze patterns'
    });
  }
});

/**
 * GET /api/ai/health
 * Check AI service health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'AI service is running',
    features: [
      'Personalized feedback generation',
      'Exercise generation',
      'Pattern analysis',
      'Recommendations'
    ]
  });
});

module.exports = router;
