/**
 * AI Integration Module for Practice Page
 * Extends practice.js with AI-powered feedback and challenges
 */

// Load AIHelper if available
const loadAIHelper = () => {
  if (typeof AIHelper === 'undefined') {
    console.warn('AIHelper not loaded. Add ai-helper.js script to HTML')
  }
}

/**
 * Get AI feedback after a typing test
 * @param {Object} metrics - User metrics { accuracy, wpm, language }
 * @param {HTMLElement} container - Container to display feedback
 */
async function displayAIFeedback(metrics, container) {
  if (!container) return

  const { accuracy = 0, wpm = 0, language = 'javascript' } = metrics

  // Show loading state
  container.innerHTML = '<p>Getting AI feedback...</p>'
  container.classList.add('loading')

  try {
    const feedback = await AIHelper.getPerformanceFeedback(accuracy, wpm, language)
    container.innerHTML = `<div class="ai-feedback"><strong>AI Coach:</strong> ${feedback}</div>`
    container.classList.remove('loading')
  } catch (error) {
    container.innerHTML = '<p>Unable to load AI feedback</p>'
    console.error('Feedback error:', error)
  }
}

/**
 * Generate and display a new AI code challenge
 * @param {string} language - Programming language
 * @param {string} difficulty - Difficulty level
 * @param {string} topic - Topic or 'random'
 * @param {HTMLElement} codeContainer - Container to display code
 */
async function loadAIChallenge(language, difficulty, topic = 'random', codeContainer) {
  if (!codeContainer) return

  codeContainer.innerHTML = '<p>Generating challenge...</p>'

  try {
    const challenge = await AIHelper.generateChallenge(language, difficulty, topic)
    if (challenge) {
      codeContainer.innerHTML = `<pre><code class="language-${language}">${escapeHtml(challenge)}</code></pre>`
      // Re-highlight if Prism is loaded
      if (typeof Prism !== 'undefined') {
        Prism.highlightAllUnder(codeContainer)
      }
    }
  } catch (error) {
    codeContainer.innerHTML = '<p>Error generating challenge. Please try again.</p>'
    console.error('Challenge generation error:', error)
  }
}

/**
 * Display AI code review for user code
 * @param {string} userCode - Code to review
 * @param {Object} metrics - User metrics { accuracy, wpm, language }
 * @param {HTMLElement} reviewContainer - Container for review
 */
async function displayAICodeReview(userCode, metrics, reviewContainer) {
  if (!reviewContainer || !userCode) return

  const { accuracy = 0, wpm = 0, language = 'javascript' } = metrics

  reviewContainer.innerHTML = '<p>Reviewing your code...</p>'

  try {
    const review = await AIHelper.getCodeReview(userCode, language, accuracy, wpm)
    reviewContainer.innerHTML = `<div class="ai-review"><strong>Code Review:</strong> ${review}</div>`
  } catch (error) {
    reviewContainer.innerHTML = '<p>Unable to review code</p>'
    console.error('Review error:', error)
  }
}

/**
 * Update practice stats display with AI context
 * Integrates with acc.js metrics
 */
function updateAIStats() {
  try {
    const totalAcc = document.getElementById('totalAcc')
    const totalWpm = document.getElementById('totalWpm')

    if (totalAcc && totalWpm) {
      const accuracy = parseInt(totalAcc.textContent) || 0
      const wpm = parseInt(totalWpm.textContent) || 0

      // Store current metrics for AI processing
      window.currentMetrics = { accuracy, wpm, language: 'javascript' }

      console.log('[AI Stats] Updated metrics:', window.currentMetrics)
    }
  } catch (error) {
    console.error('Error updating AI stats:', error)
  }
}

/**
 * Utility: Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadAIHelper()
    updateAIStats()
  })
} else {
  loadAIHelper()
  updateAIStats()
}

// Export functions for use
window.AIIntegration = {
  displayAIFeedback,
  loadAIChallenge,
  displayAICodeReview,
  updateAIStats
}