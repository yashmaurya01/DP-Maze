function flipProbability(epsilon) {
    const p = 0.5 * (1 / epsilon);
    return Math.max(0.05, Math.min(p, 0.5));
}

function applyDpNoiseToLocalView(localView, epsilon) {
    const p = flipProbability(epsilon);
    for (let r = 0; r < localView.length; r++) {
        for (let c = 0; c < localView[r].length; c++) {
            if (Math.random() < p) {
                localView[r][c].wall = !localView[r][c].wall;
            }
        }
    }
    return localView;
}

export { applyDpNoiseToLocalView };
