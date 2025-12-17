/**
 * DifficultyManager - Adaptive difficulty system for speed adjustment
 * Requirements: 3.1, 3.2, 3.4, 3.5 - Performance monitoring and speed adjustment
 */

export class DifficultyManager {
    constructor() {
        // Difficulty configuration
        this.baseSpeed = 150; // Starting speed in milliseconds
        this.minSpeed = 50;   // Fastest possible speed
        this.maxSpeed = 300;  // Slowest possible speed
        
        // Performance tracking
        this.performanceHistory = [];
        this.maxHistoryLength = 10; // Track last 10 games/segments
        
        // Current difficulty metrics
        this.currentSpeed = this.baseSpeed;
        this.consecutiveSuccesses = 0;
        this.recentDeaths = 0;
        
        // Adjustment thresholds
        this.speedIncreaseThreshold = 3; // Consecutive successes needed to increase difficulty
        this.speedDecreaseThreshold = 2; // Recent deaths needed to decrease difficulty
        
        // Adjustment amounts
        this.speedAdjustmentAmount = 15; // Milliseconds to adjust per change
        
        // Performance monitoring
        this.gameStartTime = 0;
        this.lastFoodTime = 0;
        this.foodCollectionTimes = [];
        
        // Load saved data
        this.loadPerformanceData();
        
        console.log('DifficultyManager initialized');
    }

    /**
     * Initialize difficulty manager for a new game
     * Requirements: 3.3 - Begin at moderate difficulty
     */
    initializeGame() {
        this.gameStartTime = Date.now();
        this.lastFoodTime = this.gameStartTime;
        this.foodCollectionTimes = [];
        
        // Reset to base speed if this is the first game
        if (this.performanceHistory.length === 0) {
            this.currentSpeed = this.baseSpeed;
        }
        
        console.log(`Game initialized with speed: ${this.currentSpeed}ms`);
    }

    /**
     * Record successful food collection
     * Requirements: 3.1 - Monitor performance for speed increases
     * @param {number} score - Current score
     * @param {number} length - Current snake length
     */
    recordFoodCollection(score, length) {
        const currentTime = Date.now();
        const timeSinceLastFood = currentTime - this.lastFoodTime;
        
        // Record collection time for efficiency analysis
        this.foodCollectionTimes.push(timeSinceLastFood);
        this.lastFoodTime = currentTime;
        
        // Track consecutive successes
        this.consecutiveSuccesses++;
        
        // Check if we should increase difficulty
        if (this.consecutiveSuccesses >= this.speedIncreaseThreshold) {
            this.increaseDifficulty();
            this.consecutiveSuccesses = 0; // Reset counter
            this.savePerformanceData(); // Save after difficulty change
        }
        
        console.log(`Food collected. Consecutive successes: ${this.consecutiveSuccesses}`);
    }

    /**
     * Record game death/failure
     * Requirements: 3.2 - Monitor struggles for speed decreases
     * @param {Object} gameStats - Final game statistics
     */
    recordGameEnd(gameStats) {
        const gameData = {
            score: gameStats.score,
            length: gameStats.length,
            survivalTime: gameStats.survivalTime,
            foodCollected: gameStats.foodCollected,
            averageCollectionTime: this.calculateAverageCollectionTime(),
            finalSpeed: this.currentSpeed,
            timestamp: Date.now()
        };
        
        // Add to performance history
        this.performanceHistory.push(gameData);
        
        // Maintain history size limit
        if (this.performanceHistory.length > this.maxHistoryLength) {
            this.performanceHistory.shift();
        }
        
        // Reset consecutive successes on death
        this.consecutiveSuccesses = 0;
        
        // Track recent deaths for difficulty adjustment
        this.recentDeaths++;
        
        // Analyze performance and adjust difficulty
        this.analyzePerformanceAndAdjust(gameData);
        
        // Save updated data
        this.savePerformanceData();
        
        console.log(`Game ended. Recent deaths: ${this.recentDeaths}, Final speed: ${this.currentSpeed}ms`);
    }

    /**
     * Analyze recent performance and adjust difficulty accordingly
     * Requirements: 3.4 - Monitor performance metrics including survival time and collection efficiency
     * @param {Object} currentGameData - Data from the game that just ended
     */
    analyzePerformanceAndAdjust(currentGameData) {
        if (this.performanceHistory.length < 2) {
            return; // Need at least 2 games to compare
        }
        
        const recentGames = this.performanceHistory.slice(-3); // Last 3 games
        const averageScore = recentGames.reduce((sum, game) => sum + game.score, 0) / recentGames.length;
        const averageSurvival = recentGames.reduce((sum, game) => sum + game.survivalTime, 0) / recentGames.length;
        
        // Check if player is struggling (low scores, short survival times)
        const isStruggling = (
            averageScore < 50 || // Low average score
            averageSurvival < 10000 || // Less than 10 seconds average survival
            this.recentDeaths >= this.speedDecreaseThreshold
        );
        
        // Check if player is performing well consistently
        const isPerformingWell = (
            averageScore > 100 && // Good average score
            averageSurvival > 30000 && // More than 30 seconds average survival
            currentGameData.averageCollectionTime < 3000 // Fast food collection
        );
        
        if (isStruggling) {
            this.decreaseDifficulty();
            this.recentDeaths = 0; // Reset death counter
        } else if (isPerformingWell && this.recentDeaths === 0) {
            // Only increase if no recent deaths
            this.increaseDifficulty();
        }
    }

    /**
     * Increase game difficulty by reducing speed
     * Requirements: 3.1 - Gradually increase speed for consecutive successes
     */
    increaseDifficulty() {
        const oldSpeed = this.currentSpeed;
        this.currentSpeed = Math.max(this.minSpeed, this.currentSpeed - this.speedAdjustmentAmount);
        
        if (this.currentSpeed !== oldSpeed) {
            console.log(`Difficulty increased: ${oldSpeed}ms -> ${this.currentSpeed}ms`);
            return true;
        }
        return false;
    }

    /**
     * Decrease game difficulty by increasing speed
     * Requirements: 3.2 - Reduce speed when player struggles
     */
    decreaseDifficulty() {
        const oldSpeed = this.currentSpeed;
        this.currentSpeed = Math.min(this.maxSpeed, this.currentSpeed + this.speedAdjustmentAmount);
        
        if (this.currentSpeed !== oldSpeed) {
            console.log(`Difficulty decreased: ${oldSpeed}ms -> ${this.currentSpeed}ms`);
            return true;
        }
        return false;
    }

    /**
     * Calculate average food collection time
     * Requirements: 3.4 - Monitor collection efficiency
     * @returns {number} Average time between food collections in milliseconds
     */
    calculateAverageCollectionTime() {
        if (this.foodCollectionTimes.length === 0) {
            return 0;
        }
        
        const total = this.foodCollectionTimes.reduce((sum, time) => sum + time, 0);
        return total / this.foodCollectionTimes.length;
    }

    /**
     * Get current game speed
     * Requirements: 3.5 - Maintain difficulty within reasonable bounds
     * @returns {number} Current speed in milliseconds
     */
    getCurrentSpeed() {
        return this.currentSpeed;
    }

    /**
     * Get difficulty level as a user-friendly number (1-10)
     * @returns {number} Difficulty level from 1 (easiest) to 10 (hardest)
     */
    getDifficultyLevel() {
        // Convert speed to difficulty level (1-10 scale)
        const speedRange = this.maxSpeed - this.minSpeed;
        const currentRange = this.maxSpeed - this.currentSpeed;
        const level = Math.floor((currentRange / speedRange) * 9) + 1;
        return Math.max(1, Math.min(10, level));
    }

    /**
     * Get performance statistics
     * Requirements: 3.4 - Performance metrics monitoring
     * @returns {Object} Performance statistics
     */
    getPerformanceStats() {
        if (this.performanceHistory.length === 0) {
            return {
                gamesPlayed: 0,
                averageScore: 0,
                averageSurvival: 0,
                bestScore: 0,
                currentDifficulty: this.getDifficultyLevel()
            };
        }
        
        const scores = this.performanceHistory.map(game => game.score);
        const survivals = this.performanceHistory.map(game => game.survivalTime);
        
        return {
            gamesPlayed: this.performanceHistory.length,
            averageScore: scores.reduce((sum, score) => sum + score, 0) / scores.length,
            averageSurvival: survivals.reduce((sum, time) => sum + time, 0) / survivals.length,
            bestScore: Math.max(...scores),
            currentDifficulty: this.getDifficultyLevel(),
            currentSpeed: this.currentSpeed
        };
    }

    /**
     * Reset difficulty to base level
     * Requirements: 3.3 - Ability to return to moderate difficulty
     */
    resetDifficulty() {
        this.currentSpeed = this.baseSpeed;
        this.consecutiveSuccesses = 0;
        this.recentDeaths = 0;
        this.performanceHistory = [];
        
        // Save reset state
        this.savePerformanceData();
        
        console.log('Difficulty reset to base level');
    }

    /**
     * Set custom speed (for testing or manual adjustment)
     * Requirements: 3.5 - Maintain reasonable bounds
     * @param {number} speed - Speed in milliseconds
     */
    setSpeed(speed) {
        this.currentSpeed = Math.max(this.minSpeed, Math.min(this.maxSpeed, speed));
        console.log(`Speed manually set to: ${this.currentSpeed}ms`);
    }

    /**
     * Load performance data from localStorage
     * Requirements: 5.5 - Persistence of difficulty data
     */
    loadPerformanceData() {
        try {
            const savedData = localStorage.getItem('snakeDifficultyData');
            if (!savedData) {
                return;
            }
            
            const data = JSON.parse(savedData);
            
            // Validate and restore data
            if (data.currentSpeed && data.currentSpeed >= this.minSpeed && data.currentSpeed <= this.maxSpeed) {
                this.currentSpeed = data.currentSpeed;
            }
            
            if (Array.isArray(data.performanceHistory)) {
                this.performanceHistory = data.performanceHistory.slice(-this.maxHistoryLength);
            }
            
            if (typeof data.consecutiveSuccesses === 'number' && data.consecutiveSuccesses >= 0) {
                this.consecutiveSuccesses = Math.min(data.consecutiveSuccesses, this.speedIncreaseThreshold);
            }
            
            if (typeof data.recentDeaths === 'number' && data.recentDeaths >= 0) {
                this.recentDeaths = Math.min(data.recentDeaths, this.speedDecreaseThreshold);
            }
            
            console.log('Loaded difficulty data:', {
                currentSpeed: this.currentSpeed,
                historyLength: this.performanceHistory.length,
                consecutiveSuccesses: this.consecutiveSuccesses,
                recentDeaths: this.recentDeaths
            });
            
        } catch (error) {
            console.warn('Could not load difficulty data from localStorage:', error);
        }
    }

    /**
     * Save performance data to localStorage
     * Requirements: 5.5 - Persistence of difficulty data
     */
    savePerformanceData() {
        try {
            const dataToSave = {
                currentSpeed: this.currentSpeed,
                performanceHistory: this.performanceHistory,
                consecutiveSuccesses: this.consecutiveSuccesses,
                recentDeaths: this.recentDeaths,
                lastUpdated: Date.now(),
                version: '1.0'
            };
            
            localStorage.setItem('snakeDifficultyData', JSON.stringify(dataToSave));
            console.log('Saved difficulty data');
            
        } catch (error) {
            console.warn('Could not save difficulty data to localStorage:', error);
        }
    }

    /**
     * Clear all saved difficulty data
     * Requirements: 5.5 - Data management
     */
    clearSavedData() {
        try {
            localStorage.removeItem('snakeDifficultyData');
            console.log('Cleared difficulty data');
        } catch (error) {
            console.warn('Could not clear difficulty data:', error);
        }
    }
}