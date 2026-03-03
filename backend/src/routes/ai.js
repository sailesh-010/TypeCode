const express = require('express');
const router = express.Router();
const llm = require('../ai/llm');
const aiService = require('../service/aiService');
const { verifyToken } = require('../../middleware/auth');
const logger = require('../../utils/logger');

/**
 * POST /api/ai/feedback
 * Get AI typing feedback
 */
router.post('/feedback', verifyToken, async (req, res) => {
  try {
    const { userText, originalText, wpm, accuracy } = req.body;

    if (!userText || !originalText || wpm === undefined || accuracy === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const feedback = await llm.generateFeedback(userText, originalText, wpm, accuracy);

    res.json({
      success: true,
      feedback
    });
  } catch (error) {
    logger.error('AI feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate feedback'
    });
  }
});

/**
 * GET /api/ai/exercise
 * Get AI-generated typing exercise
 */
router.get('/exercise', verifyToken, async (req, res) => {
  try {
    const difficulty = req.query.difficulty || 'medium';

    const exercise = await llm.generateExercise(difficulty);

    if (!exercise.success) {
      return res.status(500).json(exercise);
    }

    res.json({
      success: true,
      exercise: exercise.exercise,
      difficulty: exercise.difficulty,
      wordCount: exercise.wordCount
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
 * Analyze user's typing patterns
 */
router.post('/analyze', verifyToken, async (req, res) => {
  try {
    const { scores } = req.body;

    if (!Array.isArray(scores)) {
      return res.status(400).json({
        success: false,
        message: 'Scores must be an array'
      });
    }

    const analysis = llm.analyzeTypingPatterns(scores);

    res.json({
      success: true,
      analysis: analysis.analysis
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
 * GET /api/ai/recommendations
 * Get personalized AI recommendations
 */
router.get('/recommendations', verifyToken, async (req, res) => {
  try {
    const recommendations = await aiService.getRecommendations(req.user.id);

    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    logger.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recommendations'
    });
  }
});

/**
 * POST /api/ai/chat
 * Chat with AI for typing help
 */
router.post('/chat', verifyToken, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const response = await aiService.chat(message, req.user.id);

    res.json({
      success: true,
      response
    });
  } catch (error) {
    logger.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat'
    });
  }
});

module.exports = router;
