function generateMaze(cols, rows) {
    const maze = [];
    for (let r = 0; r < rows; r++) {
        const rowArr = [];
        for (let c = 0; c < cols; c++) {
            rowArr.push({
                wall: Math.random() < 0.3
            });
        }
        maze.push(rowArr);
    }

    // Ensure start and end are open
    maze[0][0].wall = false;
    maze[rows - 1][cols - 1].wall = false;

    return maze;
}

export { generateMaze };
