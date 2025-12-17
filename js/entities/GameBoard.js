/**
 * GameBoard - Grid management and boundary definitions with retro rendering
 * Requirements: 4.1, 4.3, 4.4 - Retro pixel art styling and visual rendering
 */

export class GameBoard {
    constructor(width, height, cellSize) {
        this.width = width;
        this.height = height;
        this.cellSize = cellSize;
        this.gridWidth = Math.floor(width / cellSize);
        this.gridHeight = Math.floor(height / cellSize);
        
        // Retro color scheme
        this.colors = {
            background: '#000000',
            gridLine: '#003300',
            border: '#00ff41'
        };
    }

    /**
     * Render the game board with retro pixel art styling
     * Requirements: 4.1, 4.3 - Retro aesthetics and visual rendering
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    render(ctx) {
        // Fill background
        ctx.fillStyle = this.colors.background;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw subtle grid lines for retro feel
        ctx.strokeStyle = this.colors.gridLine;
        ctx.lineWidth = 0.5;
        
        // Vertical grid lines
        for (let x = 0; x <= this.gridWidth; x++) {
            const xPos = x * this.cellSize;
            ctx.beginPath();
            ctx.moveTo(xPos, 0);
            ctx.lineTo(xPos, this.height);
            ctx.stroke();
        }
        
        // Horizontal grid lines
        for (let y = 0; y <= this.gridHeight; y++) {
            const yPos = y * this.cellSize;
            ctx.beginPath();
            ctx.moveTo(0, yPos);
            ctx.lineTo(this.width, yPos);
            ctx.stroke();
        }
        
        // Draw border for retro arcade feel
        ctx.strokeStyle = this.colors.border;
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, this.width, this.height);
    }

    /**
     * Check if position is valid within board boundaries
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} True if position is valid
     */
    isValidPosition(x, y) {
        return x >= 0 && x < this.gridWidth && y >= 0 && y < this.gridHeight;
    }

    /**
     * Get grid width in cells
     * @returns {number} Grid width
     */
    getGridWidth() {
        return this.gridWidth;
    }

    /**
     * Get grid height in cells
     * @returns {number} Grid height
     */
    getGridHeight() {
        return this.gridHeight;
    }

    /**
     * Get cell size in pixels
     * @returns {number} Cell size
     */
    getCellSize() {
        return this.cellSize;
    }

    /**
     * Convert grid coordinates to pixel coordinates
     * @param {number} gridX - Grid X coordinate
     * @param {number} gridY - Grid Y coordinate
     * @returns {Object} Pixel coordinates {x, y}
     */
    gridToPixel(gridX, gridY) {
        return {
            x: gridX * this.cellSize,
            y: gridY * this.cellSize
        };
    }

    /**
     * Convert pixel coordinates to grid coordinates
     * @param {number} pixelX - Pixel X coordinate
     * @param {number} pixelY - Pixel Y coordinate
     * @returns {Object} Grid coordinates {x, y}
     */
    pixelToGrid(pixelX, pixelY) {
        return {
            x: Math.floor(pixelX / this.cellSize),
            y: Math.floor(pixelY / this.cellSize)
        };
    }
}