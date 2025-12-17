/**
 * Property-Based Test for Snake Movement
 * **Feature: ai-snake-game, Property 1: Input direction mapping**
 * **Validates: Requirements 1.1**
 */

import { Snake } from './Snake.js';

// Simple property-based testing framework
class PropertyTest {
    static run(name, property, generator, iterations = 100) {
        console.log(`Running property test: ${name}`);
        
        for (let i = 0; i < iterations; i++) {
            const testCase = generator();
            try {
                const result = property(testCase);
                if (!result.success) {
                    console.error(`Property failed on iteration ${i + 1}`);
                    console.error(`Input: ${JSON.stringify(testCase)}`);
                    console.error(`Reason: ${result.reason}`);
                    return false;
                }
            } catch (error) {
                console.error(`Property threw error on iteration ${i + 1}`);
                console.error(`Input: ${JSON.stringify(testCase)}`);
                console.error(`Error: ${error.message}`);
                return false;
            }
        }
        
        console.log(`✓ Property passed all ${iterations} iterations`);
        return true;
    }
}

// Generator for valid directions
function generateValidDirection() {
    const directions = ['up', 'down', 'left', 'right'];
    return directions[Math.floor(Math.random() * directions.length)];
}

// Generator for test cases
function generateDirectionTestCase() {
    return {
        initialDirection: generateValidDirection(),
        newDirection: generateValidDirection(),
        startX: Math.floor(Math.random() * 10) + 5, // Avoid edges
        startY: Math.floor(Math.random() * 10) + 5
    };
}

/**
 * Property 1: Input direction mapping
 * For any valid input direction, the snake should move in the corresponding direction
 */
function testInputDirectionMapping(testCase) {
    const { initialDirection, newDirection, startX, startY } = testCase;
    
    // Create snake with initial position
    const snake = new Snake(startX, startY);
    snake.direction = initialDirection;
    snake.nextDirection = initialDirection;
    
    // Record initial head position
    const initialHead = { ...snake.getHead() };
    
    // Change direction
    snake.changeDirection(newDirection);
    
    // Move the snake
    snake.move();
    
    // Get new head position
    const newHead = snake.getHead();
    
    // Calculate expected position based on direction
    const expectedHead = { ...initialHead };
    
    // The direction should be the new direction (unless it was an invalid reversal)
    const expectedDirection = isValidDirectionChange(initialDirection, newDirection) 
        ? newDirection 
        : initialDirection;
    
    switch (expectedDirection) {
        case 'up':
            expectedHead.y -= 1;
            break;
        case 'down':
            expectedHead.y += 1;
            break;
        case 'left':
            expectedHead.x -= 1;
            break;
        case 'right':
            expectedHead.x += 1;
            break;
    }
    
    // Verify the snake moved in the expected direction
    const actualDirection = getActualDirection(initialHead, newHead);
    
    if (actualDirection !== expectedDirection) {
        return {
            success: false,
            reason: `Expected direction ${expectedDirection}, but snake moved ${actualDirection}. Initial: ${initialDirection}, Requested: ${newDirection}`
        };
    }
    
    // Verify position matches expected
    if (newHead.x !== expectedHead.x || newHead.y !== expectedHead.y) {
        return {
            success: false,
            reason: `Position mismatch. Expected (${expectedHead.x}, ${expectedHead.y}), got (${newHead.x}, ${newHead.y})`
        };
    }
    
    return { success: true };
}

// Helper function to check if direction change is valid (not a reversal)
function isValidDirectionChange(currentDirection, newDirection) {
    const opposites = {
        'up': 'down',
        'down': 'up',
        'left': 'right',
        'right': 'left'
    };
    
    return opposites[currentDirection] !== newDirection;
}

// Helper function to determine actual direction from position change
function getActualDirection(oldPos, newPos) {
    const dx = newPos.x - oldPos.x;
    const dy = newPos.y - oldPos.y;
    
    if (dx === 1 && dy === 0) return 'right';
    if (dx === -1 && dy === 0) return 'left';
    if (dx === 0 && dy === 1) return 'down';
    if (dx === 0 && dy === -1) return 'up';
    
    return 'unknown';
}

// Run the property test
export function runSnakeMovementPropertyTest() {
    console.log('=== Snake Movement Property Test ===');
    console.log('Testing Property 1: Input direction mapping');
    console.log('Validates: Requirements 1.1 - Snake moves in response to direction input');
    
    const result = PropertyTest.run(
        'Input direction mapping',
        testInputDirectionMapping,
        generateDirectionTestCase,
        100
    );
    
    return result;
}

// Run test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const success = runSnakeMovementPropertyTest();
    process.exit(success ? 0 : 1);
}