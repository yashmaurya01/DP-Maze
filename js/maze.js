import { drawNoisyLine } from './dp.js';

function generateMaze(cols, rows) {
    const maze = [];
    for (let r = 0; r < rows; r++) {
        const rowArr = [];
        for (let c = 0; c < cols; c++) {
            rowArr.push({
                x: c,
                y: r,
                walls: { top: true, right: true, bottom: true, left: true },
                visited: false
            });
        }
        maze.push(rowArr);
    }

    const stack = [];
    const startCell = maze[0][0];
    startCell.visited = true;
    stack.push(startCell);

    while (stack.length > 0) {
        const current = stack.pop();
        const neighbors = getUnvisitedNeighbors(current, maze);
        if (neighbors.length > 0) {
            stack.push(current);
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            removeWalls(current, next);
            next.visited = true;
            stack.push(next);
        }
    }

    return maze;
}

function getUnvisitedNeighbors(cell, maze) {
    const { x, y } = cell;
    const neighbors = [];
    const rows = maze.length;
    const cols = maze[0].length;

    if (y > 0 && !maze[y - 1][x].visited) neighbors.push(maze[y - 1][x]);
    if (x < cols - 1 && !maze[y][x + 1].visited) neighbors.push(maze[y][x + 1]);
    if (y < rows - 1 && !maze[y + 1][x].visited) neighbors.push(maze[y + 1][x]);
    if (x > 0 && !maze[y][x - 1].visited) neighbors.push(maze[y][x - 1]);

    return neighbors;
}

function removeWalls(a, b) {
    if (a.x === b.x && a.y === b.y + 1) {
        a.walls.top = false; b.walls.bottom = false;
    } else if (a.x === b.x && a.y === b.y - 1) {
        a.walls.bottom = false; b.walls.top = false;
    } else if (a.y === b.y && a.x === b.x + 1) {
        a.walls.left = false; b.walls.right = false;
    } else if (a.y === b.y && a.x === b.x - 1) {
        a.walls.right = false; b.walls.left = false;
    }
}

function drawMaze(ctx, maze, epsilon) {
    const cols = maze[0].length;
    const rows = maze.length;
    const cellSize = Math.min(ctx.canvas.width / cols, ctx.canvas.height / rows);
    const noiseScale = 1 / epsilon;

    ctx.lineWidth = 2;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const cell = maze[r][c];
            const x = c * cellSize;
            const y = r * cellSize;

            if (cell.walls.top) {
                drawNoisyLine(ctx, x, y, x + cellSize, y, noiseScale);
            }
            if (cell.walls.right) {
                drawNoisyLine(ctx, x + cellSize, y, x + cellSize, y + cellSize, noiseScale);
            }
            if (cell.walls.bottom) {
                drawNoisyLine(ctx, x, y + cellSize, x + cellSize, y + cellSize, noiseScale);
            }
            if (cell.walls.left) {
                drawNoisyLine(ctx, x, y, x, y + cellSize, noiseScale);
            }
        }
    }

    // Draw start
    ctx.fillStyle = "blue";
    ctx.beginPath();
    ctx.arc(cellSize / 2, cellSize / 2, cellSize / 5, 0, 2 * Math.PI);
    ctx.fill();

    // Draw goal
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.arc(cols * cellSize - cellSize / 2, rows * cellSize - cellSize / 2, cellSize / 5, 0, 2 * Math.PI);
    ctx.fill();
}

export { generateMaze, drawMaze };
