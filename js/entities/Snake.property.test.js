/**
 * Property-Based Test for Snake Movement
 * **Feature: ai-snake-game, Property 1: Input direction mapping**
 * **Validates: Requirements 1.1**
 * 
 * This test verifies that for any valid input direction, 
 * the snake moves in the corresponding direction.
 */

import { Snake } from './Snake.js';

/**
 * Simple property-based testing utilities
 */
export class SnakePropertyTest {
    
    /**
     * Run property test with specified iterations
     * @param {number} iterations - Number of test iterations (default: 100)
     * @returns {Object} Test result with success status and details
     */
    static runInputDirectionMappingTest(iterations = 100) {
        const results = {
            success: true,
            totalTests: iterations,
            passedTests: 0,
            failedTests: 0,
            failures: []
        };
        
        console.log('=== Property Test: Input Direction Mapping ===');
        console.log(`Running ${iterations} iterations...`);
        
        for (let i = 0; i < iterations; i++) {
            const testCase = this.generateDirectionTestCase();
            const result = this.testSingleDirectionMapping(testCase);
            
            if (result.success) {
                results.passedTests++;
            } else {
                results.failedTests++;
                results.success = false;
                results.failures.push({
                    iteration: i + 1,
                    testCase,
                    error: result.error
                });
                
                // Log first few failures for debugging
                if (results.failures.length <= 3) {
                    console.error(`Failure ${results.failures.length}:`);
                    console.error(`  Input: ${JSON.stringify(testCase)}`);
                    console.error(`  Error: ${result.error}`);
                }
            }
        }
        
        // Log summary
        console.log(`\nTest Summary:`);
        console.log(`  Total: ${results.totalTests}`);
        console.log(`  Passed: ${results.passedTests}`);
        console.log(`  Failed: ${results.failedTests}`);
        
        if (results.success) {
            console.log(`✓ Property test PASSED - All ${iterations} iterations successful`);
        } else {
            console.log(`✗ Property test FAILED - ${results.failedTests} failures`);
        }
        
        return results;
    }
    
    /**
     * Generate a random test case for direction mapping
     * @returns {Object} Test case with initial and new directions
     */
    static generateDirectionTestCase() {
        const directions = ['up', 'down', 'left', 'right'];
        
        return {
            initialDirection: directions[Math.floor(Math.random() * directions.length)],
            newDirection: directions[Math.floor(Math.random() * directions.length)],
            startX: Math.floor(Math.random() * 10) + 5, // Avoid board edges
            startY: Math.floor(Math.random() * 10) + 5
        };
    }
    
    /**
     * Test a single direction mapping case
     * @param {Object} testCase - Test case parameters
     * @returns {Object} Result with success status and error details
     */
    static testSingleDirectionMapping(testCase) {
        const { initialDirection, newDirection, startX, startY } = testCase;
        
        try {
            // Create snake with initial position and direction
            const snake = new Snake(startX, startY);
            snake.direction = initialDirection;
            snake.nextDirection = initialDirection;
            
            // Record initial head position
            const initialHead = { ...snake.getHead() };
            
            // Change direction (this may be rejected if it's a reversal)
            snake.changeDirection(newDirection);
            
            // Move the snake one step
            snake.move();
            
            // Get new head position
            const newHead = snake.getHead();
            
            // Determine what direction the snake should have moved
            const expectedDirection = this.getExpectedDirection(initialDirection, newDirection);
            
            // Calculate expected position
            const expectedHead = this.calculateExpectedPosition(initialHead, expectedDirection);
            
            // Verify the snake moved to the expected position
            if (newHead.x !== expectedHead.x || newHead.y !== expectedHead.y) {
                return {
                    success: false,
                    error: `Position mismatch. Expected (${expectedHead.x}, ${expectedHead.y}), got (${newHead.x}, ${newHead.y}). Expected direction: ${expectedDirection}`
                };
            }
            
            // Verify the direction change was handled correctly
            const actualDirection = this.getActualDirection(initialHead, newHead);
            if (actualDirection !== expectedDirection) {
                return {
                    success: false,
                    error: `Direction mismatch. Expected ${expectedDirection}, got ${actualDirection}`
                };
            }
            
            return { success: true };
            
        } catch (error) {
            return {
                success: false,
                error: `Exception: ${error.message}`
            };
        }
    }
    
    /**
     * Determine the expected direction after a direction change request
     * @param {string} currentDirection - Current snake direction
     * @param {string} requestedDirection - Requested new direction
     * @returns {string} Expected actual direction (may be same as current if reversal)
     */
    static getExpectedDirection(currentDirection, requestedDirection) {
        // Check if the requested direction is a reversal
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };
        
        // If it's a reversal, snake should continue in current direction
        if (opposites[currentDirection] === requestedDirection) {
            return currentDirection;
        }
        
        // Otherwise, snake should move in the requested direction
        return requestedDirection;
    }
    
    /**
     * Calculate expected position after moving in a direction
     * @param {Object} position - Current position {x, y}
     * @param {string} direction - Direction to move
     * @returns {Object} Expected new position {x, y}
     */
    static calculateExpectedPosition(position, direction) {
        const newPos = { ...position };
        
        switch (direction) {
            case 'up':
                newPos.y -= 1;
                break;
            case 'down':
                newPos.y += 1;
                break;
            case 'left':
                newPos.x -= 1;
                break;
            case 'right':
                newPos.x += 1;
                break;
        }
        
        return newPos;
    }
    
    /**
     * Determine actual direction from position change
     * @param {Object} oldPos - Previous position {x, y}
     * @param {Object} newPos - New position {x, y}
     * @returns {string} Direction of movement
     */
    static getActualDirection(oldPos, newPos) {
        const dx = newPos.x - oldPos.x;
        const dy = newPos.y - oldPos.y;
        
        if (dx === 1 && dy === 0) return 'right';
        if (dx === -1 && dy === 0) return 'left';
        if (dx === 0 && dy === 1) return 'down';
        if (dx === 0 && dy === -1) return 'up';
        
        return 'none'; // No movement or invalid movement
    }
}

// Export test runner function for external use
export function runSnakeMovementPropertyTest() {
    return SnakePropertyTest.runInputDirectionMappingTest(100);
}