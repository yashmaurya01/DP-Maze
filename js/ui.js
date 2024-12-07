function showHelp() {
    alert(
        `Use arrow buttons to propose a move.
Click [Confirm Move] to finalize it.

[Refresh View] spends (Map Epsilon + Location Epsilon) budget.
This returns a DP-based local map (via randomized response) and a noisy distance (via Laplace).

Adjust epsilons for clarity vs. budget.
Reach (49,49)!`
    );
}

function setupCollapsibles() {
    const headers = document.querySelectorAll('.collapsibleHeader');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            if (content.style.display === 'none') {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        });
    });
}

export { showHelp, setupCollapsibles };
