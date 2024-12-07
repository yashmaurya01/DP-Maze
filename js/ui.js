function showHelp() {
    alert(
        `Use the arrow buttons to propose a move.
Then click "Confirm Move" to finalize it.

Adjust epsilon (0.1 to 10):
- Lower epsilon = more noise (less accurate map)
- Higher epsilon = clearer map

Each refresh costs 'epsilon' from your total budget (starting at 50).
Try to reach (49,49)!`
    );
}

export { showHelp };
