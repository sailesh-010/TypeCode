lucide.createIcons();
const MOCK_SNIPPETS = {
  javascript: `function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const later = () => {
      clearTimeout(timeout);
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}`,
};

const codeList = [MOCK_SNIPPETS.javascript];

const state = {
  code: MOCK_SNIPPETS.javascript,
  typedIndex: 0,
  chars: [],
  currentCodeIndex: 0,
};

function getCharClasses(index) {
  const classes = [];
  if (index < state.typedIndex) {
    classes.push("text-teal-400");
  } else {
    classes.push("text-slate-500");
  }
  return classes;
}

function autotype() {
  state.typedIndex = 0;
  state.code = codeList[state.currentCodeIndex];
  state.chars = state.code.split("");

  const typingInterval = setInterval(() => {
    if (state.typedIndex < state.chars.length) {
      state.typedIndex++;
      rendercode();
    } else {
      clearInterval(typingInterval);
      setTimeout(() => {
        state.currentCodeIndex = (state.currentCodeIndex + 1) % codeList.length;
        autotype();
      }, 1200);
    }
  }, 250);
}

function rendercode() {
  const code = document.getElementById("code-display");
  let html = "";

  state.chars.forEach((char, index) => {
    const classes = getCharClasses(index).join(" ");

    if (index === state.typedIndex) {
      html += `<span class="cursor">|</span>`;
    }

    let displayChar = char;
    if (char === "<") displayChar = "&lt;";
    else if (char === ">") displayChar = "&gt;";

    html += `<span class="${classes}">${displayChar}</span>`;
  });

  if (state.typedIndex === state.chars.length) {
    html += `<span class="cursor">|</span>`;
  }
  code.innerHTML = html;
}

let keyboard = null;

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => {
    const overlay = document.getElementById("init-overlay");
    if (overlay) overlay.style.display = "none";
  }, 500);
  
  // Initialize Keyboard
  const keyboardContainer = document.getElementById('keyboard-container');
  if (keyboardContainer && window.KeyboardVisualizer) {
    keyboard = new window.KeyboardVisualizer(keyboardContainer);
  }

  autotype();
});

function autotype() {
  state.typedIndex = 0;
  state.code = codeList[state.currentCodeIndex];
  state.chars = state.code.split("");

  const typingInterval = setInterval(() => {
    if (state.typedIndex < state.chars.length) {
      const char = state.chars[state.typedIndex];
      
      // Trigger visual keyboard
      if (keyboard) {
        keyboard.simulateKey(char);
      }

      state.typedIndex++;
      rendercode();
    } else {
      clearInterval(typingInterval);
      setTimeout(() => {
        state.currentCodeIndex = (state.currentCodeIndex + 1) % codeList.length;
        autotype();
      }, 1200);
    }
  }, 100); // Speed up slightly for better flow
}

function refresh() {
  window.location.reload();
}
