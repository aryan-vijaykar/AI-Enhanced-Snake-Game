# AI-Enhanced Snake Game 🐍🤖

**Kiro Heroes Challenge Week 4: "Retro Revival"**

A classic Snake game recreated with modern AI enhancements, built using Kiro's spec-driven development approach to manage complex gameplay logic, adaptive difficulty, and intelligent player assistance.

## 🎮 Live Demo

Open `index.html` in your web browser to play the game!

## 🚀 Features

### Classic Snake Gameplay
- Smooth snake movement with arrow keys or WASD
- Food collection and snake growth
- Collision detection with walls and self
- Score tracking and high score persistence

### 🤖 AI Enhancements
- **Smart Pathfinding**: A* algorithm calculates optimal routes to food
- **Visual Hints**: Toggle AI assistance to see recommended paths (Press H)
- **Adaptive Difficulty**: Game speed adjusts based on your performance
- **Safe Move Suggestions**: AI suggests safe moves when no direct path exists

### 🎨 Retro Styling
- Pixel-perfect retro aesthetics
- Classic green-on-black terminal theme
- Smooth animations with retro feel
- Nostalgic game over screens

## 🛠️ Built with Kiro

This project demonstrates Kiro's power for complex logic development through:

### Spec-Driven Development
- **Requirements Analysis**: 26 detailed EARS-compliant requirements
- **Design Documentation**: Complete architecture with correctness properties
- **Task Planning**: Systematic implementation roadmap
- **Property-Based Testing**: Automated validation of game logic

### Key Files
- `.kiro/specs/ai-snake-game/requirements.md` - Formal requirements specification
- `.kiro/specs/ai-snake-game/design.md` - Complete system design
- `.kiro/specs/ai-snake-game/tasks.md` - Implementation task breakdown

## 🏗️ Architecture

```
js/
├── entities/          # Game objects
│   ├── Snake.js      # Snake logic and movement
│   ├── Food.js       # Food spawning and collection
│   └── GameBoard.js  # Game board management
├── ai/               # AI systems
│   ├── PathfindingEngine.js  # A* pathfinding algorithm
│   ├── HintSystem.js         # Visual hint management
│   └── DifficultyManager.js  # Adaptive difficulty
├── game/             # Core game systems
│   ├── GameEngine.js # Main game loop and state
│   └── InputManager.js # Keyboard input handling
└── ui/               # User interface
    └── UIManager.js  # Score, stats, and persistence
```

## 🧪 Testing

### Property-Based Testing
- **Snake Movement Property**: Validates correct directional movement (100+ test cases)
- **Requirements Validation**: All 26 requirements verified
- **Integration Testing**: Complete system verification

### Test Files
- `js/entities/Snake.property.test.js` - Property-based tests
- `test-*.html` - Browser-based test runners
- `verify-*.js` - Verification scripts

## 🎯 AI Implementation Highlights

### 1. Pathfinding Engine
```javascript
// A* algorithm for optimal path calculation
findPath(start, goal, obstacles) {
    // Implements A* with Manhattan distance heuristic
    // Returns shortest safe path to food
}
```

### 2. Adaptive Difficulty
```javascript
// Performance-based speed adjustment
adjustDifficulty(gameStats) {
    // Monitors success rate and survival time
    // Dynamically adjusts game speed
}
```

### 3. Smart Hints
```javascript
// Visual pathfinding assistance
displayHints(path) {
    // Shows optimal route on game board
    // Toggleable AI assistance
}
```

## 🎮 Controls

- **Arrow Keys / WASD**: Move snake
- **P**: Pause/Resume
- **R**: Restart game
- **H**: Toggle AI hints
- **T**: Toggle live stats
- **F1**: Help screen

## 📊 Game Statistics

- Real-time score and length display
- High score persistence (localStorage)
- Survival time tracking
- Performance analytics for difficulty adjustment

## 🏆 Kiro Development Process

### 1. Requirements Gathering
- Used EARS (Easy Approach to Requirements Syntax)
- 26 detailed acceptance criteria
- Complete glossary of terms

### 2. Design Phase
- Architecture planning with component interfaces
- 7 correctness properties defined
- Error handling and testing strategy

### 3. Implementation
- Task-driven development (15 main tasks)
- Property-based testing integration
- Systematic component building

### 4. Validation
- All requirements traced to implementation
- Property tests verify correctness
- Integration testing ensures system cohesion

## 🚀 Getting Started

1. Clone this repository
2. Open `index.html` in a web browser
3. Use arrow keys to control the snake
4. Press H to toggle AI hints
5. Try to beat your high score!

## 📝 Development Blog

Read the complete development story on [AWS Builder Center](your-blog-link-here) covering:
- Problem analysis and solution design
- How Kiro accelerated development
- AI implementation details
- Lessons learned from spec-driven development

## 🏅 Challenge Submission

This project is submitted for the **Kiro Heroes Challenge Week 4: "Retro Revival"**
- **Challenge**: Recreate a classic game with modern AI twist
- **Innovation**: AI pathfinding and adaptive difficulty
- **Technology**: Spec-driven development with Kiro

---

**Built with ❤️ using Kiro for the AI for Bharat Challenge**