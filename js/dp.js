// DP noise functions

function laplaceNoise(scale) {
    const u = Math.random() - 0.5;
    return -scale * Math.sign(u) * Math.log(1 - 2 * Math.abs(u));
}

// We'll use laplaceNoise to slightly move the lines.
function drawNoisyLine(ctx, x1, y1, x2, y2, noiseScale) {
    const nx1 = x1 + laplaceNoise(noiseScale);
    const ny1 = y1 + laplaceNoise(noiseScale);
    const nx2 = x2 + laplaceNoise(noiseScale);
    const ny2 = y2 + laplaceNoise(noiseScale);

    // Slightly change line thickness or opacity with noise as well
    const opacity = Math.max(0.2, 1 - noiseScale);
    ctx.strokeStyle = `rgba(0, 0, 0, ${opacity})`;

    ctx.beginPath();
    ctx.moveTo(nx1, ny1);
    ctx.lineTo(nx2, ny2);
    ctx.stroke();
}

export { laplaceNoise, drawNoisyLine };
