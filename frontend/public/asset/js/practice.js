lucide.createIcons();

function change() {
  window.location.href = "/";
}

const langMap = {
  javascript: "js",
  python: "py",
  java: "java",
  c: "c",
  cpp: "cpp",
};

const state = {
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
      state.language = langMap[l] || l;
      lucide.createIcons();
    });
  });

  // Track difficulty selection
  document.querySelectorAll('input[name="difficulty"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      state.difficulty = radio.value;
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
    state.language = langMap[l] || l;
    state.difficulty = diffSelected.value;
    state.topic = topicCustom?.checked ? topicInput.value : "random";

    // Enter game mode
    document.body.classList.add("game-mode");

    // Update playground info
    const langDisplay = document.querySelector(
      "#playground-section .fixed.bottom-8.right-8 span:first-child"
    );
    const diffDisplay = document.querySelector(
      "#playground-section .fixed.bottom-8.right-8 span:last-child"
    );
    const filenameDisplay = document.getElementById("filename-display");

    if (langDisplay) langDisplay.textContent = state.language;
    if (diffDisplay) diffDisplay.textContent = state.difficulty;
    if (filenameDisplay) {
      const topicName =
        state.topic === "random" ? "main" : state.topic.replace(/\s+/g, "_");
      filenameDisplay.textContent = `${topicName}.${state.language}`;
    }

    console.log("Starting practice:", state);
    
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
  codeDisplay.textContent = '# Loading code challenge...';

  try {
    // Use AI helper if available
    if (typeof AIHelper !== 'undefined') {
      const challenge = await AIHelper.generateChallenge(
        state.language || 'javascript',
        state.difficulty || 'easy',
        state.topic || 'random'
      );
      
      if (challenge) {
        codeDisplay.textContent = challenge;
        console.log('[Practice] Code loaded from AI');
        return;
      }
    }
  } catch (error) {
    console.warn('[Practice] AI challenge failed:', error);
  }
}

