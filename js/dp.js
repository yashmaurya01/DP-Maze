// Laplace noise for location distance
function laplaceNoise(epsilon) {
    const scale = 1 / epsilon;
    const u = Math.random() - 0.5;
    return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

// Randomized response for map cells (binary):
// Probability(true value) = e^ε/(e^ε+1)
// Probability(flip value) = 1/(e^ε+1)
function applyDpNoiseToLocalView(localView, epsilonMap) {
    const expE = Math.exp(epsilonMap);
    const pTrue = expE / (expE + 1);
    // For each cell, "wall" is a boolean. We'll flip with probability (1-pTrue)
    for (let r = 0; r < localView.length; r++) {
        for (let c = 0; c < localView[r].length; c++) {
            const cell = localView[r][c];
            const flip = (Math.random() > pTrue);
            if (flip) {
                cell.wall = !cell.wall;
            }
        }
    }
    return localView;
}

function noisyDistance(trueDist, epsilonLoc) {
    const noise = laplaceNoise(epsilonLoc);
    const nd = trueDist + noise;
    return Math.max(0, Math.round(nd));
}

export { applyDpNoiseToLocalView, noisyDistance };
