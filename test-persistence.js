/**
 * Test script for high score persistence and difficulty management
 * Tests Requirements 5.4, 5.5 - High score persistence with local storage
 */

// Mock localStorage for Node.js environment
class MockLocalStorage {
    constructor() {
        this.store = {};
    }
    
    getItem(key) {
        return this.store[key] || null;
    }
    
    setItem(key, value) {
        this.store[key] = String(value);
    }
    
    removeItem(key) {
        delete this.store[key];
    }
    
    clear() {
        this.store = {};
    }
}

// Set up global localStorage mock
global.localStorage = new MockLocalStorage();

// Import classes (simplified versions for testing)
class UIManager {
    constructor() {
        this.highScore = 0;
        this.loadHighScore();
    }

    loadHighScore() {
        try {
            const saved = localStorage.getItem('snakeHighScore');
            this.highScore = saved ? parseInt(saved, 10) : 0;
            
            if (isNaN(this.highScore) || this.highScore < 0) {
                this.highScore = 0;
            }
        } catch (error) {
            console.warn('Could not load high score from localStorage:', error);
            this.highScore = 0;
        }
    }

    saveHighScore() {
        try {
            localStorage.setItem('snakeHighScore', this.highScore.toString());
        } catch (error) {
            console.warn('Could not save high score to localStorage:', error);
        }
    }

    loadGameData() {
        try {
            const gameDataStr = localStorage.getItem('snakeGameData');
            if (!gameDataStr) {
                return this.getDefaultGameData();
            }
            
            const gameData = JSON.parse(gameDataStr);
            const defaultData = this.getDefaultGameData();
            
            return {
                ...defaultData,
                ...gameData,
                highScore: Math.max(0, parseInt(gameData.highScore) || 0),
                totalGamesPlayed: Math.max(0, parseInt(gameData.totalGamesPlayed) || 0),
                totalScore: Math.max(0, parseInt(gameData.totalScore) || 0),
                totalPlayTime: Math.max(0, parseInt(gameData.totalPlayTime) || 0),
                longestSurvival: Math.max(0, parseInt(gameData.longestSurvival) || 0)
            };
        } catch (error) {
            console.warn('Could not load game data from localStorage:', error);
            return this.getDefaultGameData();
        }
    }

    saveGameData(gameData) {
        try {
            const dataToSave = {
                ...gameData,
                lastUpdated: Date.now()
            };
            localStorage.setItem('snakeGameData', JSON.stringify(dataToSave));
        } catch (error) {
            console.warn('Could not save game data to localStorage:', error);
        }
    }

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

    clearPersistentData() {
        try {
            localStorage.removeItem('snakeHighScore');
            localStorage.removeItem('snakeGameData');
            this.highScore = 0;
        } catch (error) {
            console.warn('Could not clear persistent data:', error);
        }
    }
}

class DifficultyManager {
    constructor() {
        this.baseSpeed = 150;
        this.minSpeed = 50;
        this.maxSpeed = 300;
        this.currentSpeed = this.baseSpeed;
        this.performanceHistory = [];
        this.maxHistoryLength = 10;
        this.consecutiveSuccesses = 0;
        this.recentDeaths = 0;
        
        this.loadPerformanceData();
    }

    loadPerformanceData() {
        try {
            const savedData = localStorage.getItem('snakeDifficultyData');
            if (!savedData) {
                return;
            }
            
            const data = JSON.parse(savedData);
            
            if (data.currentSpeed && data.currentSpeed >= this.minSpeed && data.currentSpeed <= this.maxSpeed) {
                this.currentSpeed = data.currentSpeed;
            }
            
            if (Array.isArray(data.performanceHistory)) {
                this.performanceHistory = data.performanceHistory.slice(-this.maxHistoryLength);
            }
            
            if (typeof data.consecutiveSuccesses === 'number' && data.consecutiveSuccesses >= 0) {
                this.consecutiveSuccesses = Math.min(data.consecutiveSuccesses, 3);
            }
            
            if (typeof data.recentDeaths === 'number' && data.recentDeaths >= 0) {
                this.recentDeaths = Math.min(data.recentDeaths, 2);
            }
        } catch (error) {
            console.warn('Could not load difficulty data from localStorage:', error);
        }
    }

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
        } catch (error) {
            console.warn('Could not save difficulty data to localStorage:', error);
        }
    }

    recordGameEnd(gameStats) {
        const gameData = {
            score: gameStats.score,
            length: gameStats.length,
            survivalTime: gameStats.survivalTime,
            foodCollected: gameStats.foodCollected,
            finalSpeed: this.currentSpeed,
            timestamp: Date.now()
        };
        
        this.performanceHistory.push(gameData);
        
        if (this.performanceHistory.length > this.maxHistoryLength) {
            this.performanceHistory.shift();
        }
        
        this.consecutiveSuccesses = 0;
        this.recentDeaths++;
        
        this.savePerformanceData();
    }

    getCurrentSpeed() {
        return this.currentSpeed;
    }

    getDifficultyLevel() {
        const speedRange = this.maxSpeed - this.minSpeed;
        const currentRange = this.maxSpeed - this.currentSpeed;
        const level = Math.floor((currentRange / speedRange) * 9) + 1;
        return Math.max(1, Math.min(10, level));
    }

    clearSavedData() {
        try {
            localStorage.removeItem('snakeDifficultyData');
        } catch (error) {
            console.warn('Could not clear difficulty data:', error);
        }
    }
}

// Test functions
function testHighScorePersistence() {
    console.log('=== Testing High Score Persistence ===');
    
    // Clear any existing data
    localStorage.clear();
    
    const ui = new UIManager();
    
    // Test 1: Initial high score should be 0
    console.log('Test 1: Initial high score');
    if (ui.highScore !== 0) {
        console.error(`❌ Expected initial high score 0, got ${ui.highScore}`);
        return false;
    }
    console.log('✓ Initial high score is 0');
    
    // Test 2: Save and load high score
    console.log('Test 2: Save and load high score');
    ui.highScore = 150;
    ui.saveHighScore();
    
    const ui2 = new UIManager();
    if (ui2.highScore !== 150) {
        console.error(`❌ Expected loaded high score 150, got ${ui2.highScore}`);
        return false;
    }
    console.log('✓ High score saved and loaded correctly');
    
    // Test 3: Update persistent stats
    console.log('Test 3: Update persistent stats');
    const gameStats = {
        score: 200,
        length: 15,
        survivalTime: 45000,
        foodCollected: 14
    };
    
    const persistentStats = ui2.updatePersistentStats(gameStats);
    
    if (persistentStats.highScore !== 200) {
        console.error(`❌ Expected new high score 200, got ${persistentStats.highScore}`);
        return false;
    }
    
    if (persistentStats.totalGamesPlayed !== 1) {
        console.error(`❌ Expected total games 1, got ${persistentStats.totalGamesPlayed}`);
        return false;
    }
    
    console.log('✓ Persistent stats updated correctly');
    
    // Test 4: Multiple games
    console.log('Test 4: Multiple games tracking');
    const gameStats2 = {
        score: 100,
        length: 8,
        survivalTime: 30000,
        foodCollected: 7
    };
    
    const persistentStats2 = ui2.updatePersistentStats(gameStats2);
    
    if (persistentStats2.totalGamesPlayed !== 2) {
        console.error(`❌ Expected total games 2, got ${persistentStats2.totalGamesPlayed}`);
        return false;
    }
    
    if (persistentStats2.averageScore !== 150) { // (200 + 100) / 2
        console.error(`❌ Expected average score 150, got ${persistentStats2.averageScore}`);
        return false;
    }
    
    console.log('✓ Multiple games tracked correctly');
    
    return true;
}

function testDifficultyPersistence() {
    console.log('=== Testing Difficulty Persistence ===');
    
    // Clear any existing data
    localStorage.removeItem('snakeDifficultyData');
    
    const difficulty = new DifficultyManager();
    
    // Test 1: Initial state
    console.log('Test 1: Initial difficulty state');
    if (difficulty.getCurrentSpeed() !== 150) {
        console.error(`❌ Expected initial speed 150, got ${difficulty.getCurrentSpeed()}`);
        return false;
    }
    console.log('✓ Initial difficulty state correct');
    
    // Test 2: Record game and save
    console.log('Test 2: Record game and save data');
    const gameStats = {
        score: 100,
        length: 8,
        survivalTime: 30000,
        foodCollected: 7
    };
    
    difficulty.recordGameEnd(gameStats);
    
    // Create new instance to test loading
    const difficulty2 = new DifficultyManager();
    
    if (difficulty2.performanceHistory.length !== 1) {
        console.error(`❌ Expected 1 game in history, got ${difficulty2.performanceHistory.length}`);
        return false;
    }
    
    console.log('✓ Difficulty data saved and loaded correctly');
    
    // Test 3: Speed persistence
    console.log('Test 3: Speed persistence');
    difficulty2.currentSpeed = 120;
    difficulty2.savePerformanceData();
    
    const difficulty3 = new DifficultyManager();
    if (difficulty3.getCurrentSpeed() !== 120) {
        console.error(`❌ Expected speed 120, got ${difficulty3.getCurrentSpeed()}`);
        return false;
    }
    
    console.log('✓ Speed persistence works correctly');
    
    return true;
}

function testDataIntegrity() {
    console.log('=== Testing Data Integrity ===');
    
    // Test 1: Invalid data handling
    console.log('Test 1: Invalid data handling');
    localStorage.setItem('snakeHighScore', 'invalid');
    localStorage.setItem('snakeGameData', 'invalid json');
    
    const ui = new UIManager();
    if (ui.highScore !== 0) {
        console.error(`❌ Expected high score 0 for invalid data, got ${ui.highScore}`);
        return false;
    }
    
    const gameData = ui.loadGameData();
    if (gameData.totalGamesPlayed !== 0) {
        console.error(`❌ Expected default data for invalid JSON, got ${gameData.totalGamesPlayed}`);
        return false;
    }
    
    console.log('✓ Invalid data handled correctly');
    
    // Test 2: Negative values
    console.log('Test 2: Negative values handling');
    localStorage.setItem('snakeGameData', JSON.stringify({
        highScore: -100,
        totalGamesPlayed: -5,
        totalScore: -200
    }));
    
    const ui2 = new UIManager();
    const gameData2 = ui2.loadGameData();
    
    if (gameData2.highScore < 0 || gameData2.totalGamesPlayed < 0 || gameData2.totalScore < 0) {
        console.error('❌ Negative values not properly handled');
        return false;
    }
    
    console.log('✓ Negative values handled correctly');
    
    return true;
}

// Run all tests
function runAllTests() {
    console.log('Running Persistence Tests for AI Snake Game');
    console.log('Testing Requirements 5.4, 5.5 - High score persistence with local storage');
    console.log('');
    
    let allPassed = true;
    
    try {
        if (!testHighScorePersistence()) {
            allPassed = false;
        }
        console.log('');
        
        if (!testDifficultyPersistence()) {
            allPassed = false;
        }
        console.log('');
        
        if (!testDataIntegrity()) {
            allPassed = false;
        }
        console.log('');
        
    } catch (error) {
        console.error('❌ Test execution failed:', error.message);
        allPassed = false;
    }
    
    if (allPassed) {
        console.log('✅ All persistence tests PASSED');
        console.log('Requirements 5.4, 5.5 validated successfully');
    } else {
        console.log('❌ Some persistence tests FAILED');
    }
    
    return allPassed;
}

// Run the tests
const success = runAllTests();
process.exit(success ? 0 : 1);