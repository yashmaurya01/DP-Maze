import { randomizedResponse } from './dp.js';

let remainingBudget = 0;
let epsilonPerQuery = 0.5;
/**
 * Set the total privacy budget (remainingBudget).
 * Called once at the start of the game based on selected difficulty.
 */
export function setBudget(totalBudget) {
    remainingBudget = totalBudget;
}
/**
 * Set epsilon per query.
 * Higher epsilon = less noise = more accurate DP responses.
 * Called after user chooses epsilon slider value before starting the game.
 */
export function setEpsilon(eps) {
    epsilonPerQuery = eps;
}

/**
 * Check if we have enough budget to perform a query.
 */
function canQuery() {
    return remainingBudget >= epsilonPerQuery;
}

/**
 * Query if there's water behind the chosen door.
 * Returns boolean (Yes/No) or null if no budget left.
 * The returned value is a DP-noised result.
 */
export function queryDoorIsWater(doorTrueValue) {
    if (!canQuery()) return null;
    remainingBudget -= costPerQuery;
    return randomizedResponse(doorTrueValue, epsilonPerQuery);
}

/**
 * Query if there's a guard behind the chosen door.
 * Returns DP-noised boolean or null if no budget.
 */
export function queryDoorHasGuard(doorTrueValue) {
    if (!canQuery()) return null;
    remainingBudget -= costPerQuery;
    return randomizedResponse(doorTrueValue, epsilonPerQuery);
}

/**
 * Query if the door is locked.
 * Returns DP-noised boolean or null if no budget.
 */
export function queryDoorIsLocked(doorTrueValue) {
    if (!canQuery()) return null;
    remainingBudget -= costPerQuery;
    return randomizedResponse(doorTrueValue, epsilonPerQuery);
}

/**
 * Get current remaining budget for UI display.
 */
export function getRemainingBudget() {
    return remainingBudget;
}
