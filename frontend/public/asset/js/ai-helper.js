
const AIHelper = {
  /**
   * Get AI feedback based on practice session metrics
   * @param {number} accuracy - User accuracy percentage (0-100)
   * @param {number} wpm - Words per minute
   * @param {string} language - Programming language (js, py, java, c, cpp)
   * @returns {Promise<string>} - AI feedback message
   */
  async getPerformanceFeedback(accuracy, wpm, language = 'javascript') {
    try {
      const response = await fetch('/api/ai/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accuracy, wpm, language })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.feedback
    } catch (error) {
      console.error('[AI Helper] Error getting feedback:', error)
      return 'Keep practicing to improve!'
    }
  },

  /**
   * Get AI code review with metrics
   * @param {string} code - User's code snippet
   * @param {string} language - Programming language
   * @param {number} accuracy - User accuracy percentage
   * @param {number} wpm - Words per minute
   * @returns {Promise<string>} - AI review
   */
  async getCodeReview(code, language = 'javascript', accuracy = 0, wpm = 0) {
    try {
      const response = await fetch('/api/ai/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, accuracy, wpm })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.review
    } catch (error) {
      console.error('[AI Helper] Error getting review:', error)
      return 'Unable to review code at this time.'
    }
  },

  /**
   * Generate a new code challenge
   * @param {string} language - Programming language
   * @param {string} difficulty - Difficulty level (easy, medium, hard)
   * @param {string} topic - Topic or 'random'
   * @returns {Promise<string>} - Generated code challenge
   */
  async generateChallenge(language, difficulty, topic = 'random') {
    try {
      const response = await fetch('/api/ai/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, difficulty, topic })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.challenge
    } catch (error) {
      console.error('[AI Helper] Error generating challenge:', error)
      return null
    }
  },

  /**
   * Get general chat response from AI
   * @param {string} prompt - User prompt
   * @param {string} context - Context type (general, code-review, practice)
   * @returns {Promise<string>} - AI response
   */
  async chat(prompt, context = 'general') {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context })
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.result
    } catch (error) {
      console.error('[AI Helper] Chat error:', error)
      return 'Unable to get AI response at this time.'
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIHelper
}