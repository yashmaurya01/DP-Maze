import { generateMaze } from './maze.js';
import { showHelp, setupCollapsibles } from './ui.js';
import { applyDpNoiseToLocalView, noisyDistance } from './dp.js';

document.addEventListener('DOMContentLoaded', () => {
    const mapEpsilonSlider = document.getElementById('mapEpsilonSlider');
    const mapEpsilonValue = document.getElementById('mapEpsilonValue');
    const locEpsilonSlider = document.getElementById('locEpsilonSlider');
    const locEpsilonValue = document.getElementById('locEpsilonValue');

    const refreshViewButton = document.getElementById('refreshViewButton');
    const helpButton = document.getElementById('helpButton');
    const restartButton = document.getElementById('restartButton');

    const upButton = document.getElementById('upButton');
    const downButton = document.getElementById('downButton');
    const leftButton = document.getElementById('leftButton');
    const rightButton = document.getElementById('rightButton');
    const confirmMoveButton = document.getElementById('confirmMoveButton');

    const totalBudgetSpan = document.getElementById('totalBudget');
    const noisyDistanceSpan = document.getElementById('noisyDistance');

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const MAZE_COLS = 50;
    const MAZE_ROWS = 50;
    const VISIBLE_SIZE = 5;
    const GOAL_X = 49;
    const GOAL_Y = 49;

    let epsilonMap = parseFloat(mapEpsilonSlider.value);
    let epsilonLoc = parseFloat(locEpsilonSlider.value);
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

            // Grid lines
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
        const cost = epsilonMap + epsilonLoc;
        if (totalBudget <= 0 || totalBudget < cost) {
            alert("Not enough budget to refresh the view.");
            return;
        }

        totalBudget -= cost;
        if (totalBudget < 0) totalBudget = 0;

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

        let noisyView = applyDpNoiseToLocalView(subMaze, epsilonMap);
        // Ensure player's position cell is walkable
        const centerX = Math.floor(VISIBLE_SIZE / 2);
        const centerY = Math.floor(VISIBLE_SIZE / 2);
        noisyView[centerY][centerX].wall = false;
        localView = noisyView;

        // Compute real distance and add Laplace noise
        const trueDist = Math.abs(GOAL_X - playerX) + Math.abs(GOAL_Y - playerY);
        const dpDist = noisyDistance(trueDist, epsilonLoc);
        noisyDistanceSpan.textContent = dpDist.toString();

        updateUI();
        draw();
    }

    function proposeMove(dx, dy) {
        proposedX = playerX + dx;
        proposedY = playerY + dy;
    }

    function confirmMove() {
        if (proposedX < 0 || proposedX >= MAZE_COLS || proposedY < 0 || proposedY >= MAZE_ROWS) {
            alert("Can't move out of bounds!");
            return;
        }
        if (!maze[proposedY][proposedX].wall) {
            playerX = proposedX;
            playerY = proposedY;
        } else {
            alert("That direction is blocked by a wall!");
        }

        // After confirming move, redraw and update UI
        draw();
        updateUI();
    }

    function movePlayer(dx, dy) {
        proposeMove(dx, dy);
    }

    function updateUI() {
        mapEpsilonValue.textContent = epsilonMap.toFixed(1);
        locEpsilonValue.textContent = epsilonLoc.toFixed(1);
        totalBudgetSpan.textContent = Math.round(totalBudget * 100) / 100;
    }

    function restartGame() {
        maze = generateMaze(MAZE_COLS, MAZE_ROWS);
        playerX = 0;
        playerY = 0;
        proposedX = playerX;
        proposedY = playerY;
        totalBudget = 50;
        epsilonMap = parseFloat(mapEpsilonSlider.value);
        epsilonLoc = parseFloat(locEpsilonSlider.value);
        noisyDistanceSpan.textContent = "...";
        updateUI();
        refreshLocalView();
    }

    // Event Listeners
    mapEpsilonSlider.addEventListener('input', () => {
        epsilonMap = parseFloat(mapEpsilonSlider.value);
        updateUI();
    });

    locEpsilonSlider.addEventListener('input', () => {
        epsilonLoc = parseFloat(locEpsilonSlider.value);
        updateUI();
    });

    refreshViewButton.addEventListener('click', () => {
        refreshLocalView();
    });

    helpButton.addEventListener('click', showHelp);

    restartButton.addEventListener('click', restartGame);

    upButton.addEventListener('click', () => movePlayer(0, -1));
    downButton.addEventListener('click', () => movePlayer(0, 1));
    leftButton.addEventListener('click', () => movePlayer(-1, 0));
    rightButton.addEventListener('click', () => movePlayer(1, 0));

    confirmMoveButton.addEventListener('click', () => confirmMove());

    // Initial setup
    updateUI();
    refreshLocalView();
    setupCollapsibles();
    draw(); // Initial draw just in case
});
