/**
 * AICommentator - Provides real-time AI commentary and tips during gameplay
 * Adds personality and guidance to the retro experience
 */

export class AICommentator {
    constructor() {
        this.enabled = true;
        this.currentMessage = '';
        this.messageQueue = [];
        this.displayTime = 3000; // ms to show each message
        this.lastMessageTime = 0;
        this.messageHistory = [];
        this.maxHistory = 10;
        
        // Personality settings
        this.personality = 'retro'; // 'retro', 'coach', 'chill'
        
        // Game state tracking for context-aware comments
        this.lastScore = 0;
        this.lastLength = 0;
        this.nearMissCount = 0;
        this.perfectMoveStreak = 0;
        this.idleTime = 0;
        
        // Comment templates by category
        this.comments = {
            start: [
                "READY PLAYER ONE!",
                "Let's do this! 🐍",
                "Game on! Show me what you got!",
                "Initializing snake protocol...",
                "Press any direction to begin!"
            ],
            foodCollected: [
                "Nice catch! +10 points!",
                "Nom nom nom! 🍎",
                "Delicious! Keep it up!",
                "Score! That's the way!",
                "Tasty! Your snake grows stronger!"
            ],
            milestone: [
                "LEVEL UP! You're on fire! 🔥",
                "Impressive! Keep that momentum!",
                "You're crushing it!",
                "Achievement unlocked: Snake Master!",
                "Wow! You're a natural!"
            ],
            nearMiss: [
                "Whoa! Close call! 😰",
                "That was TOO close!",
                "Heart rate: ELEVATED",
                "Careful there, champ!",
                "Living on the edge!"
            ],
            danger: [
                "⚠️ Danger zone ahead!",
                "Watch out! Limited space!",
                "Careful! Trap detected!",
                "AI suggests: Change course!",
                "Warning: Dead end approaching!"
            ],
            perfectMove: [
                "Perfect move! 👌",
                "Optimal path! Nice!",
                "AI approved! ✓",
                "Textbook execution!",
                "Exactly what I would do!"
            ],
            encouragement: [
                "You got this!",
                "Stay focused!",
                "Keep going!",
                "Don't give up!",
                "Believe in yourself!"
            ],
            idle: [
                "Still there? The snake awaits!",
                "Your snake is getting hungry...",
                "Time to make a move!",
                "The food isn't going to eat itself!",
                "Psst... try moving!"
            ],
            gameOver: [
                "Game Over! But legends never die!",
                "Ouch! That's gonna leave a mark!",
                "The snake has fallen... Rise again!",
                "GG! Ready for round two?",
                "Not bad! Let's beat that score!"
            ],
            highScore: [
                "🏆 NEW HIGH SCORE! LEGENDARY!",
                "You're the CHAMPION!",
                "History has been made!",
                "Your name echoes through the arcade!",
                "INCREDIBLE! New record!"
            ],
            tip: [
                "💡 Tip: Stay near the center for more options",
                "💡 Tip: Plan 2-3 moves ahead",
                "💡 Tip: Avoid corners when possible",
                "💡 Tip: Watch the AI ghost for hints",
                "💡 Tip: Longer snake = more careful moves"
            ]
        };
    }

    /**
     * Toggle commentator
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Enable commentator
     */
    enable() {
        this.enabled = true;
    }

    /**
     * Disable commentator
     */
    disable() {
        this.enabled = false;
        this.currentMessage = '';
    }

    /**
     * Check if enabled
     */
    isEnabled() {
        return this.enabled;
    }

    /**
     * Add a message to the queue
     */
    queueMessage(message, priority = 'normal') {
        if (!this.enabled) return;

        const msg = {
            text: message,
            priority,
            timestamp: Date.now()
        };

        if (priority === 'high') {
            // High priority messages go to front
            this.messageQueue.unshift(msg);
        } else {
            this.messageQueue.push(msg);
        }

        // Limit queue size
        if (this.messageQueue.length > 5) {
            this.messageQueue = this.messageQueue.slice(0, 5);
        }
    }

    /**
     * Get random comment from category
     */
    getRandomComment(category) {
        const comments = this.comments[category];
        if (!comments || comments.length === 0) return '';
        return comments[Math.floor(Math.random() * comments.length)];
    }

    /**
     * Trigger comment for game start
     */
    onGameStart() {
        this.queueMessage(this.getRandomComment('start'), 'high');
        this.lastScore = 0;
        this.lastLength = 1;
        this.nearMissCount = 0;
        this.perfectMoveStreak = 0;
    }

    /**
     * Trigger comment for food collection
     */
    onFoodCollected(score, length) {
        this.queueMessage(this.getRandomComment('foodCollected'));
        
        // Check for milestones
        if (length % 5 === 0 && length > this.lastLength) {
            setTimeout(() => {
                this.queueMessage(this.getRandomComment('milestone'), 'high');
            }, 500);
        }
        
        // Random tip occasionally
        if (Math.random() < 0.1) {
            setTimeout(() => {
                this.queueMessage(this.getRandomComment('tip'));
            }, 1500);
        }

        this.lastScore = score;
        this.lastLength = length;
    }

    /**
     * Trigger comment for near miss
     */
    onNearMiss() {
        this.nearMissCount++;
        this.queueMessage(this.getRandomComment('nearMiss'), 'high');
        
        // Encouragement after multiple near misses
        if (this.nearMissCount >= 3) {
            setTimeout(() => {
                this.queueMessage(this.getRandomComment('encouragement'));
            }, 1000);
            this.nearMissCount = 0;
        }
    }

    /**
     * Trigger comment for danger detection
     */
    onDangerDetected(dangerLevel) {
        if (dangerLevel >= 60) {
            this.queueMessage(this.getRandomComment('danger'), 'high');
        }
    }

    /**
     * Trigger comment for perfect move (following AI suggestion)
     */
    onPerfectMove() {
        this.perfectMoveStreak++;
        
        if (this.perfectMoveStreak >= 3) {
            this.queueMessage(this.getRandomComment('perfectMove'));
            this.perfectMoveStreak = 0;
        }
    }

    /**
     * Trigger comment for game over
     */
    onGameOver(isHighScore) {
        if (isHighScore) {
            this.queueMessage(this.getRandomComment('highScore'), 'high');
        } else {
            this.queueMessage(this.getRandomComment('gameOver'), 'high');
        }
    }

    /**
     * Update commentator state
     */
    update() {
        if (!this.enabled) return;

        const now = Date.now();

        // Process message queue
        if (now - this.lastMessageTime >= this.displayTime) {
            if (this.messageQueue.length > 0) {
                const msg = this.messageQueue.shift();
                this.currentMessage = msg.text;
                this.lastMessageTime = now;
                
                // Add to history
                this.messageHistory.unshift(msg);
                if (this.messageHistory.length > this.maxHistory) {
                    this.messageHistory.pop();
                }
            } else {
                this.currentMessage = '';
            }
        }
    }

    /**
     * Get current message to display
     */
    getCurrentMessage() {
        return this.currentMessage;
    }

    /**
     * Get message history
     */
    getHistory() {
        return this.messageHistory;
    }

    /**
     * Render commentator message on canvas
     */
    render(ctx, canvasWidth, canvasHeight) {
        if (!this.enabled || !this.currentMessage) return;

        const now = Date.now();
        const elapsed = now - this.lastMessageTime;
        const progress = elapsed / this.displayTime;

        // Fade in/out effect
        let alpha = 1;
        if (progress < 0.1) {
            alpha = progress / 0.1; // Fade in
        } else if (progress > 0.8) {
            alpha = (1 - progress) / 0.2; // Fade out
        }

        // Message box position (top center)
        const boxWidth = Math.min(300, canvasWidth - 40);
        const boxHeight = 36;
        const boxX = (canvasWidth - boxWidth) / 2;
        const boxY = 10;

        // Draw message box background
        ctx.fillStyle = `rgba(0, 0, 0, ${0.8 * alpha})`;
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

        // Draw border with retro glow
        ctx.strokeStyle = `rgba(0, 255, 65, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        // Draw inner glow
        ctx.strokeStyle = `rgba(0, 255, 65, ${0.3 * alpha})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(boxX + 2, boxY + 2, boxWidth - 4, boxHeight - 4);

        // Draw message text
        ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Truncate message if too long
        let displayText = this.currentMessage;
        const maxChars = Math.floor(boxWidth / 8);
        if (displayText.length > maxChars) {
            displayText = displayText.substring(0, maxChars - 3) + '...';
        }
        
        ctx.fillText(displayText, canvasWidth / 2, boxY + boxHeight / 2);

        // Draw AI indicator
        ctx.fillStyle = `rgba(138, 43, 226, ${alpha})`;
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('AI:', boxX + 8, boxY + boxHeight / 2);
    }

    /**
     * Reset commentator state
     */
    reset() {
        this.currentMessage = '';
        this.messageQueue = [];
        this.lastMessageTime = 0;
        this.nearMissCount = 0;
        this.perfectMoveStreak = 0;
    }

    /**
     * Set personality style
     */
    setPersonality(style) {
        this.personality = style;
    }
}
