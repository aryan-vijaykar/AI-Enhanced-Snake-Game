/**
 * Snake - Player-controlled entity with movement and collision detection
 * Handles direction changes, body growth, and collision detection
 */

export class Snake {
    constructor(startX, startY) {
        this.body = [{ x: startX, y: startY }];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.alive = true;
    }

    /**
     * Move the snake forward in its current direction
     * Requirements: 1.1, 1.5 - Snake moves continuously in current direction
     */
    move() {
        if (!this.alive) return;

        // Update direction from queued direction
        this.direction = this.nextDirection;

        // Calculate new head position based on current direction
        const head = { ...this.body[0] };
        
        switch (this.direction) {
            case 'up':
                head.y -= 1;
                break;
            case 'down':
                head.y += 1;
                break;
            case 'left':
                head.x -= 1;
                break;
            case 'right':
                head.x += 1;
                break;
        }

        // Add new head to front of body
        this.body.unshift(head);
        
        // Remove tail (will be added back if growing)
        this.body.pop();
    }

    /**
     * Grow the snake by one segment
     * Requirements: 1.2 - Snake grows when consuming food
     */
    grow() {
        if (!this.alive) return;

        // Add a new segment at the tail
        const tail = this.body[this.body.length - 1];
        this.body.push({ ...tail });
    }

    /**
     * Check for collisions with walls or self
     * Requirements: 1.3, 6.2 - Accurate collision detection based on grid positions
     * @param {number} boardWidth - Width of the game board
     * @param {number} boardHeight - Height of the game board
     * @returns {boolean} True if collision detected
     */
    checkCollision(boardWidth, boardHeight) {
        if (!this.alive) return true;

        const head = this.body[0];

        // Check wall collision
        if (head.x < 0 || head.x >= boardWidth || head.y < 0 || head.y >= boardHeight) {
            this.alive = false;
            return true;
        }

        // Check self collision (head with body segments)
        for (let i = 1; i < this.body.length; i++) {
            if (head.x === this.body[i].x && head.y === this.body[i].y) {
                this.alive = false;
                return true;
            }
        }

        return false;
    }

    /**
     * Change snake direction with reversal prevention
     * Requirements: 6.1, 6.3 - Respond to direction changes, prevent immediate reversal
     * @param {string} newDirection - New direction ('up', 'down', 'left', 'right')
     */
    changeDirection(newDirection) {
        if (!this.alive) return;

        // Prevent immediate reversal that would cause self-collision
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        // Only allow direction change if it's not the opposite of current direction
        if (opposites[this.direction] !== newDirection) {
            this.nextDirection = newDirection;
        }
    }

    /**
     * Get the head position of the snake
     * @returns {Object} Head position {x, y}
     */
    getHead() {
        return this.body[0];
    }

    /**
     * Get the entire body of the snake
     * @returns {Array} Array of body segments
     */
    getBody() {
        return this.body;
    }

    /**
     * Check if snake is alive
     * @returns {boolean} True if snake is alive
     */
    isAlive() {
        return this.alive;
    }

    /**
     * Get current length of the snake
     * @returns {number} Length of snake
     */
    getLength() {
        return this.body.length;
    }
}