## DP Maze Runner (Game Overview) [Work in Progress]

**Concept:**  
The DP Honeycomb Maze is a 4x4 grid maze game. The player starts at the top row and must navigate to the bottom without falling into water or being caught by guards. Each cell can have up to four doors (up, down, left, right), some may be locked or lead outside (where water is), and two guards roam inside the maze. The twist is that the player can query information about the doors before choosing one, but these queries are answered using Differential Privacy (DP) mechanisms, ensuring uncertainty and preventing exact knowledge of the maze layout.

**Core Idea:**
- The player tries to find a safe path through the maze.
- The player has a limited "privacy budget" (representing DP constraints) and can spend it on queries about the environment.
- Answers to queries are noisy (using DP), balancing information gain and uncertainty.

**Differential Privacy (DP) Integration:**  
The queries about doors are answered using a DP mechanism (randomized response). Higher epsilon per query means less noise (more accurate answers) but also implies you trust the environment more (can guess layout more easily), while the finite budget ensures total privacy cost is bounded.

---

## Gameplay Details

1. **Maze Layout:**
   - A 4x4 grid of cells.
   - Each cell can have up to 4 directions: up, down, left, right.
   - Outside the maze is water. Any door leading outside the boundary is essentially a path to water (loss).
   - Some doors may be locked.

2. **Player and Guards:**
   - The player spawns randomly in the top row.
   - Two guards spawn randomly in the bottom half of the maze.
   - Every time the player makes a move, the guards also move randomly.

3. **Doors:**
   - From the player's perspective, each turn they see four possible directions (A=Up, B=Right, C=Down, D=Left).
   - The player doesn't see if there's water, a guard, or if it's locked by default.

4. **Queries:**
   Before choosing a door, the player can ask:
   - Is there water behind this door? (Binary)
   - Is there a guard behind this door? (Binary)
   - Is this door locked? (Binary)

   Each query consumes privacy budget. The answer is a DP noisy result:
   - Uses randomized response with a chosen epsilon.
   - Higher epsilon = answers more likely to be correct, but it’s a design choice.

5. **Privacy Budget and Difficulty:**
   - Difficulty levels: Easy (40 total budget), Medium (20), Hard (10).
   - Before starting, the player can also choose the query cost per query (how much budget each query consumes) and epsilon per query.
   - Once the budget runs out, no more queries can be made.
   
6. **Movement and Consequences:**
   - If the player chooses a door leading outside (water), they lose immediately.
   - If the player moves into a cell containing a guard or if a guard moves into their cell after their move, they lose.
   - The goal is to navigate down to the bottom row safely (or a defined exit cell if desired).

7. **Winning Condition:**
   - Player reaches the bottom row of the maze without being caught by guards or falling into water.

8. **Restarting the Game:**
   - A restart button allows the player to go back to the initial setup panel, select difficulty again, and tweak query cost and epsilon.

---

## Sensitive Datasets and DP Queries

**Sensitive Data:**
- Maze configuration (which doors lead where, which are locked).
- Guard positions.
- Water positions (implicitly outside the maze boundary).

**DP Queries:**
- Each yes/no query is answered via randomized response:
  - Probability(correct) = e^ε / (e^ε + 1)
  - Probability(flip) = 1 / (e^ε + 1)
- Epsilon per query is set by the user before the game starts.
- Query cost reduces the remaining budget. No budget means no queries.

The DP guarantees ensure the player cannot determine the maze configuration or guard positions with certainty, preserving privacy.

---

## UI and User Flow

1. **Setup Panel:**
   - The player selects difficulty (easy/medium/hard), which sets total budget.
   - Chooses query cost per query via a slider.
   - Chooses epsilon per query (affecting answer accuracy) via another slider.
   - Presses "Start Game" to begin.

2. **Game Panel:**
   - Shows remaining budget.
   - Offers query buttons (Water?, Guard?, Locked?) that apply to the currently selected door direction.
   - Shows four door options (A, B, C, D), mapping to up/right/down/left.
   - Once a door is chosen, the player moves, guards move, and the game updates.
   - If game ends (caught or water), an alert notifies the player.
   - A "Restart" button lets the player return to the setup state.

3. **Collapsible Sections:**
   - Two collapsible panels explain the game and DP mechanics.
   - Provide additional context for team members and players about how DP affects queries.

**Theme:**
- Neon orange and black "hackery" or cyberpunk style theme.
- Buttons, sliders, and text styled to fit the color scheme.

---

## Code Structure

**Directory Layout:**
```
project/
│
├─ index.html
├─ css/
│  └─ styles.css       # Orange/black neon theme styling
└─ js/
   ├─ main.js          # Entry point, UI event handling, game start/stop
   ├─ dp.js            # DP mechanisms (randomized response)
   ├─ queries.js       # Manages budget, epsilon, query logic
   ├─ gameState.js     # Maze, player, guards initialization and movements
   ├─ ui.js            # Collapsible sections and other UI helpers
   └─ ...
```

**Core Files:**
1. **index.html:**  
   - Contains the setup panel (difficulty, sliders) and the game panel.
   - Collapsible sections for documentation.
   - Minimalistic structure with hackBtn class on buttons.

2. **styles.css:**  
   - Defines neon orange (#ff9900) on black background.
   - HackBtn class for buttons, range sliders styled accordingly.
   - Collapsible sections styled for hover and expand/collapse.

3. **main.js:**  
   - Handles DOMContentLoaded event.
   - Wires up event listeners for difficulty selection, sliders, start game, queries, door choices, and restart.
   - Calls `initGame()` from gameState.js and sets parameters in queries.js.
   - Updates UI after each action.

4. **dp.js:**  
   - Exports `randomizedResponse(trueValue, epsilon)` function.
   - Implements DP with randomized response for binary queries.

5. **queries.js:**  
   - Maintains `remainingBudget`, `epsilonPerQuery`, `costPerQuery`.
   - Functions `setBudget()`, `setEpsilon()`.
   - `queryDoorIsWater()`, `queryDoorHasGuard()`, `queryDoorIsLocked()` return DP answers or null if not enough budget.
   - `getRemainingBudget()` for UI updates.

6. **gameState.js:**  
   - `initGame(difficulty)`: Initialize maze, place player and guards.
   - `movePlayer(direction)`: Attempt to move the player.
   - `moveGuards()`: Move guards randomly.
   - `checkGuardsCatchPlayer()`: Check if guards occupy the same cell as player.
   - `doorTrueValues(doorKey)`: Return the real status of the door (water/guard/locked) for query functions.

7. **ui.js:**  
   - `setupCollapsibles()` sets up event listeners on collapsible headers to show/hide content.

---

## Theoretical Guarantees and Motivation

- Each DP query uses a fixed ε, ensuring (ε)-DP for that single query.
- Over multiple queries, total privacy leakage scales with the number of queries times the query cost.
- By limiting total budget and query cost, we ensure a maximum number of queries.
- The player cannot reliably reconstruct the entire maze, as DP ensures some level of uncertainty.
- Epsilon slider allows the player to choose how "confident" the answers are. Higher epsilon reduces noise but does not remove DP guarantees completely.

---

## Summary

In summary, the DP Honeycomb Maze integrates differential privacy into a simple maze navigation game. The player can invest a finite privacy budget into queries about the hidden environment, receiving uncertain (noisy) answers. This design:
- Teaches how DP restricts perfect information even when queries are allowed.
- Makes strategy important: choose how to spend budget and at what accuracy level.
- Demonstrates a full UI flow, from difficulty and parameter selection to a DP-driven, uncertainty-laden gameplay experience.