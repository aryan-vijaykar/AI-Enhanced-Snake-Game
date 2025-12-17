/**
 * InputManager - Handles keyboard input and direction queuing
 * Requirements: 6.1, 6.3, 6.4 - Responsive controls, reversal prevention, input queuing
 */

export class InputManager {
    constructor() {
        // Direction queue for handling rapid inputs
        this.directionQueue = [];
        this.maxQueueSize = 3; // Limit queue size to prevent excessive buffering
        
        // Current direction tracking for reversal prevention
        this.currentDirection = 'right';
        
        // Callback functions
        this.onDirectionChange = null;
        this.onGameControl = null;
        
        // Input state tracking
        this.keysPressed = new Set();
        this.lastInputTime = 0;
        this.inputCooldown = 50; // Minimum time between direction changes (ms)
        
        this.setupEventListeners();
    }

    /**
     * Set up keyboard event listeners
     * Requirements: 6.1 - Respond to direction changes within one frame
     */
    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });
        
        document.addEventListener('keyup', (event) => {
            this.handleKeyUp(event);
        });
        
        // Prevent default behavior for game keys
        document.addEventListener('keydown', (event) => {
            if (this.isGameKey(event.key)) {
                event.preventDefault();
            }
        });
    }

    /**
     * Handle key down events
     * Requirements: 6.1, 6.4 - Responsive input and direction queuing
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        
        // Prevent key repeat
        if (event.repeat) return;

        
        // Handle direction input
        const direction = this.getDirectionFromKey(key);
        if (direction) {
            this.queueDirection(direction);
            return;
        }
        
        // Handle game control input
        this.handleGameControls(key);
    }

    /**
     * Handle key up events
     * @param {KeyboardEvent} event - Keyboard event
     */
    handleKeyUp(event) {
    // not needed
}


    /**
     * Convert key to direction
     * Requirements: 6.1 - Support arrow keys and WASD
     * @param {string} key - Key pressed
     * @returns {string|null} Direction or null
     */
    getDirectionFromKey(key) {
        const keyMap = {
            'arrowup': 'up',
            'w': 'up',
            'arrowdown': 'down',
            's': 'down',
            'arrowleft': 'left',
            'a': 'left',
            'arrowright': 'right',
            'd': 'right'
        };
        
        return keyMap[key] || null;
    }

    /**
     * Queue direction change with validation
     * Requirements: 6.3, 6.4 - Prevent invalid reversals and queue inputs
     * @param {string} direction - New direction
     */
    queueDirection(direction) {
        const currentTime = Date.now();
        
        // Apply input cooldown to prevent spam
        if (currentTime - this.lastInputTime < this.inputCooldown) {
            return;
        }
        
        // Check if direction is valid (not opposite of current)
        if (!this.isValidDirection(direction)) {
            return;
        }
        
        // Check if direction is already in queue
        if (this.directionQueue.includes(direction)) {
            return;
        }
        
        // Add to queue if not full
        if (this.directionQueue.length < this.maxQueueSize) {
            this.directionQueue.push(direction);
            this.lastInputTime = currentTime;
        }
    }

    /**
     * Check if direction change is valid (prevents reversal)
     * Requirements: 6.3 - Prevent immediate reversal that would cause self-collision
     * @param {string} newDirection - Proposed new direction
     * @returns {boolean} True if direction change is valid
     */
    isValidDirection(newDirection) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        
        // Get the direction to check against (current or last queued)
        const checkDirection = this.directionQueue.length > 0 
            ? this.directionQueue[this.directionQueue.length - 1]
            : this.currentDirection;
        
        // Prevent immediate reversal
        return opposites[checkDirection] !== newDirection;
    }

    /**
     * Get next direction from queue
     * Requirements: 6.4 - Process queued direction changes appropriately
     * @returns {string|null} Next direction or null if queue is empty
     */
    getNextDirection() {
        if (this.directionQueue.length > 0) {
            const direction = this.directionQueue.shift();
            this.currentDirection = direction;
            
            // Notify game engine of direction change
            if (this.onDirectionChange) {
                this.onDirectionChange(direction);
            }
            
            return direction;
        }
        
        return null;
    }

    /**
     * Update current direction (called by game engine)
     * @param {string} direction - Current direction
     */
    setCurrentDirection(direction) {
        this.currentDirection = direction;
    }

    /**
     * Handle game control keys (pause, restart, etc.)
     * @param {string} key - Key pressed
     */
    handleGameControls(key) {
        let action = null;
        
        switch (key) {
            case ' ':
            case 'space':
            case 'p':
                action = 'pause';
                break;
            case 'r':
                action = 'restart';
                break;
            case 'escape':
                action = 'menu';
                break;
            case 'h':
                action = 'toggleHints';
                break;
        }
        
        if (action && this.onGameControl) {
            this.onGameControl(action);
        }
    }

    /**
     * Check if key is a game-related key
     * @param {string} key - Key to check
     * @returns {boolean} True if key is game-related
     */
    isGameKey(key) {
        const gameKeys = [
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'w', 'W', 'a', 'A', 's', 'S', 'd', 'D',
            ' ', 'p', 'P', 'r', 'R', 'Escape', 'h', 'H'
        ];
        
        return gameKeys.includes(key);
    }

    /**
     * Clear the direction queue
     */
    clearQueue() {
        this.directionQueue = [];
    }

    /**
     * Get current queue size
     * @returns {number} Number of queued directions
     */
    getQueueSize() {
        return this.directionQueue.length;
    }

    /**
     * Set direction change callback
     * @param {Function} callback - Callback function for direction changes
     */
    setDirectionChangeCallback(callback) {
        this.onDirectionChange = callback;
    }

    /**
     * Set game control callback
     * @param {Function} callback - Callback function for game controls
     */
    setGameControlCallback(callback) {
        this.onGameControl = callback;
    }

    /**
     * Process queued inputs (called by game engine each frame)
     * Requirements: 6.4 - Process direction changes appropriately
     */
    processQueue() {
        // Process one direction change per frame to maintain smooth gameplay
        this.getNextDirection();
    }

    /**
     * Reset input manager state
     */
    reset() {
        this.directionQueue = [];
        this.currentDirection = 'right';
        this.keysPressed.clear();
        this.lastInputTime = 0;
    }
}