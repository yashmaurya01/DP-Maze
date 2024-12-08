import { initGame, movePlayer, moveGuards, checkGuardsCatchPlayer, doorTrueValues } from './gameState.js';
import { setBudget, setEpsilon, queryDoorIsWater, queryDoorHasGuard, queryDoorIsLocked, getRemainingBudget } from './queries.js';
import { setupCollapsibles } from './ui.js';
import { playQuerySound, playErrorSound } from './audio.js';

let chosenDoorKey = null;
let gameStarted = false;
let selectedDifficulty = null;

document.addEventListener('DOMContentLoaded', () => {
    setupCollapsibles();

    // const epsilonSlider = document.getElementById('epsilonSlider');
    // const epsilonValue = document.getElementById('epsilonValue');
    // epsilonSlider.addEventListener('input', () => {
    //     epsilonValue.textContent = epsilonSlider.value;
    // });

    // Difficulty buttons
    document.querySelectorAll('button[data-difficulty]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('button[data-difficulty]').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedDifficulty = btn.getAttribute('data-difficulty');
        });
    });

    document.getElementById('startGameBtn').addEventListener('click', startGame);

    document.getElementById('queryWaterBtn').addEventListener('click', () => {
        if (!gameStarted || !chosenDoorKey) {
            playErrorSound();
            updateQueryResult("Please select a door first!");
            return;
        }
        playQuerySound();
        let { water } = doorTrueValues(chosenDoorKey);
        let ans = queryDoorIsWater(water);
        if (ans === null) {
            updateQueryResult("No more budget for queries!");
        } else {
            updateQueryResult(`Water query result: ${ans ? "Yes" : "No"}`);
        }
        renderUI();
    });

    document.getElementById('queryGuardBtn').addEventListener('click', () => {
        if (!gameStarted || !chosenDoorKey) {
            playErrorSound();
            updateQueryResult("Please select a door first!");
            return;
        }
        playQuerySound();
        let { guard } = doorTrueValues(chosenDoorKey);
        let ans = queryDoorHasGuard(guard);
        if (ans === null) {
            updateQueryResult("No more budget for queries!");
        } else {
            updateQueryResult(`Guard query result: ${ans ? "Yes" : "No"}`);
        }
        renderUI();
    });

    document.getElementById('queryLockedBtn').addEventListener('click', () => {
        if (!gameStarted || !chosenDoorKey) {
            playErrorSound();
            updateQueryResult("Please select a door first!");
            return;
        }
        playQuerySound();
        let { locked } = doorTrueValues(chosenDoorKey);
        let ans = queryDoorIsLocked(locked);
        if (ans === null) {
            updateQueryResult("No more budget for queries!");
        } else {
            updateQueryResult(`Locked query result: ${ans ? "Yes" : "No"}`);
        }
        renderUI();
    });

    // Door selection buttons:
    setupDoorListeners();

    // Restart button
    document.getElementById('restartBtn').addEventListener('click', () => {
        window.location.reload();
    });

    document.querySelectorAll('.door').forEach(door => {
        door.addEventListener('dblclick', () => {
            if (!gameStarted) return;

            // Get the direction from the door's ID
            const direction = door.id.replace('door', '').toLowerCase();
            chooseDoor(direction);
        });
    });

    document.getElementById('waterEpsilon').addEventListener('input', (e) => {
        setWaterEpsilon(parseFloat(e.target.value));
        e.target.nextElementSibling.textContent = `ε: ${e.target.value}`;
    });

    document.getElementById('guardEpsilon').addEventListener('input', (e) => {
        setGuardEpsilon(parseFloat(e.target.value));
        e.target.nextElementSibling.textContent = `ε: ${e.target.value}`;
    });

    document.getElementById('lockedEpsilon').addEventListener('input', (e) => {
        setLockedEpsilon(parseFloat(e.target.value));
        e.target.nextElementSibling.textContent = `ε: ${e.target.value}`;
    });
});

function startGame() {
    if (!selectedDifficulty) {
        alert("Please select a difficulty!");
        return;
    }

    let totalBudget = (selectedDifficulty === 'easy') ? 40 :
        (selectedDifficulty === 'medium') ? 20 : 10;

    setBudget(totalBudget);
    setEpsilon(0.5); // Set default epsilon
    initGame(selectedDifficulty);

    // Hide setup panel and show game panel
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

    if (result.reason === 'lockedDoor') {
        alert("This door is locked! You cannot move through it.");
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

function setupDoorListeners() {
    const doors = {
        'doorUp': 'up',
        'doorRight': 'right',
        'doorDown': 'down',
        'doorLeft': 'left'
    };

    Object.entries(doors).forEach(([doorId, direction]) => {
        document.getElementById(doorId).addEventListener('click', () => {
            // Remove selected class from all doors
            document.querySelectorAll('.door').forEach(d => d.classList.remove('selected'));

            // Add selected class to clicked door
            document.getElementById(doorId).classList.add('selected');

            // Set the chosen door for queries
            chosenDoorKey = direction;
        });
    });
}

function updateQueryResult(message) {
    const resultDiv = document.getElementById('queryResult');
    resultDiv.textContent = message;
    resultDiv.style.animation = 'none';
    resultDiv.offsetHeight; // Trigger reflow
    resultDiv.style.animation = 'fadeIn 0.3s ease-in';
}
