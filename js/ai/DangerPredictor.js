/**
 * DangerPredictor - AI system that predicts and visualizes dangerous areas
 * Helps players avoid traps and dead-ends before they happen
 */

export class DangerPredictor {
    constructor(boardWidth, boardHeight) {
        this.boardWidth = boardWidth;
        this.boardHeight = boardHeight;
        this.dangerZones = [];
        this.enabled = true;
        this.animationTime = 0;
    }

    /**
     * Toggle danger prediction
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Enable danger prediction
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Disable danger prediction
     */
    disable() {
        this.enabled = false;
    }

    /**
     * Check if enabled
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Analyze the board and predict dangerous areas
     */
    analyze(snakeHead, snakeBody, foodPosition) {
        if (!this.enabled) {
            this.dangerZones = [];
            return;
        }

        this.dangerZones = [];
        const obstacles = new Set(snakeBody.map(p => `${p.x},${p.y}`));

        // Check each adjacent cell for danger
        const directions = [
            { dx: 0, dy: -1, name: 'up' },
            { dx: 0, dy: 1, name: 'down' },
            { dx: -1, dy: 0, name: 'left' },
            { dx: 1, dy: 0, name: 'right' }
        ];

        for (const dir of directions) {
            const nextPos = {
                x: snakeHead.x + dir.dx,
                y: snakeHead.y + dir.dy
            };

            // Skip if out of bounds or blocked
            if (!this.isValidPosition(nextPos) || obstacles.has(`${nextPos.x},${nextPos.y}`)) {
                continue;
            }

            // Calculate danger level for this position
            const dangerLevel = this.calculateDangerLevel(nextPos, snakeBody, foodPosition);
            
            if (dangerLevel > 0) {
                this.dangerZones.push({
                    position: nextPos,
                    level: dangerLevel,
                    direction: dir.name,
                    reason: this.getDangerReason(dangerLevel)
                });
            }
        }

        // Also check for corridor traps (areas with limited escape)
        this.detectCorridorTraps(snakeHead, snakeBody);
    }

    /**
     * Calculate danger level for a position (0-100)
     */
    calculateDangerLevel(position, snakeBody, foodPosition) {
        let danger = 0;
        const obstacles = new Set(snakeBody.map(p => `${p.x},${p.y}`));

        // Factor 1: Available escape routes
        const escapeRoutes = this.countEscapeRoutes(position, obstacles);
        if (escapeRoutes === 0) {
            danger += 100; // Immediate death
        } else if (escapeRoutes === 1) {
            danger += 60; // Very dangerous - only one way out
        } else if (escapeRoutes === 2) {
            danger += 30; // Somewhat risky
        }

        // Factor 2: Proximity to walls
        const wallProximity = this.calculateWallProximity(position);
        danger += wallProximity * 10;

        // Factor 3: Proximity to snake body
        const bodyProximity = this.calculateBodyProximity(position, snakeBody);
        danger += bodyProximity * 15;

        // Factor 4: Dead-end detection (flood fill)
        const reachableArea = this.floodFillCount(position, obstacles);
        const totalArea = this.boardWidth * this.boardHeight - snakeBody.length;
        const areaRatio = reachableArea / totalArea;
        
        if (areaRatio < 0.1) {
            danger += 50; // Very limited space
        } else if (areaRatio < 0.3) {
            danger += 25; // Limited space
        }

        // Factor 5: Distance from food (going away from food is slightly risky)
        const currentDistToFood = Math.abs(position.x - foodPosition.x) + Math.abs(position.y - foodPosition.y);
        if (currentDistToFood > 10) {
            danger += 5;
        }

        return Math.min(100, danger);
    }

    /**
     * Count available escape routes from a position
     */
    countEscapeRoutes(position, obstacles) {
        let routes = 0;
        const directions = [
            { dx: 0, dy: -1 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 },
            { dx: 1, dy: 0 }
        ];

        for (const dir of directions) {
            const nextPos = {
                x: position.x + dir.dx,
                y: position.y + dir.dy
            };

            if (this.isValidPosition(nextPos) && !obstacles.has(`${nextPos.x},${nextPos.y}`)) {
                routes++;
            }
        }

        return routes;
    }

    /**
     * Calculate proximity to walls (0-4, higher = closer to walls)
     */
    calculateWallProximity(position) {
        let proximity = 0;
        
        if (position.x <= 1) proximity++;
        if (position.x >= this.boardWidth - 2) proximity++;
        if (position.y <= 1) proximity++;
        if (position.y >= this.boardHeight - 2) proximity++;
        
        // Corner penalty
        if ((position.x <= 1 || position.x >= this.boardWidth - 2) &&
            (position.y <= 1 || position.y >= this.boardHeight - 2)) {
            proximity++;
        }

        return proximity;
    }

    /**
     * Calculate proximity to snake body
     */
    calculateBodyProximity(position, snakeBody) {
        let closeSegments = 0;
        
        for (const segment of snakeBody) {
            const dist = Math.abs(position.x - segment.x) + Math.abs(position.y - segment.y);
            if (dist <= 2) {
                closeSegments++;
            }
        }

        return Math.min(4, closeSegments);
    }

    /**
     * Flood fill to count reachable area
     */
    floodFillCount(start, obstacles) {
        const visited = new Set();
        const queue = [start];
        let count = 0;
        const maxCount = 100; // Limit for performance

        while (queue.length > 0 && count < maxCount) {
            const pos = queue.shift();
            const key = `${pos.x},${pos.y}`;

            if (visited.has(key) || obstacles.has(key) || !this.isValidPosition(pos)) {
                continue;
            }

            visited.add(key);
            count++;

            // Add neighbors
            queue.push({ x: pos.x + 1, y: pos.y });
            queue.push({ x: pos.x - 1, y: pos.y });
            queue.push({ x: pos.x, y: pos.y + 1 });
            queue.push({ x: pos.x, y: pos.y - 1 });
        }

        return count;
    }

    /**
     * Detect corridor traps - narrow passages that could trap the snake
     */
    detectCorridorTraps(snakeHead, snakeBody) {
        const obstacles = new Set(snakeBody.map(p => `${p.x},${p.y}`));
        
        // Look ahead several moves
        for (let distance = 2; distance <= 4; distance++) {
            const directions = [
                { x: snakeHead.x + distance, y: snakeHead.y },
                { x: snakeHead.x - distance, y: snakeHead.y },
                { x: snakeHead.x, y: snakeHead.y + distance },
                { x: snakeHead.x, y: snakeHead.y - distance }
            ];

            for (const pos of directions) {
                if (!this.isValidPosition(pos)) continue;
                
                const escapeRoutes = this.countEscapeRoutes(pos, obstacles);
                if (escapeRoutes <= 1) {
                    // This is a potential trap area
                    const existingZone = this.dangerZones.find(
                        z => z.position.x === pos.x && z.position.y === pos.y
                    );
                    
                    if (!existingZone) {
                        this.dangerZones.push({
                            position: pos,
                            level: 40,
                            direction: 'trap',
                            reason: 'Potential trap ahead'
                        });
                    }
                }
            }
        }
    }

    /**
     * Get human-readable danger reason
     */
    getDangerReason(level) {
        if (level >= 80) return 'CRITICAL: Dead end!';
        if (level >= 60) return 'HIGH: Limited escape';
        if (level >= 40) return 'MEDIUM: Risky area';
        if (level >= 20) return 'LOW: Be careful';
        return 'Slight risk';
    }

    /**
     * Check if position is valid
     */
    isValidPosition(pos) {
        return pos.x >= 0 && pos.x < this.boardWidth && 
               pos.y >= 0 && pos.y < this.boardHeight;
    }

    /**
     * Render danger zones on canvas
     */
    render(ctx, cellSize) {
        if (!this.enabled || this.dangerZones.length === 0) return;

        this.animationTime += 0.15;

        for (const zone of this.dangerZones) {
            const x = zone.position.x * cellSize;
            const y = zone.position.y * cellSize;
            const size = cellSize - 2;

            // Pulsing effect based on danger level
            const pulseSpeed = zone.level / 30;
            const pulse = Math.sin(this.animationTime * pulseSpeed) * 0.3 + 0.5;
            const alpha = (zone.level / 100) * pulse;

            // Color based on danger level
            let color;
            if (zone.level >= 80) {
                color = `rgba(255, 0, 0, ${alpha})`; // Red - critical
            } else if (zone.level >= 60) {
                color = `rgba(255, 100, 0, ${alpha})`; // Orange - high
            } else if (zone.level >= 40) {
                color = `rgba(255, 200, 0, ${alpha})`; // Yellow - medium
            } else {
                color = `rgba(255, 255, 100, ${alpha * 0.5})`; // Light yellow - low
            }

            // Draw danger zone
            ctx.fillStyle = color;
            ctx.fillRect(x + 1, y + 1, size, size);

            // Draw warning border
            ctx.strokeStyle = color.replace(alpha.toString(), (alpha * 2).toString());
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 1, y + 1, size, size);

            // Draw warning symbol for high danger
            if (zone.level >= 60) {
                ctx.fillStyle = '#ffffff';
                ctx.font = 'bold 10px monospace';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('!', x + cellSize / 2, y + cellSize / 2);
            }
        }
    }

    /**
     * Get danger zones data
     */
    getDangerZones() {
        return this.dangerZones;
    }

    /**
     * Get the safest direction to move
     */
    getSafestDirection(snakeHead, snakeBody) {
        const directions = ['up', 'down', 'left', 'right'];
        let safest = null;
        let lowestDanger = Infinity;

        for (const dir of directions) {
            const zone = this.dangerZones.find(z => z.direction === dir);
            const danger = zone ? zone.level : 0;
            
            if (danger < lowestDanger) {
                lowestDanger = danger;
                safest = dir;
            }
        }

        return { direction: safest, dangerLevel: lowestDanger };
    }

    /**
     * Reset predictor state
     */
    reset() {
        this.dangerZones = [];
    }

    /**
     * Update board dimensions
     */
    updateBoardSize(width, height) {
        this.boardWidth = width;
        this.boardHeight = height;
    }
}
