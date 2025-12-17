/**
 * GameEngine - Main game loop, state management, and timing
 * Handles game states and timing as per Requirements 1.5, 6.5
 */

import { Snake } from '../entities/Snake.js';
import { Food } from '../entities/Food.js';
import { GameBoard } from '../entities/GameBoard.js';
import { InputManager } from './InputManager.js';
import { DifficultyManager } from '../ai/DifficultyManager.js';
import { HintSystem } from '../ai/HintSystem.js';

export class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Game configuration
        this.cellSize = 20;
        this.gridWidth = Math.floor(canvas.width / this.cellSize);
        this.gridHeight = Math.floor(canvas.height / this.cellSize);
        
        // Game entities
        this.snake = null;
        this.food = null;
        this.gameBoard = null;
        this.inputManager = null;
        this.difficultyManager = null;
        this.hintSystem = null;
        
        // Game state
        this.gameState = 'stopped'; // 'running', 'paused', 'stopped', 'gameOver'
        this.score = 0;
        this.gameSpeed = 150; // milliseconds between moves
        this.lastMoveTime = 0;
        
        // Statistics
        this.startTime = 0;
        this.foodCollected = 0;
        
        // Event callbacks
        this.onScoreUpdate = null;
        this.onGameOver = null;
        this.onStateChange = null;
        
        this.initializeGame();
    }

    /**
     * Initialize game entities and reset state
     * Requirements: 1.5 - Game initialization and state management
     */
    initializeGame() {
        // Create game entities
        const startX = Math.floor(this.gridWidth / 2);
        const startY = Math.floor(this.gridHeight / 2);
        
        this.snake = new Snake(startX, startY);
        this.food = new Food();
        this.gameBoard = new GameBoard(this.canvas.width, this.canvas.height, this.cellSize);
        
        // Initialize input manager if not already created
        if (!this.inputManager) {
            this.inputManager = new InputManager();
            this.setupInputCallbacks();
        }
        
        // Initialize difficulty manager if not already created
        if (!this.difficultyManager) {
            this.difficultyManager = new DifficultyManager();
        }
        
        // Initialize hint system if not already created
        if (!this.hintSystem) {
            this.hintSystem = new HintSystem(this.gridWidth, this.gridHeight, this.cellSize);
        }
        
        // Reset input manager state
        this.inputManager.reset();
        
        // Spawn initial food
        this.spawnFood();
        
        // Reset game state
        this.score = 0;
        this.foodCollected = 0;
        this.gameState = 'stopped';
        this.lastMoveTime = 0;
        
        // Notify UI of initial state
        this.notifyScoreUpdate();
    }

    /**
     * Start the game
     * Requirements: 1.5 - Game state management
     */
    start() {
        if (this.gameState === 'stopped' || this.gameState === 'gameOver') {
            this.initializeGame();
        }
        
        this.gameState = 'running';
        this.startTime = Date.now();
        this.lastMoveTime = Date.now();
        
        // Initialize difficulty manager for new game
        this.difficultyManager.initializeGame();
        this.gameSpeed = this.difficultyManager.getCurrentSpeed();
        
        // Enable hints by default (matching the UI checkbox state)
        if (this.hintSystem) {
            this.hintSystem.enableHints();
        }
        
        this.notifyStateChange();
        this.gameLoop();
    }

    /**
     * Pause/unpause the game
     * Requirements: 1.5 - Game state management
     */
    togglePause() {
        if (this.gameState === 'running') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'running';
            this.lastMoveTime = Date.now(); // Reset timing to prevent immediate move
            this.gameLoop();
        }
        
        this.notifyStateChange();
    }

    /**
     * Stop the game
     * Requirements: 1.5 - Game state management
     */
    stop() {
        this.gameState = 'stopped';
        this.notifyStateChange();
    }

    /**
     * Main game loop with consistent timing
     * Requirements: 1.5, 6.5 - Continuous movement and consistent timing
     */
    gameLoop() {
        if (this.gameState !== 'running') {
            return;
        }

        const currentTime = Date.now();
        
        // Check if it's time to move the snake
        if (currentTime - this.lastMoveTime >= this.gameSpeed) {
            this.update();
            this.lastMoveTime = currentTime;
        }
        
        this.render();
        
        // Continue the loop
        requestAnimationFrame(() => this.gameLoop());
    }

    /**
     * Update game logic
     * Requirements: 1.1, 1.2, 1.3, 1.4, 6.4 - Core game mechanics and input processing
     */
    update() {
        if (!this.snake.isAlive()) {
            this.endGame();
            return;
        }

        // Process queued input before moving
        this.inputManager.processQueue();
        
        // Update input manager with current snake direction
        this.inputManager.setCurrentDirection(this.snake.direction);

        // Move the snake
        this.snake.move();
        
        // Check for collisions
        if (this.snake.checkCollision(this.gridWidth, this.gridHeight)) {
            this.endGame();
            return;
        }
        
        // Check for food collection
        const head = this.snake.getHead();
        if (this.food.isAt(head.x, head.y)) {
            this.collectFood();
        }
        
        // Update AI hints if enabled
        if (this.hintSystem && this.hintSystem.areHintsEnabled()) {
            this.hintSystem.updatePath(head, this.food.getPosition(), this.snake.getBody());
        }
    }

    /**
     * Handle food collection
     * Requirements: 1.2, 1.4 - Food collection and respawning
     */
    collectFood() {
        // Grow the snake
        this.snake.grow();
        
        // Update score
        this.score += this.food.getValue();
        this.foodCollected++;
        
        // Record food collection for difficulty adjustment
        this.difficultyManager.recordFoodCollection(this.score, this.snake.getLength());
        
        // Update game speed based on difficulty manager
        this.gameSpeed = this.difficultyManager.getCurrentSpeed();
        
        // Spawn new food
        this.spawnFood();
        
        // Notify UI of score update
        this.notifyScoreUpdate();
    }

    /**
     * Spawn food at random empty location
     * Requirements: 1.4 - Food spawning at empty locations
     */
    spawnFood() {
        const occupiedPositions = this.snake.getBody();
        this.food.spawn(this.gridWidth, this.gridHeight, occupiedPositions);
    }

    /**
     * End the current game
     * Requirements: 1.3 - Game ending on collision
     */
    endGame() {
        this.gameState = 'gameOver';
        
        const survivalTime = Date.now() - this.startTime;
        const gameStats = {
            score: this.score,
            length: this.snake.getLength(),
            survivalTime: survivalTime,
            foodCollected: this.foodCollected
        };
        
        // Record game end for difficulty adjustment
        this.difficultyManager.recordGameEnd(gameStats);
        
        this.notifyGameOver(gameStats);
        this.notifyStateChange();
    }

    /**
     * Render the game with retro pixel art styling
     * Requirements: 4.1, 4.3, 4.4 - Retro aesthetics, visual effects, and UI updates
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Disable image smoothing for crisp pixel art
        this.ctx.imageSmoothingEnabled = false;
        
        // Render game board
        this.gameBoard.render(this.ctx);
        
        // Render snake with retro styling
        this.renderSnake();
        
        // Render food with retro styling
        this.renderFood();
        
        // Render AI hints if enabled
   //    if (this.hintSystem && this.hintSystem.areHintsEnabled()) {
     //       this.hintSystem.render(this.ctx, this.snake.getHead(), this.snake.getBody());
   //     }
    }

    /**
     * Render snake with retro pixel art styling
     * Requirements: 4.1, 4.3 - Retro aesthetics and visual effects
     */
    renderSnake() {
        const body = this.snake.getBody();
        
        body.forEach((segment, index) => {
            const x = segment.x * this.cellSize;
            const y = segment.y * this.cellSize;
            const size = this.cellSize - 2; // Leave 2px border for retro look
            
            if (index === 0) {
                // Snake head - brighter green with glow effect
                this.ctx.fillStyle = '#00ff41';
                this.ctx.fillRect(x + 1, y + 1, size, size);
                
                // Add inner highlight for 3D effect
                this.ctx.fillStyle = '#66ff66';
                this.ctx.fillRect(x + 3, y + 3, size - 4, size - 4);
                
                // Add eyes for character
                this.ctx.fillStyle = '#000000';
                const eyeSize = 2;
                const eyeOffset = 4;
                
                // Position eyes based on direction
                const direction = this.snake.direction;
                if (direction === 'right') {
                    this.ctx.fillRect(x + size - eyeOffset, y + eyeOffset, eyeSize, eyeSize);
                    this.ctx.fillRect(x + size - eyeOffset, y + size - eyeOffset, eyeSize, eyeSize);
                } else if (direction === 'left') {
                    this.ctx.fillRect(x + eyeOffset - 2, y + eyeOffset, eyeSize, eyeSize);
                    this.ctx.fillRect(x + eyeOffset - 2, y + size - eyeOffset, eyeSize, eyeSize);
                } else if (direction === 'up') {
                    this.ctx.fillRect(x + eyeOffset, y + eyeOffset - 2, eyeSize, eyeSize);
                    this.ctx.fillRect(x + size - eyeOffset, y + eyeOffset - 2, eyeSize, eyeSize);
                } else if (direction === 'down') {
                    this.ctx.fillRect(x + eyeOffset, y + size - eyeOffset, eyeSize, eyeSize);
                    this.ctx.fillRect(x + size - eyeOffset, y + size - eyeOffset, eyeSize, eyeSize);
                }
            } else {
                // Snake body - darker green with gradient effect
                const intensity = Math.max(0.3, 1 - (index * 0.05)); // Fade towards tail
                const green = Math.floor(255 * intensity);
                
                this.ctx.fillStyle = `rgb(0, ${green}, 0)`;
                this.ctx.fillRect(x + 1, y + 1, size, size);
                
                // Add inner highlight for 3D effect
                this.ctx.fillStyle = `rgba(102, 255, 102, ${intensity * 0.5})`;
                this.ctx.fillRect(x + 3, y + 3, size - 4, size - 4);
            }
            
            // Add retro border effect
            this.ctx.strokeStyle = '#004400';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x + 1, y + 1, size, size);
        });
    }

    /**
     * Render food with retro pixel art styling and animation
     * Requirements: 4.1, 4.3 - Retro aesthetics and visual effects
     */
    renderFood() {
        const pos = this.food.getPosition();
        const x = pos.x * this.cellSize;
        const y = pos.y * this.cellSize;
        const size = this.cellSize - 2;
        
        // Animate food with pulsing effect
        const time = Date.now() * 0.005;
        const pulse = Math.sin(time) * 0.1 + 0.9; // Pulse between 0.8 and 1.0
        const glowSize = Math.floor(size * pulse);
        const offset = Math.floor((size - glowSize) / 2);
        
        // Outer glow effect
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        this.ctx.fillRect(x - 1, y - 1, size + 4, size + 4);
        
        // Main food body - bright red
        this.ctx.fillStyle = '#ff0040';
        this.ctx.fillRect(x + 1, y + 1, size, size);
        
        // Inner highlight for 3D effect
        this.ctx.fillStyle = '#ff6666';
        this.ctx.fillRect(x + 3, y + 3, size - 4, size - 4);
        
        // Pulsing center
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(
            x + 1 + offset, 
            y + 1 + offset, 
            glowSize, 
            glowSize
        );
        
        // Add retro border
        this.ctx.strokeStyle = '#660000';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x + 1, y + 1, size, size);
        
        // Add sparkle effect
        if (Math.random() < 0.1) { // 10% chance per frame
            const sparkleX = x + Math.random() * size;
            const sparkleY = y + Math.random() * size;
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(sparkleX, sparkleY, 1, 1);
        }
    }

    /**
     * Handle direction input (called by InputManager)
     * Requirements: 6.1 - Respond to direction changes within one frame
     * @param {string} direction - New direction
     */
    changeDirection(direction) {
    if (this.gameState === 'running' && this.snake) {
        this.snake.changeDirection(direction);

    }
}


    /**
     * Handle game control input (called by InputManager)
     * @param {string} action - Game control action
     */
    handleGameControl(action) {
        switch (action) {
            case 'pause':
                this.togglePause();
                break;
            case 'restart':
                this.start();
                break;
            case 'toggleHints':
                if (this.hintSystem) {
                    const hintsEnabled = this.hintSystem.toggleHints();
                    console.log('AI hints toggled:', hintsEnabled);
                }
                break;
        }
    }

    /**
     * Set up input manager callbacks
     * Requirements: 6.1, 6.3, 6.4 - Input handling integration
     */
    setupInputCallbacks() {
        this.inputManager.setDirectionChangeCallback((direction) => {
            this.changeDirection(direction);
        });
        
        this.inputManager.setGameControlCallback((action) => {
            this.handleGameControl(action);
        });
    }

    /**
     * Set game speed
     * Requirements: 6.5 - Consistent timing for game mechanics
     * @param {number} speed - New speed in milliseconds between moves
     */
    setSpeed(speed) {
        this.gameSpeed = Math.max(50, Math.min(500, speed)); // Clamp between 50-500ms
    }

    /**
     * Get current game state
     * @returns {string} Current game state
     */
    getGameState() {
        return this.gameState;
    }

    /**
     * Get current score
     * @returns {number} Current score
     */
    getScore() {
        return this.score;
    }

    /**
     * Get snake length
     * @returns {number} Snake length
     */
    getSnakeLength() {
        return this.snake ? this.snake.getLength() : 1;
    }

    /**
     * Get current game speed
     * @returns {number} Game speed in milliseconds
     */
    getGameSpeed() {
        return this.gameSpeed;
    }

    /**
     * Get difficulty manager instance
     * @returns {DifficultyManager} Difficulty manager instance
     */
    getDifficultyManager() {
        return this.difficultyManager;
    }

    /**
     * Get hint system instance
     * @returns {HintSystem} Hint system instance
     */
    getHintSystem() {
        return this.hintSystem;
    }

    /**
     * Toggle AI hints on/off
     * @returns {boolean} True if hints are now enabled
     */
    toggleHints() {
        if (this.hintSystem) {
            return this.hintSystem.toggleHints();
        }
        return false;
    }

    /**
     * Enable AI hints
     */
    enableHints() {
        if (this.hintSystem) {
            this.hintSystem.enableHints();
        }
    }

    /**
     * Disable AI hints
     */
    disableHints() {
        if (this.hintSystem) {
            this.hintSystem.disableHints();
        }
    }

    /**
     * Set score update callback
     * @param {Function} callback - Callback function for score updates
     */
    setScoreUpdateCallback(callback) {
        this.onScoreUpdate = callback;
    }

    /**
     * Set game over callback
     * @param {Function} callback - Callback function for game over
     */
    setGameOverCallback(callback) {
        this.onGameOver = callback;
    }

    /**
     * Set state change callback
     * @param {Function} callback - Callback function for state changes
     */
    setStateChangeCallback(callback) {
        this.onStateChange = callback;
    }

    /**
     * Notify UI of score update
     */
    notifyScoreUpdate() {
        if (this.onScoreUpdate) {
            this.onScoreUpdate({
                score: this.score,
                length: this.getSnakeLength(),
                speed: this.gameSpeed,
                startTime: this.startTime,
                foodCollected: this.foodCollected
            });
        }
    }

    /**
     * Notify UI of game over
     * @param {Object} stats - Game statistics
     */
    notifyGameOver(stats) {
        if (this.onGameOver) {
            this.onGameOver(stats);
        }
    }

    /**
     * Notify UI of state change
     */
    notifyStateChange() {
        if (this.onStateChange) {
            this.onStateChange(this.gameState);
        }
    }
}