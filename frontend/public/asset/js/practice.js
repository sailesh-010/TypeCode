lucide.createIcons();

function change() {
  window.location.href = "/";
}

const langMap = {
  javascript: "JavaScript",
  python: "Python",
  java: "Java",
  c: "C",
  cpp: "C++",
};

// Make state global so typing engine can access it
window.state = {
  language: null,
  difficulty: null,
  topic: null,
};

document.addEventListener("DOMContentLoaded", () => {
  const topicInput = document.getElementById("topic");
  const topicRandom = document.getElementById("topic-random");
  const topicCustom = document.getElementById("topic-custom");
  const startBtn = document.getElementById("start-btn");

  // Toggle topic input based on radio selection
  topicRandom?.addEventListener("change", () => {
    topicInput.disabled = true;
    topicInput.value = "";
  });

  topicCustom?.addEventListener("change", () => {
    topicInput.disabled = false;
    topicInput.focus();
  });

  // Track language selection
  document.querySelectorAll('input[name="language"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      const l = radio.value.toLowerCase();
      window.state.language = langMap[l] || l;
      lucide.createIcons();
    });
  });

  // Track difficulty selection
  document.querySelectorAll('input[name="difficulty"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      window.state.difficulty = radio.value;
    });
  });

  // Start button click
  startBtn?.addEventListener("click", async () => {
    const langSelected = document.querySelector(
      'input[name="language"]:checked'
    );
    const diffSelected = document.querySelector(
      'input[name="difficulty"]:checked'
    );

    if (!langSelected) {
      alert("Please select a language");
      return;
    }
    if (!diffSelected) {
      alert("Please select a difficulty");
      return;
    }

    const l = langSelected.value.toLowerCase();
    window.state.language = langMap[l] || langSelected.value;
    window.state.difficulty = diffSelected.value;
    window.state.topic = topicCustom?.checked ? topicInput.value : "Random";

    // Enter game mode
    document.body.classList.add("game-mode");

    // Update playground info - use display format for UI
    const langDisplay = document.querySelector(
      "#playground-section .fixed.bottom-8.right-8 span:first-child"
    );
    const diffDisplay = document.querySelector(
      "#playground-section .fixed.bottom-8.right-8 span:last-child"
    );
    const filenameDisplay = document.getElementById("filename-display");

    // Map language to file extension
    const extMap = {
      'JavaScript': 'js',
      'Python': 'py',
      'Java': 'java',
      'C': 'c',
      'C++': 'cpp'
    };

    if (langDisplay) langDisplay.textContent = window.state.language;
    if (diffDisplay) diffDisplay.textContent = window.state.difficulty;
    if (filenameDisplay) {
      const topicName =
        window.state.topic === "Random" ? "main" : window.state.topic.replace(/\s+/g, "_");
      const ext = extMap[window.state.language] || 'txt';
      filenameDisplay.textContent = `${topicName}.${ext}`;
    }

    console.log("Starting practice:", window.state);
    
    // Load code challenge from AI
    await loadPracticeCode();
    
    // Initialize Keyboard Visualizer
    setTimeout(() => {
        const keyboardContainer = document.getElementById('keyboard-container');
        if (keyboardContainer && window.KeyboardVisualizer) {
            const keyboard = new window.KeyboardVisualizer(keyboardContainer);
            
            // Listen for user typing
            document.addEventListener('keydown', (e) => {
                // Ignore keys if not in game mode or if modifier keys (ctrl/alt)
                if (!document.body.classList.contains('game-mode') || e.ctrlKey || e.altKey || e.metaKey) return;
                
                keyboard.simulateKey(e.key);
            });
        }
    }, 100);
  });
});

async function loadPracticeCode() {
  const codeDisplay = document.getElementById('code-display');
  if (!codeDisplay) return;

  // Show loading state
  codeDisplay.textContent = '# Loading code challenge from AI...';

  try {
    // Check if AI helper is available
    if (typeof AIHelper === 'undefined') {
      codeDisplay.textContent = '// Error: AI Helper not loaded. Please refresh the page.';
      return;
    }

    const challenge = await AIHelper.generateChallenge(
      window.state.language || 'JavaScript',
      window.state.difficulty || 'Medium',
      window.state.topic || 'Random'
    );
    
    if (challenge) {
      // Initialize typing engine
      if (typeof TypingEngine !== 'undefined') {
        const typingEngine = new TypingEngine(codeDisplay);
        typingEngine.init(challenge);
        
        // Store in global state for later use
        window.currentTypingEngine = typingEngine;
      } else {
        // Fallback: just display the code
        codeDisplay.textContent = challenge;
      }
      
      return;
    } else {
      codeDisplay.textContent = '// No code returned. Please try again.';
    }
  } catch (error) {
    codeDisplay.textContent = '// Error loading code. Please refresh and try again.';
  }
}

