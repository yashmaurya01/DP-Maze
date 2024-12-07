import { initGame, movePlayer, moveGuards, checkGuardsCatchPlayer, doorTrueValues } from './gameState.js';
import { setBudget, setQueryCost, setEpsilon, queryDoorIsWater, queryDoorHasGuard, queryDoorIsLocked, getRemainingBudget } from './queries.js';
import { setupCollapsibles } from './ui.js';

let chosenDoorKey = null;
let gameStarted = false;

document.addEventListener('DOMContentLoaded', () => {
    setupCollapsibles();

    const queryCostSlider = document.getElementById('queryCostSlider');
    const queryCostValue = document.getElementById('queryCostValue');
    queryCostSlider.addEventListener('input', () => {
        queryCostValue.textContent = queryCostSlider.value;
    });

    const epsilonSlider = document.getElementById('epsilonSlider');
    const epsilonValue = document.getElementById('epsilonValue');
    epsilonSlider.addEventListener('input', () => {
        epsilonValue.textContent = epsilonSlider.value;
    });

    // Difficulty buttons
    document.querySelectorAll('button[data-difficulty]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('button[data-difficulty]').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
        });
    });

    document.getElementById('startGameBtn').addEventListener('click', startGame);

    document.getElementById('queryWaterBtn').addEventListener('click', () => {
        if (!gameStarted || !chosenDoorKey) return;
        let { water } = doorTrueValues(chosenDoorKey);
        let ans = queryDoorIsWater(water);
        if (ans === null) alert("No more budget for queries!");
        else alert(ans ? "Yes" : "No");
        renderUI();
    });

    document.getElementById('queryGuardBtn').addEventListener('click', () => {
        if (!gameStarted || !chosenDoorKey) return;
        let { guard } = doorTrueValues(chosenDoorKey);
        let ans = queryDoorHasGuard(guard);
        if (ans === null) alert("No more budget!");
        else alert(ans ? "Yes" : "No");
        renderUI();
    });

    document.getElementById('queryLockedBtn').addEventListener('click', () => {
        if (!gameStarted || !chosenDoorKey) return;
        let { locked } = doorTrueValues(chosenDoorKey);
        let ans = queryDoorIsLocked(locked);
        if (ans === null) alert("No more budget!");
        else alert(ans ? "Yes" : "No");
        renderUI();
    });

    // Door selection buttons:
    document.getElementById('doorA').addEventListener('click', () => chooseDoor('up'));
    document.getElementById('doorB').addEventListener('click', () => chooseDoor('right'));
    document.getElementById('doorC').addEventListener('click', () => chooseDoor('down'));
    document.getElementById('doorD').addEventListener('click', () => chooseDoor('left'));

    // Restart button
    document.getElementById('restartBtn').addEventListener('click', () => {
        window.location.reload();
    });
});

function startGame() {
    const diffBtn = document.querySelector('button[data-difficulty].selected');
    if (!diffBtn) {
        alert("Please select a difficulty!");
        return;
    }
    let difficulty = diffBtn.getAttribute('data-difficulty');
    let totalBudget = (difficulty === 'easy') ? 40 : (difficulty === 'medium') ? 20 : 10;

    let queryCost = parseInt(document.getElementById('queryCostSlider').value, 10);
    let epsilon = parseFloat(document.getElementById('epsilonSlider').value);

    setBudget(totalBudget);
    setQueryCost(queryCost);
    setEpsilon(epsilon);
    initGame(difficulty);

    document.getElementById('setupPanel').style.display = 'none';
    document.getElementById('gamePanel').style.display = 'block';
    gameStarted = true;
    renderUI();
}

function chooseDoor(dir) {
    if (!gameStarted) return;
    chosenDoorKey = dir;
    let result = movePlayer(dir);
    if (result.gameOver) {
        alert("Game Over: " + result.reason);
        return;
    }
    moveGuards();
    if (checkGuardsCatchPlayer()) {
        alert("Caught by guards! Game Over!");
        return;
    }
    chosenDoorKey = null;
    renderUI();
}

function renderUI() {
    if (!gameStarted) return;
    document.getElementById('budgetDisplay').innerText = getRemainingBudget();
}
