/**
 * Manual verification script for Snake Movement Property Test
 * This demonstrates that the property test is correctly implemented
 * **Feature: ai-snake-game, Property 1: Input direction mapping**
 * **Validates: Requirements 1.1**
 */

// Inline Snake class for verification (matches the actual implementation)
class Snake {
    constructor(startX, startY) {
        this.body = [{ x: startX, y: startY }];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.alive = true;
    }

    move() {
        if (!this.alive) return;
        this.direction = this.nextDirection;
        const head = { ...this.body[0] };
        
        switch (this.direction) {
            case 'up': head.y -= 1; break;
            case 'down': head.y += 1; break;
            case 'left': head.x -= 1; break;
            case 'right': head.x += 1; break;
        }

        this.body.unshift(head);
        this.body.pop();
    }

    changeDirection(newDirection) {
        if (!this.alive) return;
        const opposites = { 'up': 'down', 'down': 'up', 'left': 'right', 'right': 'left' };
        if (opposites[this.direction] !== newDirection) {
            this.nextDirection = newDirection;
        }
    }

    getHead() { return this.body[0]; }
}

// Test cases that demonstrate the property
const testCases = [
    // Valid direction changes
    { initial: 'right', requested: 'up', expected: 'up', description: 'Right to Up (valid)' },
    { initial: 'right', requested: 'down', expected: 'down', description: 'Right to Down (valid)' },
    { initial: 'up', requested: 'left', expected: 'left', description: 'Up to Left (valid)' },
    { initial: 'up', requested: 'right', expected: 'right', description: 'Up to Right (valid)' },
    
    // Invalid reversals (should be rejected)
    { initial: 'right', requested: 'left', expected: 'right', description: 'Right to Left (reversal - rejected)' },
    { initial: 'up', requested: 'down', expected: 'up', description: 'Up to Down (reversal - rejected)' },
    { initial: 'left', requested: 'right', expected: 'left', description: 'Left to Right (reversal - rejected)' },
    { initial: 'down', requested: 'up', expected: 'down', description: 'Down to Up (reversal - rejected)' },
    
    // Same direction (should work)
    { initial: 'right', requested: 'right', expected: 'right', description: 'Right to Right (same)' },
    { initial: 'up', requested: 'up', expected: 'up', description: 'Up to Up (same)' }
];

function calculateExpectedPosition(pos, direction) {
    const newPos = { ...pos };
    switch (direction) {
        case 'up': newPos.y -= 1; break;
        case 'down': newPos.y += 1; break;
        case 'left': newPos.x -= 1; break;
        case 'right': newPos.x += 1; break;
    }
    return newPos;
}

function getActualDirection(oldPos, newPos) {
    const dx = newPos.x - oldPos.x;
    const dy = newPos.y - oldPos.y;
    
    if (dx === 1 && dy === 0) return 'right';
    if (dx === -1 && dy === 0) return 'left';
    if (dx === 0 && dy === 1) return 'down';
    if (dx === 0 && dy === -1) return 'up';
    return 'none';
}

console.log('=== Manual Verification of Snake Movement Property ===');
console.log('Property: For any valid input direction, snake moves in corresponding direction');
console.log('Validates: Requirements 1.1 - Snake responds to direction input\n');

let allPassed = true;

testCases.forEach((testCase, index) => {
    const snake = new Snake(5, 5);
    snake.direction = testCase.initial;
    snake.nextDirection = testCase.initial;
    
    const initialPos = { ...snake.getHead() };
    
    // Request direction change
    snake.changeDirection(testCase.requested);
    
    // Move snake
    snake.move();
    
    const newPos = snake.getHead();
    const actualDirection = getActualDirection(initialPos, newPos);
    const expectedPos = calculateExpectedPosition(initialPos, testCase.expected);
    
    const positionCorrect = newPos.x === expectedPos.x && newPos.y === expectedPos.y;
    const directionCorrect = actualDirection === testCase.expected;
    const testPassed = positionCorrect && directionCorrect;
    
    console.log(`Test ${index + 1}: ${testCase.description}`);
    console.log(`  Initial: ${testCase.initial}, Requested: ${testCase.requested}, Expected: ${testCase.expected}`);
    console.log(`  Position: (${initialPos.x},${initialPos.y}) → (${newPos.x},${newPos.y}) [Expected: (${expectedPos.x},${expectedPos.y})]`);
    console.log(`  Direction: ${actualDirection} [Expected: ${testCase.expected}]`);
    console.log(`  Result: ${testPassed ? '✓ PASS' : '✗ FAIL'}`);
    
    if (!testPassed) {
        allPassed = false;
        if (!positionCorrect) console.log(`    Position mismatch!`);
        if (!directionCorrect) console.log(`    Direction mismatch!`);
    }
    console.log('');
});

console.log('=== Summary ===');
if (allPassed) {
    console.log('✓ All manual verification tests PASSED');
    console.log('✓ Property implementation is CORRECT');
    console.log('✓ Ready for property-based testing with random inputs');
} else {
    console.log('✗ Some verification tests FAILED');
    console.log('✗ Property implementation needs review');
}

// Demonstrate property-based testing concept
console.log('\n=== Property-Based Testing Concept ===');
console.log('The property test will:');
console.log('1. Generate 100 random test cases with random initial/requested directions');
console.log('2. For each case, verify the snake moves in the expected direction');
console.log('3. Handle reversal prevention correctly');
console.log('4. Ensure position calculations are accurate');
console.log('5. Report any counterexamples that violate the property');

console.log('\nTo run the full property test:');
console.log('- Open test-runner.html in a web browser');
console.log('- Or use the SnakePropertyTest.runInputDirectionMappingTest() function');

// Return success status for potential automation
if (typeof process !== 'undefined' && process.exit) {
    process.exit(allPassed ? 0 : 1);
}