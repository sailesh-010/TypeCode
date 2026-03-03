const HAND_BASE = "asset/images";

const KEYBOARD_LAYOUT = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
    ['ShiftLeft', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'ShiftRight'],
    [[' ', 'spacebar']]
];

const SHIFT_MAP = {
    '`': '~', '1': '!', '2': '@', '3': '#', '4': '$', '5': '%', '6': '^', '7': '&', '8': '*', '9': '(', '0': ')',
    '-': '_', '=': '+', '[': '{', ']': '}', '\\': '|', ';': ':', "'": '"', ',': '<', '.': '>', '/': '?'
};

const KEY_MAPPING = {
    left: {
        index: ['4', '5', 'r', 't', 'f', 'g', 'v', 'b'],
        middle: ['3', 'e', 'd', 'c'],
        ring: ['2', 'w', 's', 'x'],
        pinky: ['`', 'Tab', 'Caps', 'ShiftLeft', '1', 'q', 'a', 'z']
    },
    right: {
        index: ['6', '7', 'y', 'u', 'h', 'j', 'n', 'm'],
        middle: ['8', 'i', 'k', ','],
        ring: ['9', 'o', 'l', '.'],
        pinky: ['0', 'p', ';', '/', "'", '-', '=', '[', ']', '\\', 'Backspace', 'Enter', 'ShiftRight']
    }
};

const finger = {
    left: {
        index: "asset/images/left-top-row-1.png",
        middle: "asset/images/left-top-row-3.png",
        ring: "asset/images/left-top-row-4.png",
        pinky: "asset/images/left-top-row-5.png"
    },
    right: {
        index: "asset/images/right-top-row-1.png",
        middle: "asset/images/right-top-row-3.png",
        ring: "asset/images/right-top-row-4.png",
        pinky: "asset/images/right-top-row-5.png"
    }
}

const FINGER_OFFSETS = {
    left: { 
        pinky: [25, 60], 
        pinky_stretch: [35, 70], 
        ring: [80, 35], 
        middle: [125, 25], 
        index: [170, 35]
    },
    right: { 
        index: [280, 60], 
        middle: [225, 30], 
        ring: [180, 50], 
        pinky_stretch: [125, 75], 
        pinky: [70, 65]
    }
};

const FINGER_TO_IMAGE = {
    pinky_stretch: 5,
    pinky: 4,
    ring: 3,
    middle: 2,
    index: 1
};

class KeyboardVisualizer {
    constructor(keyboardContainer) {
        this.keyboardContainer = keyboardContainer;
        this.leftHand = document.getElementById('left-hand');
        this.rightHand = document.getElementById('right-hand');
        this.keyElements = new Map();
        this.keyMapping = this.getKeyMapping();
        this.lastHand = 'right';
        
        // Configuration for resting positions
        this.REST_POS = { left: [50, 80], right: [500, 80] };

        if (!this.keyboardContainer || !this.leftHand || !this.rightHand) {
            console.error('Missing required DOM elements for KeyboardVisualizer');
            return;
        }

        this.init();
    }

    init() {
        this.buildKeyboard();
        // this.preloadImages(); // Optional: can re-enable if needed
    }

    buildKeyboard() {
        const keyboard = document.getElementById('keyboard');
        if (!keyboard) return;
        keyboard.innerHTML = ''; // Clear existing if any

        KEYBOARD_LAYOUT.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'flex gap-1.5 justify-center';
            
            row.forEach(key => {
                const isArray = Array.isArray(key);
                const keyVal = isArray ? key[0] : key;
                const keyDisplay = isArray ? '' : key;
                const el = document.createElement('div');
                el.dataset.key = keyVal;
                el.textContent = keyDisplay;

                const { width, height, bgColor, textColor } = this.getKeyStyles(keyVal);
                el.className = `key rounded text-center text-xs font-bold flex items-center justify-center transition-colors ${width} ${height} ${bgColor} ${textColor}`;

                this.keyElements.set(keyVal, el);
                rowDiv.appendChild(el);
            });
            keyboard.appendChild(rowDiv);
        });
    }

    getKeyStyles(keyVal) {
        const widthMap = {
            'Backspace': 'w-16',
            'Tab': 'w-14',
            'Caps': 'w-16',
            'ShiftLeft': 'w-20',
            'ShiftRight': 'w-24',
            'Enter': 'w-20',
            ' ': 'w-80'
        };

        const specialKeys = ['Backspace', 'Tab', 'Caps', 'ShiftLeft', 'ShiftRight'];
        
        return {
            width: widthMap[keyVal] || 'w-10',
            height: 'h-10',
            bgColor: specialKeys.includes(keyVal) ? 'bg-gray-600' : (keyVal === 'Enter' ? 'bg-blue-600' : 'bg-gray-700'),
            textColor: keyVal === 'Enter' ? 'text-white' : 'text-gray-300'
        };
    }

    getKeyMapping() {
        const map = new Map();
        Object.entries(KEY_MAPPING).forEach(([hand, fingers]) => {
            Object.entries(fingers).forEach(([finger, keys]) => {
                keys.forEach(key => map.set(key, { hand, finger }));
            });
        });
        map.set(' ', { hand: 'both', finger: 'thumb' });
        return map;
    }

    getKeyPos(keyEl, hand, finger) {
        const kbRect = this.keyboardContainer.getBoundingClientRect();
        const keyRect = keyEl.getBoundingClientRect();
        
        // Calculate scale if the keyboard is scaled via CSS transform
        // Approximation: assumes the container width is the reference
        // Better to use getBoundingClientRect directly
        const currentScale = kbRect.width / this.keyboardContainer.offsetWidth;
        
        const offset = FINGER_OFFSETS[hand][finger] || FINGER_OFFSETS[hand].index;
        
        // Relative position inside the container
        const relLeft = (keyRect.left - kbRect.left) / currentScale;
        const relTop = (keyRect.top - kbRect.top) / currentScale;
        const keyW = keyRect.width / currentScale;
        const keyH = keyRect.height / currentScale;

        return [relLeft + keyW / 2 - offset[0], relTop + keyH / 2 - offset[1]];
    }

    updateHand(key) {
        const mapping = this.keyMapping.get(key);
        if (!mapping) return;

        let hand = mapping.hand === 'both' ? (this.lastHand === 'left' ? 'right' : 'left') : mapping.hand;
        this.lastHand = hand;

        const handEl = hand === 'left' ? this.leftHand : this.rightHand;
        const otherHand = hand === 'left' ? this.rightHand : this.leftHand;
        
        handEl.classList.add('active');
        otherHand.classList.remove('active');

        const keyEl = this.keyElements.get(key);
        if (!keyEl) return;

        const [x, y] = this.getKeyPos(keyEl, hand, mapping.finger);
        const imageSrc = finger[hand][mapping.finger];
        
        handEl.src = imageSrc;
        handEl.style.transform = `translate(${x}px, ${y}px)`;
        handEl.classList.add('pressing');
    }

    resetHands(delay = 150) {
        setTimeout(() => {
            // Only reset if no keys are currently pressed
            if (document.querySelector('.key.pressed')) return;
            
            this.leftHand.classList.remove('pressing', 'active');
            this.rightHand.classList.remove('pressing', 'active');
            
            this.leftHand.src = `asset/images/left-resting-hand.png`;
            this.rightHand.src = `asset/images/right-resting-hand.png`;
            
            this.leftHand.style.transform = `translate(${this.REST_POS.left[0]}px, ${this.REST_POS.left[1]}px)`;
            this.rightHand.style.transform = `translate(${this.REST_POS.right[0]}px, ${this.REST_POS.right[1]}px)`;
        }, delay);
    }

    // Public method to simulate a key press from the script
    simulateKey(char) {
        // 1. Identify key and shift requirement
        let key = char;
        let needsShift = false;

        // Handle special characters and Shift mapping
        if (/[A-Z]/.test(char)) {
            key = char.toLowerCase();
            needsShift = true;
        } else {
            // Check symbols in SHIFT_MAP
            for (const [base, shifted] of Object.entries(SHIFT_MAP)) {
                if (shifted === char) {
                    key = base;
                    needsShift = true;
                    break;
                }
            }
        }
        
        if (char === ' ') key = ' ';
        if (char === '\n') key = 'Enter';
        
        // 2. Visualize Shift if needed
        if (needsShift) {
            const shiftKey = this.lastHand === 'left' ? 'ShiftRight' : 'ShiftLeft'; // Opposite hand for shift usually
            const shiftEl = this.keyElements.get(shiftKey);
            if (shiftEl) {
                shiftEl.classList.add('pressed');
                setTimeout(() => shiftEl.classList.remove('pressed'), 150);
            }
        }

        // 3. Visualize Main Key
        const keyEl = this.keyElements.get(key);
        if (keyEl) {
            keyEl.classList.add('pressed');
            this.updateHand(key);
            
            // Release after a short delay
            setTimeout(() => {
                keyEl.classList.remove('pressed');
                this.resetHands();
            }, 150);
        }
    }
}

// Export for usage in script.js
window.KeyboardVisualizer = KeyboardVisualizer;