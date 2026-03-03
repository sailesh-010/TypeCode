const express = require('express');
const router = express.Router();
const userModel = require('../models/userModel');
const scoreModel = require('../models/scoremodel');
const { verifyToken } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * POST /api/user/score
 * Record a typing test score
 */
router.post('/score', verifyToken, (req, res) => {
  try {
    const { wpm, accuracy, testType, duration, wordsTyped, errorsCount } = req.body;

    // Validate input
    if (!wpm || typeof accuracy !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Invalid score data'
      });
    }

    // Get user
    const user = userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Record score
    const score = scoreModel.create({
      userId: user.id,
      username: user.username,
      wpm: Math.round(wpm),
      accuracy: Math.round(accuracy),
      testType: testType || 'standard',
      duration: duration || 60,
      wordsTyped: wordsTyped || 0,
      errorsCount: errorsCount || 0
    });

    logger.info(`Score recorded for user ${user.username}: ${wpm} WPM`);

    res.status(201).json({
      success: true,
      message: 'Score recorded successfully',
      score
    });
  } catch (error) {
    logger.error('Score recording error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record score'
    });
  }
});

/**
 * GET /api/user/scores
 * Get user's typing test scores
 */
router.get('/scores', verifyToken, (req, res) => {
  try {
    const scores = scoreModel.getUserScores(req.user.id);

    res.json({
      success: true,
      count: scores.length,
      scores
    });
  } catch (error) {
    logger.error('Scores fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scores'
    });
  }
});

/**
 * GET /api/user/stats
 * Get user's typing statistics
 */
router.get('/stats', verifyToken, (req, res) => {
  try {
    const user = userModel.findById(req.user.id);
    const userScores = scoreModel.getUserScores(req.user.id);
    const bestScore = scoreModel.getUserBestScore(req.user.id);
    const averageWPM = scoreModel.getUserAverageWPM(req.user.id);

    const stats = {
      userId: user.id,
      username: user.username,
      totalTests: userScores.length,
      bestWPM: bestScore?.wpm || 0,
      averageWPM,
      totalWordsTyped: userScores.reduce((sum, s) => sum + s.wordsTyped, 0),
      totalErrors: userScores.reduce((sum, s) => sum + s.errorsCount, 0),
      averageAccuracy: userScores.length > 0
        ? Math.round(userScores.reduce((sum, s) => sum + s.accuracy, 0) / userScores.length)
        : 0
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    logger.error('Stats fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

/**
 * PUT /api/user/profile
 * Update user profile
 */
router.put('/profile', verifyToken, (req, res) => {
  try {
    const { username, fullName, email } = req.body;

    const user = userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is already taken
    if (email && email !== user.email) {
      const existingUser = userModel.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (fullName) updateData.fullName = fullName;
    if (email) updateData.email = email;

    const updatedUser = userModel.update(req.user.id, updateData);

    logger.info(`Profile updated for user ${user.email}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        fullName: updatedUser.fullName
      }
    });
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

/**
 * GET /api/user/:userId/public-profile
 * Get public user profile
 */
router.get('/:userId/public-profile', (req, res) => {
  try {
    const user = userModel.findById(parseInt(req.params.userId));
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const stats = scoreModel.getUserScores(user.id);
    const bestScore = scoreModel.getUserBestScore(user.id);
    const averageWPM = scoreModel.getUserAverageWPM(user.id);

    res.json({
      success: true,
      profile: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        createdAt: user.createdAt,
        stats: {
          totalTests: stats.length,
          bestWPM: bestScore?.wpm || 0,
          averageWPM
        }
      }
    });
  } catch (error) {
    logger.error('Public profile fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile'
    });
  }
});

module.exports = router;
