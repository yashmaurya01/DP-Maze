import { generateMaze } from './maze.js';
import { showHelp } from './ui.js';
import { applyDpNoiseToLocalView } from './dp.js';

document.addEventListener('DOMContentLoaded', () => {
    const epsilonSlider = document.getElementById('epsilonSlider');
    const epsilonValue = document.getElementById('epsilonValue');
    const refreshViewButton = document.getElementById('refreshViewButton');
    const helpButton = document.getElementById('helpButton');
    const restartButton = document.getElementById('restartButton');
    const totalBudgetSpan = document.getElementById('totalBudget');

    const upButton = document.getElementById('upButton');
    const downButton = document.getElementById('downButton');
    const leftButton = document.getElementById('leftButton');
    const rightButton = document.getElementById('rightButton');
    const confirmMoveButton = document.getElementById('confirmMoveButton');

    const playerPositionSpan = document.getElementById('playerPosition');
    const distanceToGoalSpan = document.getElementById('distanceToGoal');
    const proposedMoveLine = document.getElementById('proposedMoveLine');
    const proposedMoveSpan = document.getElementById('proposedMove');

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const MAZE_COLS = 50;
    const MAZE_ROWS = 50;
    const VISIBLE_SIZE = 5;
    const GOAL_X = 49;
    const GOAL_Y = 49;

    let epsilon = parseFloat(epsilonSlider.value);
    let totalBudget = 50;

    let maze = generateMaze(MAZE_COLS, MAZE_ROWS);

    // Player state
    let playerX = 0;
    let playerY = 0;

    // Proposed move
    let proposedX = playerX;
    let proposedY = playerY;

    let localView = null;

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cellSize = Math.min(canvas.width / VISIBLE_SIZE, canvas.height / VISIBLE_SIZE);

        if (localView) {
            for (let r = 0; r < VISIBLE_SIZE; r++) {
                for (let c = 0; c < VISIBLE_SIZE; c++) {
                    const cell = localView[r][c];
                    const x = c * cellSize;
                    const y = r * cellSize;

                    ctx.fillStyle = cell.wall ? '#000' : '#fff';
                    ctx.fillRect(x, y, cellSize, cellSize);
                }
            }

            // Draw grid lines
            ctx.strokeStyle = 'rgba(0,255,127,0.1)';
            for (let i = 0; i <= VISIBLE_SIZE; i++) {
                ctx.beginPath();
                ctx.moveTo(i * cellSize, 0);
                ctx.lineTo(i * cellSize, VISIBLE_SIZE * cellSize);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(0, i * cellSize);
                ctx.lineTo(VISIBLE_SIZE * cellSize, i * cellSize);
                ctx.stroke();
            }

            // Player at center cell
            const centerX = Math.floor(VISIBLE_SIZE / 2);
            const centerY = Math.floor(VISIBLE_SIZE / 2);
            const px = centerX * cellSize;
            const py = centerY * cellSize;
            ctx.fillStyle = '#0f0';
            ctx.beginPath();
            ctx.arc(px + cellSize / 2, py + cellSize / 2, cellSize / 4, 0, 2 * Math.PI);
            ctx.fill();
        }

        // Check win condition
        if (playerX === GOAL_X && playerY === GOAL_Y) {
            alert("Congratulations! You've reached the end of the maze!");
        }
    }

    function refreshLocalView() {
        if (totalBudget <= 0) {
            alert("You have no more budget to refresh the view.");
            return;
        }

        // Subtract epsilon from budget
        totalBudget -= epsilon;
        if (totalBudget < 0) {
            totalBudget = 0; // No negative budget
        }

        const half = Math.floor(VISIBLE_SIZE / 2);
        let startX = playerX - half;
        let startY = playerY - half;

        // Clamp the 5x5 area
        if (startX < 0) startX = 0;
        if (startX > MAZE_COLS - VISIBLE_SIZE) startX = MAZE_COLS - VISIBLE_SIZE;
        if (startY < 0) startY = 0;
        if (startY > MAZE_ROWS - VISIBLE_SIZE) startY = MAZE_ROWS - VISIBLE_SIZE;

        const subMaze = [];
        for (let rr = 0; rr < VISIBLE_SIZE; rr++) {
            const rowArr = [];
            for (let cc = 0; cc < VISIBLE_SIZE; cc++) {
                rowArr.push({ wall: maze[startY + rr][startX + cc].wall });
            }
            subMaze.push(rowArr);
        }

        let noisyView = applyDpNoiseToLocalView(subMaze, epsilon);

        // Center is player's position, ensure it's walkable
        const centerX = Math.floor(VISIBLE_SIZE / 2);
        const centerY = Math.floor(VISIBLE_SIZE / 2);
        noisyView[centerY][centerX].wall = false;

        localView = noisyView;
        updateUI();
        draw();
    }

    function proposeMove(dx, dy) {
        const newX = playerX + dx;
        const newY = playerY + dy;
        proposedX = newX;
        proposedY = newY;
        updateUI(); // Update UI to show proposed move
    }

    function confirmMove() {
        // Finalize proposed move if it's valid
        if (proposedX < 0 || proposedX >= MAZE_COLS || proposedY < 0 || proposedY >= MAZE_ROWS) {
            alert("Can't move out of bounds!");
            return;
        }
        if (!maze[proposedY][proposedX].wall) {
            playerX = proposedX;
            playerY = proposedY;
            // Once confirmed, proposed move line should vanish
            proposedX = playerX;
            proposedY = playerY;
            updateUI();
            draw();
        } else {
            alert("That direction is blocked by a wall!");
        }
    }

    function updateUI() {
        // Update epsilon display
        epsilonValue.textContent = epsilon.toFixed(1);

        // Update budget display
        totalBudgetSpan.textContent = Math.round(totalBudget * 100) / 100;

        // Update player position & distance
        playerPositionSpan.textContent = `(${playerX},${playerY})`;
        const dist = Math.abs(GOAL_X - playerX) + Math.abs(GOAL_Y - playerY);
        distanceToGoalSpan.textContent = dist.toString();

        // Update proposed move display
        if (proposedX !== playerX || proposedY !== playerY) {
            proposedMoveSpan.textContent = `(${proposedX},${proposedY})`;
            proposedMoveLine.style.display = 'block';
        } else {
            // No pending proposed move different from current position
            proposedMoveLine.style.display = 'none';
        }
    }

    function restartGame() {
        maze = generateMaze(MAZE_COLS, MAZE_ROWS);
        playerX = 0;
        playerY = 0;
        proposedX = 0;
        proposedY = 0;
        totalBudget = 50;
        epsilon = parseFloat(epsilonSlider.value);
        updateUI();
        refreshLocalView();
    }

    // Event Listeners
    epsilonSlider.addEventListener('input', () => {
        epsilon = parseFloat(epsilonSlider.value);
        updateUI();
    });

    refreshViewButton.addEventListener('click', () => {
        if (totalBudget > 0) {
            refreshLocalView();
        } else {
            alert("No more budget available!");
        }
    });

    helpButton.addEventListener('click', showHelp);

    restartButton.addEventListener('click', restartGame);

    upButton.addEventListener('click', () => proposeMove(0, -1));
    downButton.addEventListener('click', () => proposeMove(0, 1));
    leftButton.addEventListener('click', () => proposeMove(-1, 0));
    rightButton.addEventListener('click', () => proposeMove(1, 0));

    confirmMoveButton.addEventListener('click', () => confirmMove());

    // Initial setup
    updateUI();
    refreshLocalView(); // initial view
});
