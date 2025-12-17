/**
 * UIManager - Manages UI updates and game over screen
 * Requirements: 4.4, 5.1, 5.2, 5.3 - UI updates and statistics display
 */

export class UIManager {
    constructor() {
        this.scoreElement = null;
        this.lengthElement = null;
        this.speedElement = null;
        this.gameOverScreen = null;
        this.highScore = 0;
        this.difficultyManager = null;
        
        this.loadHighScore();
    }

    /**
     * Initialize UI elements
     */
    init() {
        this.scoreElement = document.getElementById('score');
        this.lengthElement = document.getElementById('length');
        this.speedElement = document.getElementById('speed');
        this.gameOverScreen = document.getElementById('gameOverScreen');
        
        this.updateScore(0, 1, 150);
        this.setupGameOverKeyboardShortcuts();
        
        console.log('UIManager initialized successfully');
    }

    /**
     * Update score display with all game statistics
     */
    updateScore(score, length, speed, difficultyManager = null) {
        if (this.scoreElement) {
            this.scoreElement.textContent = score;
        }
        
        if (this.lengthElement) {
            this.lengthElement.textContent = length;
        }
        
        if (this.speedElement) {
            let displayText = '';
            
            if (difficultyManager) {
                const difficultyLevel = difficultyManager.getDifficultyLevel();
                displayText = difficultyLevel;
            } else {
                const speedLevel = Math.max(1, Math.floor((500 - speed) / 50));
                displayText = speedLevel;
            }
            
            this.speedElement.textContent = displayText;
        }
        
        if (difficultyManager) {
            this.difficultyManager = difficultyManager;
        }
    }

    /**
     * Show game over screen with final statistics
     */
    showGameOver(stats) {
        if (!this.gameOverScreen) return;
        
        const persistentStats = this.updatePersistentStats(stats);
        const isNewHighScore = stats.score === persistentStats.highScore && stats.score > 0;
        
        const finalScoreElement = document.getElementById('finalScore');
        const finalLengthElement = document.getElementById('finalLength');
        const highScoreElement = document.getElementById('highScore');
        
        if (finalScoreElement) {
            finalScoreElement.textContent = stats.score;
        }
        
        if (finalLengthElement) {
            finalLengthElement.textContent = stats.length;
        }
        
        if (highScoreElement) {
            highScoreElement.textContent = persistentStats.highScore;
        }
        
        this.displayAdditionalStats(stats, persistentStats);
        this.displayGameOverReason(stats);
        
        this.gameOverScreen.classList.remove('hidden');
        this.animateGameOverScreen();
        
        if (isNewHighScore) {
            this.showNewHighScoreMessage();
        }
        
        setTimeout(() => {
            const playAgainBtn = document.getElementById('playAgainBtn');
            if (playAgainBtn) {
                playAgainBtn.focus();
            }
        }, 300);
    }

    /**
     * Display additional game statistics
     */
    displayAdditionalStats(stats, persistentStats = null) {
        let additionalStats = this.gameOverScreen.querySelector('.additional-stats');
        if (!additionalStats) {
            additionalStats = document.createElement('div');
            additionalStats.className = 'additional-stats';
            
            const finalStats = this.gameOverScreen.querySelector('.final-stats');
            if (finalStats) {
                finalStats.after(additionalStats);
            }
        }
        
        const minutes = Math.floor(stats.survivalTime / 60000);
        const seconds = Math.floor((stats.survivalTime % 60000) / 1000);
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        const collectionRate = stats.survivalTime > 0 ? 
            (stats.foodCollected / (stats.survivalTime / 1000)).toFixed(2) : '0.00';
        
        let statsHTML = `
            <p><span>Survival Time</span><span>${timeString}</span></p>
            <p><span>Food Collected</span><span>${stats.foodCollected}</span></p>
            <p><span>Collection Rate</span><span>${collectionRate}/sec</span></p>
        `;
        
        if (this.difficultyManager) {
            const perfStats = this.difficultyManager.getPerformanceStats();
            const finalDifficulty = this.difficultyManager.getDifficultyLevel();
            
            statsHTML += `<p><span>Final Difficulty</span><span>${finalDifficulty}/10</span></p>`;
            
            if (perfStats.gamesPlayed > 1) {
                const avgScore = Math.round(perfStats.averageScore);
                const avgTime = Math.round(perfStats.averageSurvival / 1000);
                
                statsHTML += `
                    <hr>
                    <p style="opacity: 0.7; font-size: 0.7rem;"><span>Session Stats</span></p>
                    <p><span>Games Played</span><span>${perfStats.gamesPlayed}</span></p>
                    <p><span>Avg Score</span><span>${avgScore}</span></p>
                    <p><span>Avg Survival</span><span>${avgTime}s</span></p>
                `;
            }
        }
        
        if (persistentStats && persistentStats.totalGamesPlayed > 1) {
            const totalMinutes = Math.round(persistentStats.totalPlayTime / 60000);
            const longestMinutes = Math.floor(persistentStats.longestSurvival / 60000);
            const longestSeconds = Math.floor((persistentStats.longestSurvival % 60000) / 1000);
            const longestTime = `${longestMinutes}:${longestSeconds.toString().padStart(2, '0')}`;
            
            statsHTML += `
                <hr>
                <p style="opacity: 0.7; font-size: 0.7rem;"><span>All-Time Stats</span></p>
                <p><span>Total Games</span><span>${persistentStats.totalGamesPlayed}</span></p>
                <p><span>Avg Score</span><span>${persistentStats.averageScore}</span></p>
                <p><span>Total Time</span><span>${totalMinutes}m</span></p>
                <p><span>Best Survival</span><span>${longestTime}</span></p>
            `;
        }
        
        additionalStats.innerHTML = statsHTML;
    }

    /**
     * Show new high score message
     */
    showNewHighScoreMessage() {
        const existingMessage = this.gameOverScreen.querySelector('.new-high-score');
        if (existingMessage) existingMessage.remove();
        
        const message = document.createElement('div');
        message.className = 'new-high-score';
        message.textContent = '🎉 NEW HIGH SCORE!';
        
        const modalContent = this.gameOverScreen.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.position = 'relative';
            modalContent.appendChild(message);
        }
        
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 5000);
    }

    /**
     * Hide game over screen
     */
    hideGameOver() {
        if (this.gameOverScreen) {
            this.gameOverScreen.classList.add('hidden');
            
            const additionalStats = this.gameOverScreen.querySelector('.additional-stats');
            if (additionalStats) additionalStats.remove();
            
            const reasonElement = this.gameOverScreen.querySelector('.game-over-reason');
            if (reasonElement) reasonElement.remove();
            
            const highScoreMsg = this.gameOverScreen.querySelector('.new-high-score');
            if (highScoreMsg) highScoreMsg.remove();
        }
        
        this.hideLiveStats();
    }

    /**
     * Load high score from localStorage
     */
    loadHighScore() {
        try {
            const saved = localStorage.getItem('snakeHighScore');
            this.highScore = saved ? parseInt(saved, 10) : 0;
            
            if (isNaN(this.highScore) || this.highScore < 0) {
                this.highScore = 0;
            }
        } catch (error) {
            console.warn('Could not load high score:', error);
            this.highScore = 0;
        }
    }

    /**
     * Save high score to localStorage
     */
    saveHighScore() {
        try {
            localStorage.setItem('snakeHighScore', this.highScore.toString());
        } catch (error) {
            console.warn('Could not save high score:', error);
        }
    }

    /**
     * Load all game data from localStorage
     */
    loadGameData() {
        try {
            const gameDataStr = localStorage.getItem('snakeGameData');
            if (!gameDataStr) {
                return this.getDefaultGameData();
            }
            
            const gameData = JSON.parse(gameDataStr);
            const defaultData = this.getDefaultGameData();
            const validatedData = {
                ...defaultData,
                ...gameData,
                highScore: Math.max(0, parseInt(gameData.highScore) || 0),
                totalGamesPlayed: Math.max(0, parseInt(gameData.totalGamesPlayed) || 0),
                totalScore: Math.max(0, parseInt(gameData.totalScore) || 0),
                totalPlayTime: Math.max(0, parseInt(gameData.totalPlayTime) || 0),
                longestSurvival: Math.max(0, parseInt(gameData.longestSurvival) || 0)
            };
            
            this.highScore = validatedData.highScore;
            return validatedData;
            
        } catch (error) {
            console.warn('Could not load game data:', error);
            return this.getDefaultGameData();
        }
    }

    /**
     * Save all game data to localStorage
     */
    saveGameData(gameData) {
        try {
            const dataToSave = {
                ...gameData,
                lastUpdated: Date.now()
            };
            localStorage.setItem('snakeGameData', JSON.stringify(dataToSave));
        } catch (error) {
            console.warn('Could not save game data:', error);
        }
    }

    /**
     * Get default game data structure
     */
    getDefaultGameData() {
        return {
            highScore: 0,
            totalGamesPlayed: 0,
            totalScore: 0,
            totalPlayTime: 0,
            longestSurvival: 0,
            averageScore: 0,
            lastPlayed: null,
            version: '1.0'
        };
    }

    /**
     * Update persistent game statistics
     */
    updatePersistentStats(gameStats) {
        const currentData = this.loadGameData();
        
        currentData.totalGamesPlayed += 1;
        currentData.totalScore += gameStats.score;
        currentData.totalPlayTime += gameStats.survivalTime;
        currentData.lastPlayed = Date.now();
        
        if (gameStats.score > currentData.highScore) {
            currentData.highScore = gameStats.score;
            this.highScore = gameStats.score;
        }
        
        if (gameStats.survivalTime > currentData.longestSurvival) {
            currentData.longestSurvival = gameStats.survivalTime;
        }
        
        currentData.averageScore = Math.round(currentData.totalScore / currentData.totalGamesPlayed);
        
        this.saveGameData(currentData);
        return currentData;
    }

    /**
     * Get persistent game statistics
     */
    getPersistentStats() {
        return this.loadGameData();
    }

    /**
     * Clear all persistent data
     */
    clearPersistentData() {
        try {
            localStorage.removeItem('snakeHighScore');
            localStorage.removeItem('snakeGameData');
            this.highScore = 0;
        } catch (error) {
            console.warn('Could not clear persistent data:', error);
        }
    }

    /**
     * Get current high score
     */
    getHighScore() {
        return this.highScore;
    }

    /**
     * Reset high score
     */
    resetHighScore() {
        this.highScore = 0;
        this.saveHighScore();
    }

    /**
     * Create and display live statistics panel
     */
    createLiveStatsPanel() {
        let statsPanel = document.getElementById('liveStatsPanel');
        if (!statsPanel) {
            statsPanel = document.createElement('div');
            statsPanel.id = 'liveStatsPanel';
            statsPanel.className = 'live-stats-panel';
            
            const canvasWrapper = document.querySelector('.canvas-wrapper');
            if (canvasWrapper) {
                canvasWrapper.appendChild(statsPanel);
            }
        }
        return statsPanel;
    }

    /**
     * Update live statistics panel
     */
    updateLiveStats(gameData) {
        const statsPanel = this.createLiveStatsPanel();
        
        if (!statsPanel || !this.difficultyManager) return;
        
        const perfStats = this.difficultyManager.getPerformanceStats();
        const currentTime = Date.now();
        const gameStartTime = gameData.startTime || currentTime;
        const elapsedTime = Math.floor((currentTime - gameStartTime) / 1000);
        
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        statsPanel.innerHTML = `
            <div class="stat-title">Live Stats</div>
            <div>Time: ${timeString}</div>
            <div>Score: ${gameData.score || 0}</div>
            <div>Length: ${gameData.length || 1}</div>
            <div>Food: ${gameData.foodCollected || 0}</div>
            <div>Difficulty: ${this.difficultyManager.getDifficultyLevel()}/10</div>
            ${perfStats.gamesPlayed > 0 ? `<div style="margin-top: 8px; opacity: 0.7;">Best: ${Math.round(perfStats.bestScore)}</div>` : ''}
        `;
    }

    /**
     * Toggle live statistics panel visibility
     */
    toggleLiveStats() {
        const statsPanel = this.createLiveStatsPanel();
        const isVisible = statsPanel.classList.toggle('visible');
        statsPanel.style.display = isVisible ? 'block' : 'none';
        return isVisible;
    }

    /**
     * Hide live statistics panel
     */
    hideLiveStats() {
        const statsPanel = document.getElementById('liveStatsPanel');
        if (statsPanel) {
            statsPanel.classList.remove('visible');
            statsPanel.style.display = 'none';
        }
    }

    /**
     * Display game over reason
     */
    displayGameOverReason(stats) {
        let reasonElement = this.gameOverScreen.querySelector('.game-over-reason');
        if (!reasonElement) {
            reasonElement = document.createElement('div');
            reasonElement.className = 'game-over-reason';
            
            const modalContent = this.gameOverScreen.querySelector('.modal-content');
            const h2 = modalContent?.querySelector('h2');
            if (h2) {
                h2.after(reasonElement);
            }
        }
        
        let reason = 'Keep practicing!';
        
        if (stats.length <= 3 && stats.survivalTime < 5000) {
            reason = 'Quick collision - try using AI hints!';
        } else if (stats.length > 15) {
            reason = 'Impressive length achieved!';
        } else if (stats.survivalTime > 60000) {
            reason = 'Great survival time!';
        } else if (stats.foodCollected > 20) {
            reason = 'Excellent food collection!';
        }
        
        reasonElement.textContent = reason;
    }

    /**
     * Animate game over screen entrance
     */
    animateGameOverScreen() {
        if (!this.gameOverScreen) return;
        
        const playAgainBtn = document.getElementById('playAgainBtn');
        if (playAgainBtn) {
            playAgainBtn.style.animation = 'pulse 2s ease-in-out infinite';
        }
    }

    /**
     * Setup keyboard shortcuts for game over screen
     */
    setupGameOverKeyboardShortcuts() {
        const handleKeyPress = (event) => {
            if (!this.gameOverScreen || this.gameOverScreen.classList.contains('hidden')) {
                return;
            }
            
            switch (event.key) {
                case 'Enter':
                case ' ':
                    event.preventDefault();
                    const playAgainBtn = document.getElementById('playAgainBtn');
                    if (playAgainBtn) playAgainBtn.click();
                    break;
                case 'Escape':
                    event.preventDefault();
                    this.hideGameOver();
                    break;
            }
        };
        
        document.removeEventListener('keydown', this.gameOverKeyHandler);
        this.gameOverKeyHandler = handleKeyPress;
        document.addEventListener('keydown', handleKeyPress);
    }

    /**
     * Add restart confirmation for long games
     */
    confirmRestart(stats) {
        if (stats && (stats.score > 100 || stats.survivalTime > 30000)) {
            return confirm(
                `Are you sure you want to restart?\n\n` +
                `Current Score: ${stats.score}\n` +
                `Survival Time: ${Math.round(stats.survivalTime / 1000)}s\n\n` +
                `This progress will be lost.`
            );
        }
        return true;
    }

    /**
     * Show quick restart notification
     */
    showRestartNotification() {
        const notification = document.createElement('div');
        notification.className = 'toast success';
        notification.textContent = 'Game Restarted!';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 2000);
    }
}
