/**
 * AIGhost - An AI-controlled ghost snake that demonstrates optimal play
 * Shows players the "perfect" path while they play
 */

import { PathfindingEngine } from './PathfindingEngine.js';

export class AIGhost {
    constructor(boardWidth, boardHeight) {
        this.pathfinder = new PathfindingEngine(boardWidth, boardHeight);
        this.boardWidth = boardWidth;
        this.boardHeight = boardHeight;
        
        // Ghost snake state
        this.body = [];
        this.direction = 'right';
        this.enabled = false;
        this.opacity = 0.3;
        
        // Animation
        this.animationOffset = 0;
        this.trailEffect = [];
    }

    /**
     * Initialize ghost at same position as player
     */
    init(startX, startY) {
        this.body = [{ x: startX, y: startY }];
        this.direction = 'right';
        this.trailEffect = [];
    }

    /**
     * Toggle ghost visibility
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Enable ghost
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Disable ghost
     */
    disable() {
        this.enabled = false;
    }

    /**
     * Check if ghost is enabled
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Update ghost position using AI pathfinding
     */
    update(foodPosition, playerBody) {
        if (!this.enabled || this.body.length === 0) return;

        const head = this.body[0];
        
        // Find optimal path to food, avoiding player snake
        const obstacles = [...this.body.slice(1), ...playerBody];
        const path = this.pathfinder.findPath(head, foodPosition, obstacles);
        
        if (path && path.length > 1) {
            // Move towards food
            const nextPos = path[1];
            this.direction = this.getDirection(head, nextPos);
            
            // Add trail effect
            this.trailEffect.unshift({ ...head, alpha: 0.5 });
            if (this.trailEffect.length > 5) {
                this.trailEffect.pop();
            }
            
            // Move ghost
            this.body.unshift({ ...nextPos });
            this.body.pop();
        } else {
            // No path - find safe move
            const safeMoves = this.pathfinder.findSafeMoves(head, obstacles);
            if (safeMoves.length > 0) {
                const move = safeMoves[0];
                const nextPos = this.pathfinder.getMovePosition(head, move);
                this.direction = move;
                
                this.trailEffect.unshift({ ...head, alpha: 0.5 });
                if (this.trailEffect.length > 5) {
                    this.trailEffect.pop();
                }
                
                this.body.unshift(nextPos);
                this.body.pop();
            }
        }
        
        // Update trail fade
        this.trailEffect.forEach((t, i) => {
            t.alpha = Math.max(0, 0.5 - i * 0.1);
        });
    }

    /**
     * Grow ghost snake
     */
    grow() {
        if (this.body.length > 0) {
            const tail = this.body[this.body.length - 1];
            this.body.push({ ...tail });
        }
    }

    /**
     * Check if ghost collected food
     */
    checkFoodCollision(foodPosition) {
        if (this.body.length === 0) return false;
        const head = this.body[0];
        return head.x === foodPosition.x && head.y === foodPosition.y;
    }

    /**
     * Get direction from one position to another
     */
    getDirection(from, to) {
        if (to.x > from.x) return 'right';
        if (to.x < from.x) return 'left';
        if (to.y > from.y) return 'down';
        return 'up';
    }

    /**
     * Render ghost snake with ethereal effect
     */
    render(ctx, cellSize) {
        if (!this.enabled) return;

        this.animationOffset += 0.1;
        
        // Render trail effect
        this.trailEffect.forEach((pos, i) => {
            const x = pos.x * cellSize;
            const y = pos.y * cellSize;
            const size = cellSize - 2;
            
            ctx.fillStyle = `rgba(138, 43, 226, ${pos.alpha * 0.3})`;
            ctx.fillRect(x + 1, y + 1, size, size);
        });

        // Render ghost body
        this.body.forEach((segment, index) => {
            const x = segment.x * cellSize;
            const y = segment.y * cellSize;
            const size = cellSize - 2;
            
            // Pulsing opacity effect
            const pulse = Math.sin(this.animationOffset + index * 0.3) * 0.1 + this.opacity;
            
            if (index === 0) {
                // Ghost head - purple ethereal glow
                ctx.fillStyle = `rgba(138, 43, 226, ${pulse})`;
                ctx.fillRect(x + 1, y + 1, size, size);
                
                // Inner glow
                ctx.fillStyle = `rgba(186, 85, 211, ${pulse * 0.8})`;
                ctx.fillRect(x + 3, y + 3, size - 4, size - 4);
                
                // Ghost eyes
                ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
                const eyeSize = 3;
                ctx.fillRect(x + 5, y + 5, eyeSize, eyeSize);
                ctx.fillRect(x + size - 7, y + 5, eyeSize, eyeSize);
            } else {
                // Ghost body - fading purple
                const fade = Math.max(0.1, pulse - index * 0.03);
                ctx.fillStyle = `rgba(138, 43, 226, ${fade})`;
                ctx.fillRect(x + 1, y + 1, size, size);
            }
            
            // Ethereal border
            ctx.strokeStyle = `rgba(186, 85, 211, ${pulse * 0.5})`;
            ctx.lineWidth = 1;
            ctx.strokeRect(x + 1, y + 1, size, size);
        });

        // Render "AI" label above ghost head
        if (this.body.length > 0) {
            const head = this.body[0];
            ctx.fillStyle = `rgba(186, 85, 211, 0.8)`;
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('AI', head.x * cellSize + cellSize / 2, head.y * cellSize - 2);
        }
    }

    /**
     * Reset ghost state
     */
    reset() {
        this.body = [];
        this.trailEffect = [];
    }

    /**
     * Get ghost body
     */
    getBody() {
        return this.body;
    }

    /**
     * Get ghost length
     */
    getLength() {
        return this.body.length;
    }
}
