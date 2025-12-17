/**
 * HintSystem - Visual path display and hint management
 * Requirements: 2.2, 2.5 - Display visual hints and highlight recommended moves
 */

import { PathfindingEngine } from './PathfindingEngine.js';

export class HintSystem {
    constructor(boardWidth, boardHeight, cellSize) {
        this.pathfindingEngine = new PathfindingEngine(boardWidth, boardHeight);
        this.cellSize = cellSize;
        this.hintsEnabled = false;
        this.currentPath = null;
        this.nextMove = null;
        this.currentFoodPosition = null;
        
        // Visual styling for hints
        this.hintColors = {
            path: 'rgba(255, 255, 0, 0.3)',      // Yellow path overlay
            pathBorder: 'rgba(255, 255, 0, 0.8)', // Yellow path border
            nextMove: 'rgba(0, 255, 255, 0.6)',   // Cyan next move highlight
            safeMoves: 'rgba(0, 255, 0, 0.4)'     // Green safe moves
        };
        
        this.animationTime = 0;
    }

    /**
     * Toggle hint display on/off
     * Requirements: 2.2 - Show/hide hints based on player preference
     */
    toggleHints() {
        this.hintsEnabled = !this.hintsEnabled;
        
        if (!this.hintsEnabled) {
            this.currentPath = null;
            this.nextMove = null;
        }
        
        return this.hintsEnabled;
    }

    /**
     * Enable hint display
     * Requirements: 2.2 - Show/hide hints based on player preference
     */
    enableHints() {
        this.hintsEnabled = true;
    }

    /**
     * Disable hint display
     * Requirements: 2.2 - Show/hide hints based on player preference
     */
    disableHints() {
        this.hintsEnabled = false;
        this.currentPath = null;
        this.nextMove = null;
    }

    /**
     * Check if hints are currently enabled
     * @returns {boolean} True if hints are enabled
     */
    areHintsEnabled() {
        return this.hintsEnabled;
    }

    /**
     * Update path calculation based on current game state
     * Requirements: 2.3 - Recalculate optimal route in real-time when snake position changes
     * @param {Object} snakeHead - Snake head position {x, y}
     * @param {Object} foodPosition - Food position {x, y}
     * @param {Array} snakeBody - Array of snake body positions
     */
    updatePath(snakeHead, foodPosition, snakeBody) {
        if (!this.hintsEnabled) {
            return;
        }

        // Store current food position for fallback suggestions
        this.currentFoodPosition = foodPosition;

        // Use snake body (excluding head) as obstacles
        const obstacles = snakeBody.slice(1);
        
        // Calculate new path
        this.currentPath = this.pathfindingEngine.findPath(
            snakeHead, 
            foodPosition, 
            obstacles
        );

        // Update next move recommendation
        this.nextMove = this.pathfindingEngine.getNextMoveFromPath(this.currentPath);
    }

    /**
     * Get safe moves when no path to food exists
     * Requirements: 2.4 - Indicate alternative safe moves when no path exists
     * @param {Object} snakeHead - Snake head position {x, y}
     * @param {Array} snakeBody - Array of snake body positions
     * @returns {Array} Array of safe move directions
     */
    getSafeMoves(snakeHead, snakeBody) {
        const obstacles = snakeBody.slice(1); // Exclude head from obstacles
        return this.pathfindingEngine.findSafeMoves(snakeHead, obstacles);
    }

    /**
     * Get detailed fallback suggestions when no path to food exists
     * Requirements: 2.4 - Suggest safe moves when no path to food exists
     * @param {Object} snakeHead - Snake head position {x, y}
     * @param {Object} foodPosition - Food position {x, y}
     * @param {Array} snakeBody - Array of snake body positions
     * @returns {Object} Detailed fallback suggestions with reasoning
     */
    getFallbackSuggestions(snakeHead, foodPosition, snakeBody) {
        const obstacles = snakeBody.slice(1); // Exclude head from obstacles
        return this.pathfindingEngine.getFallbackSuggestions(snakeHead, foodPosition, obstacles);
    }

    /**
     * Render visual hints on the game canvas
     * Requirements: 2.2 - Render visual hints without obstructing gameplay
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} snakeHead - Snake head position {x, y}
     * @param {Array} snakeBody - Array of snake body positions
     */
    render(ctx, snakeHead, snakeBody) {
        if (!this.hintsEnabled) {
            return;
        }

        // Update animation time for pulsing effects
        this.animationTime += 0.1;

        // Render path if it exists
        if (this.currentPath && this.currentPath.length > 1) {
            this.renderPath(ctx);
            this.renderNextMoveHighlight(ctx);
        } else {
            // No path to food - show safe moves
            this.renderSafeMoves(ctx, snakeHead, snakeBody);
        }
    }

    /**
     * Render the optimal path to food
     * Requirements: 2.2 - Display visual hints without obstructing gameplay
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderPath(ctx) {
        if (!this.currentPath || this.currentPath.length < 2) {
            return;
        }

        // Skip the first position (snake head) when rendering path
        for (let i = 1; i < this.currentPath.length; i++) {
            const pos = this.currentPath[i];
            const x = pos.x * this.cellSize;
            const y = pos.y * this.cellSize;
            
            // Create pulsing effect for path visibility
            const pulse = Math.sin(this.animationTime + i * 0.2) * 0.2 + 0.8;
            const alpha = pulse * 0.3;
            
            // Draw path overlay
            ctx.fillStyle = this.hintColors.path.replace('0.3', alpha.toString());
            ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
            
            // Draw path border for better visibility
            ctx.strokeStyle = this.hintColors.pathBorder;
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);
            
            // Add directional arrow for path flow
            if (i < this.currentPath.length - 1) {
                this.renderDirectionalArrow(ctx, pos, this.currentPath[i + 1]);
            }
        }
    }

    /**
     * Render directional arrows along the path
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} from - Starting position {x, y}
     * @param {Object} to - Ending position {x, y}
     */
    renderDirectionalArrow(ctx, from, to) {
        const centerX = from.x * this.cellSize + this.cellSize / 2;
        const centerY = from.y * this.cellSize + this.cellSize / 2;
        
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        
        // Calculate arrow direction
        let angle = 0;
        if (dx === 1) angle = 0;           // right
        else if (dx === -1) angle = Math.PI; // left
        else if (dy === 1) angle = Math.PI / 2; // down
        else if (dy === -1) angle = -Math.PI / 2; // up
        
        // Draw small arrow
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        
        ctx.fillStyle = this.hintColors.pathBorder;
        ctx.beginPath();
        ctx.moveTo(3, 0);
        ctx.lineTo(-2, -2);
        ctx.lineTo(-2, 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }

    /**
     * Highlight the next recommended move
     * Requirements: 2.5 - Highlight next recommended move direction
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     */
    renderNextMoveHighlight(ctx) {
        if (!this.nextMove || !this.currentPath || this.currentPath.length < 2) {
            return;
        }

        const nextPos = this.currentPath[1]; // First move in path
        const x = nextPos.x * this.cellSize;
        const y = nextPos.y * this.cellSize;
        
        // Create pulsing highlight effect
        const pulse = Math.sin(this.animationTime * 2) * 0.3 + 0.7;
        
        // Draw bright highlight for next move
        ctx.fillStyle = this.hintColors.nextMove.replace('0.6', pulse.toString());
        ctx.fillRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        
        // Add glowing border effect
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, y + 1, this.cellSize - 2, this.cellSize - 2);
        
        // Add inner glow
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x + 3, y + 3, this.cellSize - 6, this.cellSize - 6);
    }

    /**
     * Render safe moves when no path exists
     * Requirements: 2.4 - Indicate alternative safe moves to avoid collision
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} snakeHead - Snake head position {x, y}
     * @param {Array} snakeBody - Array of snake body positions
     */
    renderSafeMoves(ctx, snakeHead, snakeBody) {
        // Get fallback suggestions instead of just safe moves
        const fallbackData = this.getFallbackSuggestions(snakeHead, this.currentFoodPosition, snakeBody);
        
        if (fallbackData.moves.length === 0) {
            this.renderNoMovesWarning(ctx, snakeHead);
            return;
        }

        // Render each suggested move with priority-based styling
        fallbackData.moves.forEach((moveData, index) => {
            const pos = moveData.position;
            const x = pos.x * this.cellSize;
            const y = pos.y * this.cellSize;
            
            // Create staggered pulsing effect based on priority
            const basePulse = Math.sin(this.animationTime * 1.5 + index * 0.3) * 0.2 + 0.6;
            const priorityMultiplier = (fallbackData.moves.length - index) / fallbackData.moves.length;
            const pulse = basePulse * priorityMultiplier + 0.3;
            
            // Color based on move quality
            let color = this.hintColors.safeMoves;
            let borderColor = '#00ff00';
            
            if (moveData.score > 80) {
                color = 'rgba(0, 255, 255, 0.5)'; // Cyan for excellent moves
                borderColor = '#00ffff';
            } else if (moveData.score > 60) {
                color = 'rgba(0, 255, 0, 0.5)'; // Green for good moves
                borderColor = '#00ff00';
            } else if (moveData.score > 40) {
                color = 'rgba(255, 255, 0, 0.4)'; // Yellow for acceptable moves
                borderColor = '#ffff00';
            } else {
                color = 'rgba(255, 165, 0, 0.4)'; // Orange for risky moves
                borderColor = '#ff8800';
            }
            
            // Draw move indicator with priority-based size
            const sizeReduction = index * 1; // Best moves are slightly larger
            const size = this.cellSize - 6 - sizeReduction;
            const offset = 3 + sizeReduction / 2;
            
            ctx.fillStyle = color.replace(/[\d.]+(?=\))/, pulse.toString());
            ctx.fillRect(x + offset, y + offset, size, size);
            
            // Add border with priority-based thickness
            ctx.strokeStyle = borderColor;
            ctx.lineWidth = index === 0 ? 2 : 1; // Best move gets thicker border
            ctx.strokeRect(x + offset, y + offset, size, size);
            
            // Add priority indicator
            this.renderPriorityIndicator(ctx, pos, moveData, index);
        });

        // Render priority legend if multiple moves available
        if (fallbackData.moves.length > 1) {
            this.renderFallbackLegend(ctx, fallbackData);
        }
    }

    /**
     * Render warning when no safe moves are available
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} snakeHead - Snake head position {x, y}
     */
    renderNoMovesWarning(ctx, snakeHead) {
        const x = snakeHead.x * this.cellSize;
        const y = snakeHead.y * this.cellSize;
        
        // Pulsing red warning
        const pulse = Math.sin(this.animationTime * 3) * 0.3 + 0.7;
        
        ctx.fillStyle = `rgba(255, 0, 0, ${pulse})`;
        ctx.fillRect(x - this.cellSize, y - this.cellSize, this.cellSize * 3, this.cellSize * 3);
        
        // Warning text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', x + this.cellSize / 2, y + this.cellSize / 2);
    }

    /**
     * Render priority indicator for each move
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} pos - Position {x, y}
     * @param {Object} moveData - Move data with score and reasoning
     * @param {number} index - Move priority index (0 = best)
     */
    renderPriorityIndicator(ctx, pos, moveData, index) {
        const centerX = pos.x * this.cellSize + this.cellSize / 2;
        const centerY = pos.y * this.cellSize + this.cellSize / 2;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Show priority number (1 = best, 2 = second best, etc.)
        ctx.fillText((index + 1).toString(), centerX, centerY);
        
        // Add small score indicator
        ctx.font = '6px monospace';
        ctx.fillText(Math.round(moveData.score).toString(), centerX, centerY + 8);
    }

    /**
     * Render legend for fallback suggestions
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} fallbackData - Fallback suggestions data
     */
    renderFallbackLegend(ctx, fallbackData) {
        const legendX = 10;
        const legendY = 10;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(legendX, legendY, 200, 60);
        
        // Border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(legendX, legendY, 200, 60);
        
        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('Fallback Suggestions:', legendX + 5, legendY + 5);
        
        // Priority info
        ctx.font = '8px monospace';
        ctx.fillText(`Priority: ${fallbackData.priority}`, legendX + 5, legendY + 20);
        ctx.fillText(`Reason: ${fallbackData.reasoning}`, legendX + 5, legendY + 32);
        
        // Best move info
        if (fallbackData.moves.length > 0) {
            const bestMove = fallbackData.moves[0];
            ctx.fillText(`Best: ${bestMove.direction} (${bestMove.reasoning})`, legendX + 5, legendY + 44);
        }
    }

    /**
     * Render indicator for safe move direction
     * @param {CanvasRenderingContext2D} ctx - Canvas rendering context
     * @param {Object} pos - Position {x, y}
     * @param {string} direction - Move direction
     */
    renderSafeMoveIndicator(ctx, pos, direction) {
        const centerX = pos.x * this.cellSize + this.cellSize / 2;
        const centerY = pos.y * this.cellSize + this.cellSize / 2;
        
        ctx.fillStyle = '#ffffff';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw direction letter
        const directionLetter = direction.charAt(0).toUpperCase();
        ctx.fillText(directionLetter, centerX, centerY);
    }

    /**
     * Get the current recommended next move
     * Requirements: 2.5 - Provide next recommended move direction
     * @returns {string|null} Direction string or null if no recommendation
     */
    getNextMove() {
        return this.nextMove;
    }

    /**
     * Get the current calculated path
     * @returns {Array|null} Current path array or null
     */
    getCurrentPath() {
        return this.currentPath;
    }

    /**
     * Check if a path to food exists
     * @returns {boolean} True if path exists
     */
    hasPathToFood() {
        return this.currentPath !== null && this.currentPath.length > 1;
    }

    /**
     * Update board dimensions
     * @param {number} width - New board width
     * @param {number} height - New board height
     */
    updateBoardSize(width, height) {
        this.pathfindingEngine.updateBoardSize(width, height);
    }

    /**
     * Reset hint system state
     */
    reset() {
        this.currentPath = null;
        this.nextMove = null;
        this.currentFoodPosition = null;
        this.animationTime = 0;
    }
}