// Mock score model (can be replaced with MongoDB/Mongoose)
class ScoreModel {
  constructor() {
    this.scores = [];
    this.id = 1;
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
    return score;
  }

  /**
   * Get user's scores
   */
  getUserScores(userId) {
    return this.scores.filter(s => s.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
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
