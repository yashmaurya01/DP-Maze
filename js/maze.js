function generateMaze(cols, rows) {
    // Create a 2D array of cells, each cell is {wall: boolean}
    // Start with all walls
    const maze = [];
    for (let r = 0; r < rows; r++) {
        const rowArr = [];
        for (let c = 0; c < cols; c++) {
            rowArr.push({ wall: true });
        }
        maze.push(rowArr);
    }

    // Directions for carving: up, right, down, left
    const directions = [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0]
    ];

    // A helper function to get neighbors that are within bounds and are walls
    function getWallNeighbors(x, y) {
        const neighbors = [];
        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                if (maze[ny][nx].wall) {
                    neighbors.push([nx, ny]);
                }
            }
        }
        return neighbors;
    }

    // Carve out the maze using DFS
    // Start at (0,0)
    maze[0][0].wall = false;
    const stack = [[0, 0]];

    while (stack.length > 0) {
        const [x, y] = stack[stack.length - 1];
        const neighbors = getWallNeighbors(x, y);

        if (neighbors.length > 0) {
            // Choose a random wall neighbor
            const [nx, ny] = neighbors[Math.floor(Math.random() * neighbors.length)];
            // Carve it
            maze[ny][nx].wall = false;
            stack.push([nx, ny]);
        } else {
            // Backtrack
            stack.pop();
        }
    }

    // At this point, we have a perfect maze with a guaranteed path from (0,0) to (cols-1, rows-1).
    // (0,0) and (cols-1, rows-1) are already open due to carving. 
    // Optionally ensure end is open (but it should be from carving):
    maze[rows - 1][cols - 1].wall = false;

    return maze;
}

export { generateMaze };
