const fs = require('fs');
const path = require('path');

// Basic file-based score model
class ScoreModel {
  constructor() {
    this.dataFile = path.join(__dirname, '..', 'data', 'scores.json');
    this.scores = [];
    this.id = 1;
    this.init();
  }

  init() {
    const dir = path.dirname(this.dataFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(this.dataFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.dataFile, 'utf8'));
        this.scores = data.scores || [];
        this.id = data.nextId || 1;
      } catch (err) {
        console.error('Error reading scores.json:', err);
      }
    } else {
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(this.dataFile, JSON.stringify({
        scores: this.scores,
        nextId: this.id
      }, null, 2));
    } catch (err) {
      console.error('Error saving scores.json:', err);
    }
  }

  /**
   * Record a typing session score
   */
  create(scoreData) {
    const score = {
      id: this.id++,
      ...scoreData,
      createdAt: new Date()
    };
    this.scores.push(score);
    this.save();
    return score;
  }

  /**
   * Get user's scores
   */
  getUserScores(userId) {
    return this.scores
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Get high scores for leaderboard
   */
  getHighScores(limit = 10) {
    return [...this.scores]
      .sort((a, b) => b.wpm - a.wpm)
      .slice(0, limit);
  }

  /**
   * Get user's best score
   */
  getUserBestScore(userId) {
    const userScores = this.getUserScores(userId);
    return userScores.length > 0 ? userScores[0] : null;
  }

  /**
   * Get user's average WPM
   */
  getUserAverageWPM(userId) {
    const userScores = this.getUserScores(userId);
    if (userScores.length === 0) return 0;
    
    const total = userScores.reduce((sum, score) => sum + score.wpm, 0);
    return Math.round(total / userScores.length);
  }

  /**
   * Get comprehensive statistics for a user
   * @param {number} userId - User ID
   * @returns {Object} Statistics object with bestWPM, averageWPM, totalTests, averageAccuracy
   */
  getUserStatistics(userId) {
    const userScores = this.scores.filter(s => s.userId === userId);
    
    // Handle edge case: user with no scores
    if (userScores.length === 0) {
      return {
        bestWPM: 0,
        averageWPM: 0,
        totalTests: 0,
        averageAccuracy: 0,
        lastTestDate: null
      };
    }

    // Calculate statistics
    const bestWPM = Math.max(...userScores.map(s => s.wpm));
    const totalWPM = userScores.reduce((sum, s) => sum + s.wpm, 0);
    const averageWPM = Math.round(totalWPM / userScores.length);
    const totalTests = userScores.length;
    const totalAccuracy = userScores.reduce((sum, s) => sum + s.accuracy, 0);
    const averageAccuracy = Math.round(totalAccuracy / userScores.length);
    const lastTestDate = new Date(Math.max(...userScores.map(s => new Date(s.createdAt))));

    return {
      bestWPM,
      averageWPM,
      totalTests,
      averageAccuracy,
      lastTestDate
    };
  }

  /**
   * Get leaderboard with stats
   */
  getLeaderboard(limit = 20) {
    const userStats = {};
    
    this.scores.forEach(score => {
      if (!userStats[score.userId]) {
        userStats[score.userId] = {
          userId: score.userId,
          username: score.username,
          bestWPM: 0,
          averageWPM: 0,
          totalTests: 0,
          accuracy: 0,
          _wpmSum: 0
        };
      }

      userStats[score.userId].totalTests++;
      userStats[score.userId]._wpmSum += score.wpm;
      if (score.wpm > userStats[score.userId].bestWPM) {
        userStats[score.userId].bestWPM = score.wpm;
      }
      userStats[score.userId].accuracy += score.accuracy;
    });

    // Calculate averages
    Object.values(userStats).forEach(stat => {
      if (stat.totalTests > 0) {
        stat.averageWPM = Math.round(stat._wpmSum / stat.totalTests);
        stat.accuracy = Math.round(stat.accuracy / stat.totalTests);
      }
    });

    return Object.values(userStats)
      .sort((a, b) => b.bestWPM - a.bestWPM)
      .map((stat, index) => {
        const { _wpmSum, ...clean } = stat;  // strip internal field
        return { ...clean, rank: index + 1 };
      })
      .slice(0, limit);
  }

  /**
   * Get user's rank in the leaderboard
   * @param {number} userId - User ID
   * @returns {number|null} Rank position (1-indexed) or null if user has no scores
   */
  getUserRank(userId) {
    // Check if user has any scores
    const userScores = this.scores.filter(s => s.userId === userId);
    if (userScores.length === 0) {
      return null;
    }

    // Get full leaderboard (no limit to ensure we find the user)
    const leaderboard = this.getLeaderboard(Number.MAX_SAFE_INTEGER);
    
    // Find user's position in the leaderboard
    const userEntry = leaderboard.find(entry => entry.userId === userId);
    
    return userEntry ? userEntry.rank : null;
  }

  /**
   * Get all scores
   */
  getAll() {
    return this.scores;
  }

  /**
   * Get score by ID
   */
  getById(id) {
    return this.scores.find(s => s.id === id);
  }
}

module.exports = new ScoreModel();
