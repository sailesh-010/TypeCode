/**
 * Typing Engine - Real-time typing feedback and animation
 */

class TypingEngine {
  constructor(codeDisplayElement) {
    this.codeDisplay = codeDisplayElement;
    this.targetText = '';
    this.currentPosition = 0;
    this.errors = 0;
    this.startTime = null;
    this.isActive = false;
    
    this.stats = {
      totalChars: 0,
      correctChars: 0,
      incorrectChars: 0,
      wpm: 0,
      accuracy: 100
    };
  }

  /**
   * Initialize typing session with code
   */
  init(code) {
    this.targetText = code;
    this.currentPosition = 0;
    this.errors = 0;
    this.startTime = null;
    this.isActive = true;
    
    this.stats = {
      totalChars: 0,
      correctChars: 0,
      incorrectChars: 0,
      wpm: 0,
      accuracy: 100
    };
    
    this.render();
    this.attachKeyboardListener();
  }

  /**
   * Render the code with color coding
   */
  render() {
    if (!this.codeDisplay) return;

    const chars = this.targetText.split('');
    let html = '';

    chars.forEach((char, index) => {
      if (index < this.currentPosition) {
        // Already typed - show as correct (green) or incorrect (red)
        const isCorrect = this.isCharCorrect(index);
        const className = isCorrect ? 'typed-correct' : 'typed-incorrect';
        html += `<span class="${className}">${this.escapeHtml(char)}</span>`;
      } else if (index === this.currentPosition) {
        // Current position - highlight
        html += `<span class="current-char">${this.escapeHtml(char)}</span>`;
      } else {
        // Not yet typed - show in default color
        html += `<span class="untyped">${this.escapeHtml(char)}</span>`;
      }
    });

    this.codeDisplay.innerHTML = html;
  }

  /**
   * Check if character at position was typed correctly
   */
  isCharCorrect(index) {
    // Store typed characters for validation
    if (!this.typedChars) this.typedChars = [];
    return this.typedChars[index] === this.targetText[index];
  }

  /**
   * Handle key press
   */
  handleKeyPress(event) {
    if (!this.isActive) return;
    
    // Start timer on first keypress
    if (!this.startTime) {
      this.startTime = Date.now();
    }

    const key = event.key;

    // Ignore modifier keys
    if (event.ctrlKey || event.altKey || event.metaKey) return;

    // Handle backspace
    if (key === 'Backspace') {
      event.preventDefault();
      if (this.currentPosition > 0) {
        this.currentPosition--;
        if (this.typedChars) {
          this.typedChars.pop();
        }
        this.render();
      }
      return;
    }

    // Ignore special keys
    if (key.length > 1 && key !== 'Enter' && key !== 'Tab') return;

    event.preventDefault();

    // Handle Enter key
    if (key === 'Enter') {
      this.handleCharacter('\n');
      return;
    }

    // Handle Tab key
    if (key === 'Tab') {
      this.handleCharacter('\t');
      return;
    }

    // Handle regular character
    this.handleCharacter(key);
  }

  /**
   * Process typed character
   */
  handleCharacter(char) {
    if (this.currentPosition >= this.targetText.length) {
      // Finished typing!
      this.complete();
      return;
    }

    const expectedChar = this.targetText[this.currentPosition];
    const isCorrect = char === expectedChar;

    // Store typed character
    if (!this.typedChars) this.typedChars = [];
    this.typedChars[this.currentPosition] = char;

    // Update stats
    this.stats.totalChars++;
    if (isCorrect) {
      this.stats.correctChars++;
    } else {
      this.stats.incorrectChars++;
      this.errors++;
      
      // Play error animation
      this.playErrorAnimation();
    }

    // Move to next character
    this.currentPosition++;

    // Update accuracy
    this.stats.accuracy = Math.round((this.stats.correctChars / this.stats.totalChars) * 100);

    // Calculate WPM
    if (this.startTime) {
      const timeElapsed = (Date.now() - this.startTime) / 1000 / 60; // minutes
      const wordsTyped = this.stats.correctChars / 5; // 5 chars = 1 word
      this.stats.wpm = Math.round(wordsTyped / timeElapsed);
    }

    // Update UI
    this.render();
    this.updateStats();

    // Check if completed
    if (this.currentPosition >= this.targetText.length) {
      this.complete();
    }
  }

  /**
   * Play error animation
   */
  playErrorAnimation() {
    if (!this.codeDisplay) return;
    
    // Add shake animation
    this.codeDisplay.classList.add('shake-error');
    setTimeout(() => {
      this.codeDisplay.classList.remove('shake-error');
    }, 300);
  }

  /**
   * Update stats display
   */
  updateStats() {
    // Update WPM
    const wpmElement = document.querySelector('.text-2xl.font-mono.text-slate-300');
    if (wpmElement && wpmElement.parentElement.textContent.includes('WPM')) {
      wpmElement.textContent = this.stats.wpm || 0;
    }

    // Update Accuracy
    const accElements = document.querySelectorAll('.text-2xl.font-mono.text-slate-300');
    if (accElements.length >= 3) {
      accElements[2].textContent = this.stats.accuracy + '%';
    }

    // Update Time
    if (this.startTime) {
      const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const minutes = Math.floor(timeElapsed / 60);
      const seconds = timeElapsed % 60;
      const timeElement = document.querySelector('.text-2xl.font-mono.text-teal-400');
      if (timeElement) {
        timeElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }
    }
  }

  /**
   * Complete typing session
   */
  async complete() {
    this.isActive = false;
    
    // Calculate final time
    const timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Submit score to backend
    await this.submitScore({
      wpm: this.stats.wpm,
      accuracy: this.stats.accuracy,
      errors: this.errors,
      duration: timeElapsed,
      totalChars: this.stats.totalChars,
      correctChars: this.stats.correctChars
    });
    
    // Show completion modal
    this.showCompletionModal({
      wpm: this.stats.wpm,
      accuracy: this.stats.accuracy,
      errors: this.errors,
      time: timeString,
      totalChars: this.stats.totalChars,
      correctChars: this.stats.correctChars
    });
  }

  /**
   * Submit score to backend
   */
  async submitScore(stats) {
    const token = localStorage.getItem('token');
    
    // If user is not logged in, skip submission
    if (!token) {
      console.log('User not logged in, skipping score submission');
      return;
    }

    // Get language from global state (set in practice.js)
    const language = window.state?.language || 'JavaScript';
    
    console.log('Submitting score with language:', language);
    console.log('Window state:', window.state);

    try {
      const scoreData = {
        wpm: stats.wpm,
        accuracy: stats.accuracy,
        testType: language, // Use language as testType
        duration: stats.duration,
        wordsTyped: Math.floor(stats.correctChars / 5), // 5 chars = 1 word
        errorsCount: stats.errors
      };
      
      console.log('Score data being submitted:', scoreData);

      const response = await fetch('/api/user/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(scoreData)
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Score submitted successfully:', result);
        // Store updated stats for display
        this.submittedResult = result;
      } else {
        console.error('Failed to submit score:', result.message);
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    }
  }

  /**
   * Show completion modal with stats
   */
  showCompletionModal(stats) {
    // Add confetti for perfect score
    if (stats.accuracy === 100) {
      this.showConfetti();
    }

    // Create modal HTML
    const modalHTML = `
      <div id="completion-modal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn">
        <div class="bg-slate-900 border-2 border-teal-500 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl animate-scaleIn">
          <!-- Header -->
          <div class="text-center mb-6">
            <div class="text-6xl mb-4">${stats.accuracy === 100 ? '🏆' : stats.accuracy >= 95 ? '🎉' : stats.accuracy >= 80 ? '⭐' : '💪'}</div>
            <h2 class="text-3xl font-bold text-teal-400 mb-2">Challenge Complete!</h2>
            <p class="text-slate-400">Great job! Here are your results:</p>
          </div>

          <!-- Stats Grid -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <!-- WPM -->
            <div class="bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-center hover:border-teal-500/50 transition-all">
              <div class="text-xs text-slate-500 uppercase tracking-wide mb-1">Speed</div>
              <div class="text-3xl font-bold text-teal-400">${stats.wpm}</div>
              <div class="text-xs text-slate-500">WPM</div>
            </div>

            <!-- Accuracy -->
            <div class="bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-center hover:border-teal-500/50 transition-all">
              <div class="text-xs text-slate-500 uppercase tracking-wide mb-1">Accuracy</div>
              <div class="text-3xl font-bold ${stats.accuracy >= 95 ? 'text-green-400' : stats.accuracy >= 80 ? 'text-yellow-400' : 'text-red-400'}">${stats.accuracy}%</div>
              <div class="text-xs text-slate-500">${stats.correctChars}/${stats.totalChars} chars</div>
            </div>

            <!-- Time -->
            <div class="bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-center hover:border-teal-500/50 transition-all">
              <div class="text-xs text-slate-500 uppercase tracking-wide mb-1">Time</div>
              <div class="text-2xl font-bold text-slate-300">${stats.time}</div>
              <div class="text-xs text-slate-500">MM:SS</div>
            </div>

            <!-- Errors -->
            <div class="bg-slate-950/50 border border-slate-800 rounded-xl p-4 text-center hover:border-teal-500/50 transition-all">
              <div class="text-xs text-slate-500 uppercase tracking-wide mb-1">Errors</div>
              <div class="text-2xl font-bold ${stats.errors === 0 ? 'text-green-400' : 'text-red-400'}">${stats.errors}</div>
              <div class="text-xs text-slate-500">mistakes</div>
            </div>
          </div>

          <!-- Performance Message -->
          <div class="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 border border-teal-500/30 rounded-xl p-4 mb-6 text-center">
            <p class="text-sm text-slate-200 font-medium">${this.getPerformanceMessage(stats)}</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3">
            <button 
              onclick="window.location.href='/'"
              class="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              Home
            </button>
            <button 
              onclick="window.location.reload()"
              class="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:opacity-90 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 hover:scale-105"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              Play Again
            </button>
          </div>
        </div>
      </div>
    `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add animation styles if not already present
    if (!document.getElementById('modal-animations')) {
      const style = document.createElement('style');
      style.id = 'modal-animations';
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { 
            opacity: 0;
            transform: scale(0.9) translateY(20px);
          }
          to { 
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /**
   * Show confetti animation for perfect score
   */
  showConfetti() {
    const colors = ['#10b981', '#14b8a6', '#06b6d4', '#3b82f6', '#8b5cf6'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
      setTimeout(() => {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * window.innerWidth + 'px';
        confetti.style.top = '-10px';
        confetti.style.opacity = '1';
        confetti.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
        confetti.style.zIndex = '9999';
        confetti.style.pointerEvents = 'none';
        confetti.style.borderRadius = '50%';
        
        document.body.appendChild(confetti);

        const fallDuration = 2000 + Math.random() * 1000;
        const fallDistance = window.innerHeight + 100;
        const drift = (Math.random() - 0.5) * 200;

        confetti.animate([
          { 
            transform: `translateY(0) translateX(0) rotate(0deg)`,
            opacity: 1
          },
          { 
            transform: `translateY(${fallDistance}px) translateX(${drift}px) rotate(${360 + Math.random() * 360}deg)`,
            opacity: 0
          }
        ], {
          duration: fallDuration,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });

        setTimeout(() => confetti.remove(), fallDuration);
      }, i * 30);
    }
  }

  /**
   * Get performance message based on stats
   */
  getPerformanceMessage(stats) {
    if (stats.accuracy === 100 && stats.wpm >= 80) {
      return "🏆 Perfect! You're a typing master!";
    } else if (stats.accuracy >= 95 && stats.wpm >= 60) {
      return "⭐ Excellent work! Keep it up!";
    } else if (stats.accuracy >= 90 && stats.wpm >= 40) {
      return "👍 Great job! You're improving!";
    } else if (stats.accuracy >= 80) {
      return "💪 Good effort! Practice makes perfect!";
    } else if (stats.accuracy >= 70) {
      return "📈 Keep practicing! You're getting there!";
    } else {
      return "🎯 Focus on accuracy first, speed will follow!";
    }
  }

  /**
   * Attach keyboard listener
   */
  attachKeyboardListener() {
    // Remove existing listener if any
    if (this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler);
    }

    // Create new handler
    this.keyboardHandler = (e) => this.handleKeyPress(e);
    document.addEventListener('keydown', this.keyboardHandler);
  }

  /**
   * Detach keyboard listener
   */
  detach() {
    if (this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
    this.isActive = false;
  }

  /**
   * Escape HTML characters
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
      '\n': '<br>',
      '\t': '&nbsp;&nbsp;&nbsp;&nbsp;',
      ' ': '&nbsp;'
    };
    return text.replace(/[&<>"'\n\t ]/g, (m) => map[m]);
  }
}

// Export for use in other scripts
window.TypingEngine = TypingEngine;
