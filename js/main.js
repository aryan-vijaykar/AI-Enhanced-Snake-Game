/**
 * AI Snake Game - Main Entry Point
 * Initializes the game and manages the overall application lifecycle
 */

import { GameEngine } from './game/GameEngine.js';
import { UIManager } from './ui/UIManager.js';

class SnakeGameApp {
    constructor() {
        this.gameEngine = null;
        this.uiManager = null;
        this.isInitialized = false;
        this.gamePausedForHelp = false;
    }

    /**
     * Initialize the game application
     */
    async init() {
        try {
            console.log('Initializing AI Snake Game...');
            
            // Get canvas element
            const canvas = document.getElementById('gameCanvas');
            if (!canvas) {
                throw new Error('Game canvas not found');
            }

            // Initialize managers
            this.uiManager = new UIManager();
            this.gameEngine = new GameEngine(canvas);

            // Set up callbacks
            this.setupGameCallbacks();

            // Set up event listeners
            this.setupEventListeners();

            // Initialize UI
            this.uiManager.init();

            this.isInitialized = true;
            console.log('Game initialized successfully');

        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Failed to initialize game. Please refresh the page.');
        }
    }

    /**
     * Set up game engine callbacks
     */
    setupGameCallbacks() {
        if (!this.gameEngine || !this.uiManager) return;

        // Score update callback
        this.gameEngine.setScoreUpdateCallback((data) => {
            const difficultyManager = this.gameEngine.getDifficultyManager();
            this.uiManager.updateScore(data.score, data.length, data.speed, difficultyManager);
            
            // Update live stats if visible
            this.uiManager.updateLiveStats(data);
        });

        // Game over callback
        this.gameEngine.setGameOverCallback((stats) => {
            this.uiManager.showGameOver(stats);
        });

        // State change callback
        this.gameEngine.setStateChangeCallback((state) => {
            this.updateUIForState(state);
        });
    }

    /**
     * Update UI based on game state
     * @param {string} state - Current game state
     */
    updateUIForState(state) {
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            switch (state) {
                case 'running':
                    pauseBtn.textContent = 'Pause';
                    pauseBtn.disabled = false;
                    break;
                case 'paused':
                    pauseBtn.textContent = 'Resume';
                    pauseBtn.disabled = false;
                    break;
                case 'stopped':
                case 'gameOver':
                    pauseBtn.textContent = 'Pause';
                    pauseBtn.disabled = true;
                    break;
            }
        }
    }

    /**
     * Set up event listeners for game controls
     */
    setupEventListeners() {
        // Pause button
        const pauseBtn = document.getElementById('pauseBtn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                if (this.gameEngine) {
                    this.gameEngine.togglePause();
                }
            });
        }

        // Restart button
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                if (this.gameEngine && this.uiManager) {
                    // Get current game stats for confirmation
                    const currentStats = {
                        score: this.gameEngine.getScore(),
                        survivalTime: this.gameEngine.startTime ? Date.now() - this.gameEngine.startTime : 0
                    };
                    
                    // Show confirmation for significant progress
                    if (this.uiManager.confirmRestart(currentStats)) {
                        this.gameEngine.start();
                        this.uiManager.showRestartNotification();
                    }
                }
            });
        }

        // Play again button (game over screen)
        const playAgainBtn = document.getElementById('playAgainBtn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                if (this.gameEngine && this.uiManager) {
                    this.gameEngine.start();
                    this.uiManager.hideGameOver();
                }
            });
        }

        // AI hints toggle
        const hintsToggle = document.getElementById('hintsToggle');
        if (hintsToggle) {
            hintsToggle.addEventListener('change', (e) => {
                if (this.gameEngine) {
                    if (e.target.checked) {
                        this.gameEngine.enableHints();
                    } else {
                        this.gameEngine.disableHints();
                    }
                    console.log('AI hints toggled:', e.target.checked);
                }
            });
        }

        // Live stats toggle
        const statsToggle = document.getElementById('statsToggle');
        if (statsToggle) {
            statsToggle.addEventListener('change', (e) => {
                if (this.uiManager) {
                    const isVisible = this.uiManager.toggleLiveStats();
                    console.log('Live stats toggled:', isVisible);
                }
            });
        }

        // Help button
        const helpBtn = document.getElementById('helpBtn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => {
                this.showHelp();
            });
        }

        // Close help button
        const closeHelpBtn = document.getElementById('closeHelpBtn');
        if (closeHelpBtn) {
            closeHelpBtn.addEventListener('click', () => {
                this.hideHelp();
            });
        }

        // Global keyboard shortcuts
        this.setupGlobalKeyboardShortcuts();
    }

    /**
     * Start the game
     */
    start() {
        if (!this.isInitialized) {
            console.error('Game not initialized');
            return;
        }

        if (this.gameEngine) {
            this.gameEngine.start();
        }
    }

    /**
     * Set up global keyboard shortcuts
     * Requirements: 6.3 - Enhanced game controls
     */
    setupGlobalKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Don't interfere with game controls (arrow keys, WASD)
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(event.key.toLowerCase())) {
                return;
            }
            
            // Don't interfere if game over screen is visible
            if (this.uiManager && this.uiManager.gameOverScreen && !this.uiManager.gameOverScreen.classList.contains('hidden')) {
                return;
            }
            
            switch (event.key) {
                case 'p':
                case 'P':
                    event.preventDefault();
                    if (this.gameEngine) {
                        this.gameEngine.togglePause();
                    }
                    break;
                case 'r':
                case 'R':
                    event.preventDefault();
                    if (this.gameEngine && this.uiManager) {
                        const currentStats = {
                            score: this.gameEngine.getScore(),
                            survivalTime: this.gameEngine.startTime ? Date.now() - this.gameEngine.startTime : 0
                        };
                        
                        if (this.uiManager.confirmRestart(currentStats)) {
                            this.gameEngine.start();
                            this.uiManager.showRestartNotification();
                        }
                    }
                    break;
                case 'h':
                case 'H':
                    event.preventDefault();
                    if (this.gameEngine) {
                        const hintsEnabled = this.gameEngine.toggleHints();
                        const hintsToggle = document.getElementById('hintsToggle');
                        if (hintsToggle) {
                            hintsToggle.checked = hintsEnabled;
                        }
                        console.log('AI hints toggled via keyboard:', hintsEnabled);
                    }
                    break;
                case 't':
                case 'T':
                    event.preventDefault();
                    if (this.uiManager) {
                        const isVisible = this.uiManager.toggleLiveStats();
                        const statsToggle = document.getElementById('statsToggle');
                        if (statsToggle) {
                            statsToggle.checked = isVisible;
                        }
                        console.log('Live stats toggled via keyboard:', isVisible);
                    }
                    break;
                case 'F1':
                    event.preventDefault();
                    this.showHelp();
                    break;
                case 'Escape':
                    event.preventDefault();
                    this.hideHelp();
                    break;
            }
        });
    }

    /**
     * Show help overlay
     * Requirements: 6.3 - Enhanced user interface
     */
    showHelp() {
        const helpOverlay = document.getElementById('helpOverlay');
        if (helpOverlay) {
            helpOverlay.classList.remove('hidden');
            
            // Pause game if running
            if (this.gameEngine && this.gameEngine.getGameState() === 'running') {
                this.gameEngine.togglePause();
                this.gamePausedForHelp = true;
            }
        }
    }

    /**
     * Hide help overlay
     * Requirements: 6.3 - Enhanced user interface
     */
    hideHelp() {
        const helpOverlay = document.getElementById('helpOverlay');
        if (helpOverlay) {
            helpOverlay.classList.add('hidden');
            
            // Resume game if it was paused for help
            if (this.gamePausedForHelp && this.gameEngine && this.gameEngine.getGameState() === 'paused') {
                this.gameEngine.togglePause();
                this.gamePausedForHelp = false;
            }
        }
    }

    /**
     * Show error message to user
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff0040;
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            font-family: 'Orbitron', monospace;
            z-index: 9999;
        `;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
}

// Initialize and start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const app = new SnakeGameApp();
    await app.init();
    
    // Auto-start the game
    app.start();
});

// Export for potential external use
export { SnakeGameApp };