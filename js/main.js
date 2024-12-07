import { generateMaze, drawMaze } from './maze.js';
import { showHelp } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const epsilonSlider = document.getElementById('epsilonSlider');
    const epsilonValue = document.getElementById('epsilonValue');
    const resetButton = document.getElementById('resetButton');
    const helpButton = document.getElementById('helpButton');
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    let epsilon = parseFloat(epsilonSlider.value);
    let mazeData = generateMaze(20, 20);

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMaze(ctx, mazeData, epsilon);
    }

    epsilonSlider.addEventListener('input', () => {
        epsilon = parseFloat(epsilonSlider.value);
        epsilonValue.textContent = epsilon.toFixed(1);
        draw();
    });

    resetButton.addEventListener('click', () => {
        mazeData = generateMaze(20, 20);
        draw();
    });

    helpButton.addEventListener('click', () => {
        showHelp();
    });

    // Initial draw
    draw();
});
