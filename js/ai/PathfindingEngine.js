/**
 * PathfindingEngine - A* algorithm implementation for optimal route calculation
 * Requirements: 2.1 - Calculate shortest safe path from snake's head to food
 */

export class PathfindingEngine {
    constructor(boardWidth, boardHeight) {
        this.boardWidth = boardWidth;
        this.boardHeight = boardHeight;
    }

    /**
     * Find the shortest safe path from start to target using A* algorithm
     * Requirements: 2.1 - AI assistance calculates shortest safe path to food
     * @param {Object} start - Starting position {x, y}
     * @param {Object} target - Target position {x, y}
     * @param {Array} obstacles - Array of obstacle positions (snake body)
     * @returns {Array|null} Array of positions representing the path, or null if no path exists
     */
    findPath(start, target, obstacles = []) {
        // Validate inputs
        if (!this.isValidPosition(start) || !this.isValidPosition(target)) {
            return null;
        }

        // Create obstacle set for fast lookup
        const obstacleSet = new Set(
            obstacles.map(pos => `${pos.x},${pos.y}`)
        );

        // If target is blocked, no path exists
        if (obstacleSet.has(`${target.x},${target.y}`)) {
            return null;
        }

        // A* algorithm implementation
        const openSet = [start];
        const closedSet = new Set();
        const gScore = new Map(); // Cost from start to node
        const fScore = new Map(); // gScore + heuristic
        const cameFrom = new Map(); // Parent tracking for path reconstruction

        // Initialize scores
        const startKey = `${start.x},${start.y}`;
        gScore.set(startKey, 0);
        fScore.set(startKey, this.heuristic(start, target));

        while (openSet.length > 0) {
            // Find node with lowest fScore
            let current = openSet[0];
            let currentIndex = 0;
            
            for (let i = 1; i < openSet.length; i++) {
                const nodeKey = `${openSet[i].x},${openSet[i].y}`;
                const currentKey = `${current.x},${current.y}`;
                
                if (fScore.get(nodeKey) < fScore.get(currentKey)) {
                    current = openSet[i];
                    currentIndex = i;
                }
            }

            // Remove current from open set
            openSet.splice(currentIndex, 1);
            
            const currentKey = `${current.x},${current.y}`;
            closedSet.add(currentKey);

            // Check if we reached the target
            if (current.x === target.x && current.y === target.y) {
                return this.reconstructPath(cameFrom, current);
            }

            // Check all neighbors
            const neighbors = this.getNeighbors(current);
            
            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;
                
                // Skip if already evaluated or is an obstacle
                if (closedSet.has(neighborKey) || obstacleSet.has(neighborKey)) {
                    continue;
                }

                // Calculate tentative gScore
                const tentativeGScore = gScore.get(currentKey) + 1;

                // Add to open set if not already there
                if (!openSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                    openSet.push(neighbor);
                }

                // Skip if this path to neighbor is worse than existing one
                if (gScore.has(neighborKey) && tentativeGScore >= gScore.get(neighborKey)) {
                    continue;
                }

                // This path is the best so far, record it
                cameFrom.set(neighborKey, current);
                gScore.set(neighborKey, tentativeGScore);
                fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, target));
            }
        }

        // No path found
        return null;
    }

    /**
     * Get valid neighboring positions
     * @param {Object} position - Current position {x, y}
     * @returns {Array} Array of valid neighbor positions
     */
    getNeighbors(position) {
        const neighbors = [];
        const directions = [
            { x: 0, y: -1 }, // up
            { x: 0, y: 1 },  // down
            { x: -1, y: 0 }, // left
            { x: 1, y: 0 }   // right
        ];

        for (const dir of directions) {
            const neighbor = {
                x: position.x + dir.x,
                y: position.y + dir.y
            };

            if (this.isValidPosition(neighbor)) {
                neighbors.push(neighbor);
            }
        }

        return neighbors;
    }

    /**
     * Calculate heuristic distance (Manhattan distance)
     * @param {Object} pos1 - First position {x, y}
     * @param {Object} pos2 - Second position {x, y}
     * @returns {number} Manhattan distance
     */
    heuristic(pos1, pos2) {
        return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
    }

    /**
     * Reconstruct path from cameFrom map
     * @param {Map} cameFrom - Parent tracking map
     * @param {Object} current - Current position
     * @returns {Array} Array of positions representing the path
     */
    reconstructPath(cameFrom, current) {
        const path = [current];
        let currentKey = `${current.x},${current.y}`;

        while (cameFrom.has(currentKey)) {
            current = cameFrom.get(currentKey);
            path.unshift(current);
            currentKey = `${current.x},${current.y}`;
        }

        return path;
    }

    /**
     * Check if position is valid within board boundaries
     * @param {Object} position - Position to check {x, y}
     * @returns {boolean} True if position is valid
     */
    isValidPosition(position) {
        return position.x >= 0 && 
               position.x < this.boardWidth && 
               position.y >= 0 && 
               position.y < this.boardHeight;
    }

    /**
     * Get the next move direction from a path
     * Requirements: 2.5 - Highlight next recommended move direction
     * @param {Array} path - Path array from findPath
     * @returns {string|null} Direction string ('up', 'down', 'left', 'right') or null
     */
    getNextMoveFromPath(path) {
        if (!path || path.length < 2) {
            return null;
        }

        const current = path[0];
        const next = path[1];

        const dx = next.x - current.x;
        const dy = next.y - current.y;

        if (dx === 1) return 'right';
        if (dx === -1) return 'left';
        if (dy === 1) return 'down';
        if (dy === -1) return 'up';

        return null;
    }

    /**
     * Check if a path is safe (doesn't intersect with obstacles)
     * @param {Array} path - Path to check
     * @param {Array} obstacles - Array of obstacle positions
     * @returns {boolean} True if path is safe
     */
    isPathSafe(path, obstacles) {
        if (!path || path.length === 0) {
            return false;
        }

        const obstacleSet = new Set(
            obstacles.map(pos => `${pos.x},${pos.y}`)
        );

        // Check each position in path (except start)
        for (let i = 1; i < path.length; i++) {
            const pos = path[i];
            if (obstacleSet.has(`${pos.x},${pos.y}`)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Find all safe moves from current position
     * Requirements: 2.4 - Indicate alternative safe moves when no path to food exists
     * @param {Object} position - Current position {x, y}
     * @param {Array} obstacles - Array of obstacle positions
     * @returns {Array} Array of safe move directions
     */
    findSafeMoves(position, obstacles) {
        const safeMoves = [];
        const obstacleSet = new Set(
            obstacles.map(pos => `${pos.x},${pos.y}`)
        );

        const moves = [
            { direction: 'up', pos: { x: position.x, y: position.y - 1 } },
            { direction: 'down', pos: { x: position.x, y: position.y + 1 } },
            { direction: 'left', pos: { x: position.x - 1, y: position.y } },
            { direction: 'right', pos: { x: position.x + 1, y: position.y } }
        ];

        for (const move of moves) {
            if (this.isValidPosition(move.pos) && 
                !obstacleSet.has(`${move.pos.x},${move.pos.y}`)) {
                safeMoves.push(move.direction);
            }
        }

        return safeMoves;
    }

    /**
     * Get fallback suggestions when no direct path to food exists
     * Requirements: 2.4 - Suggest safe moves when no path to food exists
     * @param {Object} position - Current position {x, y}
     * @param {Object} target - Target position {x, y}
     * @param {Array} obstacles - Array of obstacle positions
     * @returns {Object} Fallback suggestions with prioritized moves and reasoning
     */
    getFallbackSuggestions(position, target, obstacles) {
        const safeMoves = this.findSafeMoves(position, obstacles);
        
        if (safeMoves.length === 0) {
            return {
                moves: [],
                reasoning: 'No safe moves available - game over imminent',
                priority: 'critical'
            };
        }

        // Score each safe move based on multiple factors
        const scoredMoves = safeMoves.map(direction => {
            const movePos = this.getMovePosition(position, direction);
            const score = this.calculateMoveScore(movePos, target, obstacles);
            
            return {
                direction,
                position: movePos,
                score,
                reasoning: this.getMoveReasoning(movePos, target, obstacles, score)
            };
        });

        // Sort by score (higher is better)
        scoredMoves.sort((a, b) => b.score - a.score);

        return {
            moves: scoredMoves,
            reasoning: this.getOverallReasoning(scoredMoves, target),
            priority: this.getPriorityLevel(scoredMoves.length, scoredMoves[0]?.score || 0)
        };
    }

    /**
     * Get position after making a move
     * @param {Object} position - Current position {x, y}
     * @param {string} direction - Move direction
     * @returns {Object} New position {x, y}
     */
    getMovePosition(position, direction) {
        const moves = {
            'up': { x: position.x, y: position.y - 1 },
            'down': { x: position.x, y: position.y + 1 },
            'left': { x: position.x - 1, y: position.y },
            'right': { x: position.x + 1, y: position.y }
        };
        return moves[direction];
    }

    /**
     * Calculate score for a potential move
     * @param {Object} movePos - Position after move {x, y}
     * @param {Object} target - Target position {x, y}
     * @param {Array} obstacles - Array of obstacle positions
     * @returns {number} Move score (higher is better)
     */
    calculateMoveScore(movePos, target, obstacles) {
        let score = 0;

        // Factor 1: Distance to target (closer is better)
        const distanceToTarget = this.heuristic(movePos, target);
        score += Math.max(0, 50 - distanceToTarget); // Max 50 points for being close

        // Factor 2: Available space around the move (more space is better)
        const spaceScore = this.calculateSpaceScore(movePos, obstacles);
        score += spaceScore * 10; // Up to 40 points for open space

        // Factor 3: Avoid corners and edges (center positions are safer)
        const centerScore = this.calculateCenterScore(movePos);
        score += centerScore * 5; // Up to 20 points for center positions

        // Factor 4: Future mobility (positions that allow more future moves)
        const mobilityScore = this.calculateMobilityScore(movePos, obstacles);
        score += mobilityScore * 15; // Up to 60 points for mobility

        return score;
    }

    /**
     * Calculate space score based on available adjacent positions
     * @param {Object} position - Position to evaluate {x, y}
     * @param {Array} obstacles - Array of obstacle positions
     * @returns {number} Space score (0-4)
     */
    calculateSpaceScore(position, obstacles) {
        const obstacleSet = new Set(obstacles.map(pos => `${pos.x},${pos.y}`));
        const neighbors = this.getNeighbors(position);
        
        return neighbors.filter(neighbor => 
            !obstacleSet.has(`${neighbor.x},${neighbor.y}`)
        ).length;
    }

    /**
     * Calculate center score (positions closer to center are safer)
     * @param {Object} position - Position to evaluate {x, y}
     * @returns {number} Center score (0-4)
     */
    calculateCenterScore(position) {
        const centerX = this.boardWidth / 2;
        const centerY = this.boardHeight / 2;
        const maxDistance = Math.max(centerX, centerY);
        const distance = Math.sqrt(
            Math.pow(position.x - centerX, 2) + Math.pow(position.y - centerY, 2)
        );
        
        return Math.max(0, 4 - (distance / maxDistance) * 4);
    }

    /**
     * Calculate mobility score (future movement options)
     * @param {Object} position - Position to evaluate {x, y}
     * @param {Array} obstacles - Array of obstacle positions
     * @returns {number} Mobility score (0-4)
     */
    calculateMobilityScore(position, obstacles) {
        // Look ahead one move to see how many options we'll have
        const obstacleSet = new Set(obstacles.map(pos => `${pos.x},${pos.y}`));
        const neighbors = this.getNeighbors(position);
        
        let totalFutureMoves = 0;
        for (const neighbor of neighbors) {
            if (!obstacleSet.has(`${neighbor.x},${neighbor.y}`)) {
                const futureNeighbors = this.getNeighbors(neighbor);
                const futureMoves = futureNeighbors.filter(fn => 
                    !obstacleSet.has(`${fn.x},${fn.y}`) && 
                    !(fn.x === position.x && fn.y === position.y) // Don't count going back
                ).length;
                totalFutureMoves += futureMoves;
            }
        }
        
        return Math.min(4, totalFutureMoves / 2); // Normalize to 0-4 range
    }

    /**
     * Get reasoning text for a move
     * @param {Object} movePos - Position after move {x, y}
     * @param {Object} target - Target position {x, y}
     * @param {Array} obstacles - Array of obstacle positions
     * @param {number} score - Calculated score for the move
     * @returns {string} Human-readable reasoning
     */
    getMoveReasoning(movePos, target, obstacles, score) {
        const distance = this.heuristic(movePos, target);
        const spaceScore = this.calculateSpaceScore(movePos, obstacles);
        
        let reasoning = [];
        
        if (distance <= 3) {
            reasoning.push('close to food');
        } else if (distance > 10) {
            reasoning.push('far from food');
        }
        
        if (spaceScore >= 3) {
            reasoning.push('good open space');
        } else if (spaceScore <= 1) {
            reasoning.push('limited space');
        }
        
        if (score > 80) {
            reasoning.push('excellent choice');
        } else if (score > 60) {
            reasoning.push('good option');
        } else if (score > 40) {
            reasoning.push('acceptable');
        } else {
            reasoning.push('risky move');
        }
        
        return reasoning.join(', ');
    }

    /**
     * Get overall reasoning for the situation
     * @param {Array} scoredMoves - Array of scored moves
     * @param {Object} target - Target position {x, y}
     * @returns {string} Overall situation reasoning
     */
    getOverallReasoning(scoredMoves, target) {
        if (scoredMoves.length === 0) {
            return 'No safe moves available';
        }
        
        if (scoredMoves.length === 1) {
            return `Only one safe move: ${scoredMoves[0].direction}`;
        }
        
        const bestScore = scoredMoves[0].score;
        const worstScore = scoredMoves[scoredMoves.length - 1].score;
        
        if (bestScore > 80) {
            return 'Multiple good options available';
        } else if (bestScore > 60) {
            return 'Some decent moves available';
        } else if (worstScore < 30) {
            return 'All moves are risky - choose carefully';
        } else {
            return 'Limited but viable options';
        }
    }

    /**
     * Get priority level for the situation
     * @param {number} moveCount - Number of available moves
     * @param {number} bestScore - Score of the best move
     * @returns {string} Priority level
     */
    getPriorityLevel(moveCount, bestScore) {
        if (moveCount === 0) {
            return 'critical';
        } else if (moveCount === 1 || bestScore < 40) {
            return 'high';
        } else if (bestScore < 60) {
            return 'medium';
        } else {
            return 'low';
        }
    }

    /**
     * Update board dimensions
     * @param {number} width - New board width
     * @param {number} height - New board height
     */
    updateBoardSize(width, height) {
        this.boardWidth = width;
        this.boardHeight = height;
    }
}