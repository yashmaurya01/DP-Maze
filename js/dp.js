export function randomizedResponse(trueValue, epsilon) {
    // trueValue is boolean
    // epsilon is the privacy parameter (ε)

    // Calculate probability of returning true answer
    const p = (Math.exp(epsilon) - 1) / (Math.exp(epsilon) - 1 + 2);

    // Generate random number between 0 and 1
    const rand1 = Math.random();
    const rand2 = Math.random();

    // Return true value with probability p
    // Return opposite value with probability 1-p
    if (rand1 < p) {
        return trueValue;
    } else {
        if (rand2 < 0.5) {
            return trueValue;
        } else {
            return !trueValue;
        }
    }
}
