export function randomizedResponse(trueValue, epsilon) {
    // trueValue is boolean
    const expE = Math.exp(epsilon);
    const p = expE / (expE + 1);
    const rand = Math.random();
    if (rand < p) {
        return trueValue; // correct answer
    } else {
        return !trueValue; // flipped answer
    }
}
