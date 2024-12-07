export const WIDTH = 4;
export const HEIGHT = 4;
let maze = [];
let playerPos = { x: 0, y: 0 };
let guards = [];

export function initGame(difficulty) {
    // Initialize maze: each cell has doors (up,down,left,right)
    // Outside leads to water
    // Random locked doors
    maze = createMaze();
    playerPos = { x: Math.floor(Math.random() * WIDTH), y: 0 };
    guards = initGuards();
    setDifficultyBudget(difficulty);
}

function createMaze() {
    // Example: all internal doors open, outside is water
    // locked doors randomly assigned
    let m = [];
    for (let y = 0; y < HEIGHT; y++) {
        let row = [];
        for (let x = 0; x < WIDTH; x++) {
            row.push({
                doors: {
                    up: y > 0 ? { locked: false } : { water: true },
                    down: y < HEIGHT - 1 ? { locked: false } : { water: true },
                    left: x > 0 ? { locked: false } : { water: true },
                    right: x < WIDTH - 1 ? { locked: false } : { water: true }
                }
            });
        }
        m.push(row);
    }
    // Randomly lock some doors or randomize further as needed
    return m;
}

function initGuards() {
    // Place two guards in bottom half randomly
    let positions = [];
    for (let i = 0; i < 2; i++) {
        positions.push({
            x: Math.floor(Math.random() * WIDTH),
            y: 2 + Math.floor(Math.random() * 2)
        });
    }
    return positions;
}

export function getDoorsForPlayer() {
    // Player sees 4 doors: Up=A, Right=B, Down=C, Left=D
    // Return states from maze[playerPos.y][playerPos.x].doors
    let cell = maze[playerPos.y][playerPos.x];
    return cell.doors;
}

export function movePlayer(direction) {
    // direction in {up,down,left,right}
    let cell = maze[playerPos.y][playerPos.x];
    let door = cell.doors[direction];
    // If door.water -> game over
    // If door.locked -> if player tries anyway, must be noised check?
    // Actually opening the door leads player to the next cell if not water
    if (door.water) {
        return { gameOver: true, reason: 'water' };
    }
    if (door.locked) {
        // player moves or not? For simplicity, locked means can’t move through
        // In a DP scenario, we never confirm truly locked?
        // Let's assume door state known after chosen (no queries = risk)
        return { gameOver: true, reason: 'lockedDoor' };
    }

    // Compute new pos
    let nx = playerPos.x;
    let ny = playerPos.y;
    if (direction === 'up') ny--;
    if (direction === 'down') ny++;
    if (direction === 'left') nx--;
    if (direction === 'right') nx++;

    playerPos = { x: nx, y: ny };

    return { gameOver: false };
}

export function moveGuards() {
    // For each guard, pick a random direction and move if possible
    for (let g of guards) {
        let dirs = ['up', 'down', 'left', 'right'];
        let chosen = dirs[Math.floor(Math.random() * 4)];
        let nx = g.x;
        let ny = g.y;
        if (chosen === 'up' && ny > 0) ny--;
        if (chosen === 'down' && ny < HEIGHT - 1) ny++;
        if (chosen === 'left' && nx > 0) nx--;
        if (chosen === 'right' && nx < WIDTH - 1) nx++;
        g.x = nx; g.y = ny;
    }
}

export function checkGuardsCatchPlayer() {
    // If any guard at playerPos -> caught
    for (let g of guards) {
        if (g.x === playerPos.x && g.y === playerPos.y) {
            return true;
        }
    }
    return false;
}

export function doorTrueValues(doorKey) {
    // Return real facts: is water? is guard? locked?
    // doorKey in {up,down,left,right}
    const cell = maze[playerPos.y][playerPos.x];
    const d = cell.doors[doorKey];

    // water behind this door if d.water = true
    let water = !!d.water;

    // guard behind door if at adjacent cell a guard exists
    let nx = playerPos.x, ny = playerPos.y;
    if (doorKey === 'up') ny--;
    if (doorKey === 'down') ny++;
    if (doorKey === 'left') nx--;
    if (doorKey === 'right') nx++;
    let guardThere = guards.some(g => g.x === nx && g.y === ny);

    let locked = !!d.locked;

    return { water, guard: guardThere, locked };
}
