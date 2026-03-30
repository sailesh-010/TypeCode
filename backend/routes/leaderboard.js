const express = require('express');
const router = express.Router();
const scoreModel = require('../models/scoremodel');
const logger = require('../utils/logger');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { HTTP_STATUS } = require('../utils/constants');

/**
 * Helper: build a time-filtered leaderboard
 */
function buildTimeFilteredLeaderboard(ms, limit = 20) {
  const allScores = scoreModel.getAll();
  const cutoff = new Date(Date.now() - ms);
  const filtered = allScores.filter(s => new Date(s.createdAt) > cutoff);

  const stats = {};
  filtered.forEach(score => {
    if (!stats[score.userId]) {
      stats[score.userId] = {
        userId: score.userId,
        username: score.username,
        bestWPM: 0,
        totalTests: 0
      };
    }
    stats[score.userId].totalTests++;
    if (score.wpm > stats[score.userId].bestWPM) {
      stats[score.userId].bestWPM = score.wpm;
    }
  });

  return Object.values(stats)
    .sort((a, b) => b.bestWPM - a.bestWPM)
    .map((s, i) => ({ ...s, rank: i + 1 }))
    .slice(0, limit);
}

/**
 * GET /api/leaderboard
 */
router.get('/', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const leaderboard = scoreModel.getLeaderboard(limit);
    sendSuccess(res, HTTP_STATUS.OK, { count: leaderboard.length, leaderboard });
  } catch (error) {
    logger.error('Leaderboard fetch error:', error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to fetch leaderboard');
  }
});

/**
 * GET /api/leaderboard/top
 */
router.get('/top', (req, res) => {
  try {
    const topUsers = scoreModel.getLeaderboard(10);
    sendSuccess(res, HTTP_STATUS.OK, { count: topUsers.length, topUsers });
  } catch (error) {
    logger.error('Top users fetch error:', error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to fetch top users');
  }
});

/**
 * GET /api/leaderboard/weekly
 */
router.get('/weekly', (req, res) => {
  try {
    const leaderboard = buildTimeFilteredLeaderboard(7 * 24 * 60 * 60 * 1000);
    sendSuccess(res, HTTP_STATUS.OK, { count: leaderboard.length, leaderboard });
  } catch (error) {
    logger.error('Weekly leaderboard fetch error:', error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to fetch weekly leaderboard');
  }
});

/**
 * GET /api/leaderboard/monthly
 */
router.get('/monthly', (req, res) => {
  try {
    const leaderboard = buildTimeFilteredLeaderboard(30 * 24 * 60 * 60 * 1000);
    sendSuccess(res, HTTP_STATUS.OK, { count: leaderboard.length, leaderboard });
  } catch (error) {
    logger.error('Monthly leaderboard fetch error:', error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to fetch monthly leaderboard');
  }
});

/**
 * GET /api/leaderboard/rank/:userId
 */
router.get('/rank/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const leaderboard = scoreModel.getLeaderboard(1000);
    const userRank = leaderboard.find(u => u.userId === userId);

    if (!userRank) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'User not found in leaderboard');
    }

    sendSuccess(res, HTTP_STATUS.OK, { rank: userRank });
  } catch (error) {
    logger.error('Rank fetch error:', error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to fetch rank');
  }
});

/**
 * GET /api/leaderboard/rankings
 * Get paginated leaderboard rankings
 */
router.get('/rankings', (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const skip = parseInt(req.query.skip) || 0;
    
    const fullLeaderboard = scoreModel.getLeaderboard(1000);
    const paginatedData = fullLeaderboard.slice(skip, skip + limit);
    
    sendSuccess(res, HTTP_STATUS.OK, {
      count: paginatedData.length,
      total: fullLeaderboard.length,
      data: paginatedData.map(entry => ({
        rank: entry.rank,
        name: entry.username,
        wpm: entry.bestWPM,
        accuracy: entry.averageAccuracy || 0
      }))
    });
  } catch (error) {
    logger.error('Rankings fetch error:', error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to fetch rankings');
  }
});

/**
 * GET /api/user-ranking/:userId (alias endpoint)
 * Get user's ranking information for leaderboard display
 */
router.get('/:userId', (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const leaderboard = scoreModel.getLeaderboard(1000);
    const userEntry = leaderboard.find(u => u.userId === userId);

    if (!userEntry) {
      return sendError(res, HTTP_STATUS.NOT_FOUND, 'User not found in leaderboard');
    }

    // Calculate percentile
    const totalUsers = leaderboard.length;
    const percentile = totalUsers > 0 
      ? Math.round((1 - (userEntry.rank - 1) / totalUsers) * 100) 
      : 100;

    sendSuccess(res, HTTP_STATUS.OK, {
      data: {
        rank: userEntry.rank,
        name: userEntry.username,
        wpm: userEntry.bestWPM,
        accuracy: userEntry.averageAccuracy || 0,
        percentile: percentile
      }
    });
  } catch (error) {
    logger.error('User ranking fetch error:', error);
    sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to fetch user ranking');
  }
});

module.exports = router;
