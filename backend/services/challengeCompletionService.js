const ScoreModel = require('../models/scoremodel');
const UserModel = require('../models/userModel');

/**
 * Service for handling challenge completion and related updates
 * Orchestrates score creation, statistics updates, and leaderboard ranking
 */
class ChallengeCompletionService {
  constructor() {
    this.scoreModel = ScoreModel;
    this.userModel = UserModel;
  }

  /**
   * Validate challenge completion data
   * @param {Object} challengeData - The challenge data to validate
   * @returns {string|null} Error message if invalid, null if valid
   */
  validateChallengeData(challengeData) {
    // Check for required fields
    const requiredFields = ['userId', 'username', 'wpm', 'accuracy', 'testType', 'duration', 'wordsTyped', 'errorsCount'];
    
    for (const field of requiredFields) {
      if (challengeData[field] === undefined || challengeData[field] === null) {
        return `Missing required field: ${field}`;
      }
    }

    // Validate data types
    if (typeof challengeData.userId !== 'number') {
      return 'userId must be a number';
    }
    if (typeof challengeData.username !== 'string') {
      return 'username must be a string';
    }
    if (typeof challengeData.wpm !== 'number') {
      return 'wpm must be a number';
    }
    if (typeof challengeData.accuracy !== 'number') {
      return 'accuracy must be a number';
    }
    if (typeof challengeData.testType !== 'string') {
      return 'testType must be a string';
    }
    if (typeof challengeData.duration !== 'number') {
      return 'duration must be a number';
    }
    if (typeof challengeData.wordsTyped !== 'number') {
      return 'wordsTyped must be a number';
    }
    if (typeof challengeData.errorsCount !== 'number') {
      return 'errorsCount must be a number';
    }

    // Validate ranges
    if (challengeData.accuracy < 0 || challengeData.accuracy > 100) {
      return 'accuracy must be between 0 and 100';
    }
    if (challengeData.wpm < 0) {
      return 'wpm must be a positive value';
    }
    if (challengeData.duration <= 0) {
      return 'duration must be a positive value';
    }
    if (challengeData.wordsTyped < 0) {
      return 'wordsTyped must be a non-negative value';
    }
    if (challengeData.errorsCount < 0) {
      return 'errorsCount must be a non-negative value';
    }

    return null; // Valid
  }

  /**
   * Calculate updated statistics for a user
   * @param {number} userId - User ID
   * @returns {Object} Updated statistics object with bestWPM, averageWPM, totalTests, averageAccuracy, lastTestDate
   */
  calculateUserStatistics(userId) {
    return this.scoreModel.getUserStatistics(userId);
  }

  /**
   * Get user's current leaderboard rank
   * @param {number} userId - User ID
   * @returns {number|null} Current rank (1-indexed) or null if user has no scores
   */
  getUserRank(userId) {
    return this.scoreModel.getUserRank(userId);
  }

  /**
   * Process a completed challenge and update all related data
   * @param {Object} challengeData - The challenge completion data
   * @param {number} challengeData.userId - User ID
   * @param {string} challengeData.username - Username
   * @param {number} challengeData.wpm - Words per minute
   * @param {number} challengeData.accuracy - Accuracy percentage
   * @param {string} challengeData.testType - Type of test
   * @param {number} challengeData.duration - Duration in seconds
   * @param {number} challengeData.wordsTyped - Total words typed
   * @param {number} challengeData.errorsCount - Number of errors
   * @returns {Object} Result containing score, updated stats, and ranking
   * @throws {Error} If validation fails or operations fail
   */
  async processCompletion(challengeData) {
    // Step 1: Validate challenge data
    const validationError = this.validateChallengeData(challengeData);
    if (validationError) {
      throw new Error(validationError);
    }

    try {
      // Step 2: Create score record via ScoreModel.create
      const score = this.scoreModel.create({
        userId: challengeData.userId,
        username: challengeData.username,
        wpm: challengeData.wpm,
        accuracy: challengeData.accuracy,
        testType: challengeData.testType,
        duration: challengeData.duration,
        wordsTyped: challengeData.wordsTyped,
        errorsCount: challengeData.errorsCount
      });

      // Step 3: Calculate updated statistics
      const statistics = this.calculateUserStatistics(challengeData.userId);

      // Step 4: Update user profile via UserModel.updateStatistics
      const updatedUser = this.userModel.updateStatistics(challengeData.userId, statistics);
      
      if (!updatedUser) {
        // Log error but don't fail - score is already persisted (Property 10)
        console.error(`Failed to update statistics for user ${challengeData.userId}, but score was recorded`);
      }

      // Step 5: Get user's current rank
      const rank = this.getUserRank(challengeData.userId);

      // Step 6: Return comprehensive result object
      return {
        score,
        statistics,
        rank
      };
    } catch (error) {
      // Handle errors and maintain consistency
      // If score creation fails, the error will be thrown before any updates
      // If statistics update fails, we log it but still return the score (Property 10)
      console.error('Error in processCompletion:', error);
      throw error;
    }
  }
}

module.exports = new ChallengeCompletionService();
