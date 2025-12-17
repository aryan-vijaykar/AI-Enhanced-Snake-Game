/**
 * Food - Collectible items that appear on the game board
 * Handles random placement in empty positions
 */

export class Food {
    constructor() {
        this.position = { x: 0, y: 0 };
        this.pointValue = 10;
    }

    /**
     * Spawn food at a random empty location on the board
     * Requirements: 1.4 - Spawn new food at random empty location when consumed
     * @param {number} boardWidth - Width of the game board
     * @param {number} boardHeight - Height of the game board
     * @param {Array} occupiedPositions - Array of positions occupied by snake body
     */
    spawn(boardWidth, boardHeight, occupiedPositions = []) {
        // Get all empty positions on the board
        const emptyPositions = this.getEmptyPositions(boardWidth, boardHeight, occupiedPositions);
        
        // If no empty positions available, place at origin (edge case)
        if (emptyPositions.length === 0) {
            this.position = { x: 0, y: 0 };
            return;
        }

        // Select random empty position
        const randomIndex = Math.floor(Math.random() * emptyPositions.length);
        this.position = emptyPositions[randomIndex];
    }

    /**
     * Get all empty positions on the board
     * @param {number} boardWidth - Width of the game board
     * @param {number} boardHeight - Height of the game board
     * @param {Array} occupiedPositions - Array of positions occupied by snake body
     * @returns {Array} Array of empty positions
     */
    getEmptyPositions(boardWidth, boardHeight, occupiedPositions = []) {
        const emptyPositions = [];
        
        // Create set of occupied positions for faster lookup
        const occupiedSet = new Set(
            occupiedPositions.map(pos => `${pos.x},${pos.y}`)
        );

        // Check each position on the board
        for (let x = 0; x < boardWidth; x++) {
            for (let y = 0; y < boardHeight; y++) {
                const posKey = `${x},${y}`;
                if (!occupiedSet.has(posKey)) {
                    emptyPositions.push({ x, y });
                }
            }
        }

        return emptyPositions;
    }

    /**
     * Check if food is at the specified position
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} True if food is at position
     */
    isAt(x, y) {
        return this.position.x === x && this.position.y === y;
    }

    /**
     * Get the current position of the food
     * @returns {Object} Position {x, y}
     */
    getPosition() {
        return this.position;
    }

    /**
     * Get the point value of the food
     * @returns {number} Point value
     */
    getValue() {
        return this.pointValue;
    }

    /**
     * Set the position of the food (for testing purposes)
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     */
    setPosition(x, y) {
        this.position = { x, y };
    }
}