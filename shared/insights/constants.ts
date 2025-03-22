/**
 * Thresholds used for stock insight calculations
 */

// Threshold for considering price near moving averages (±2.5%)
export const MOVING_AVERAGE_THRESHOLD = 0.025;

// Threshold for 52-week high insights (15% to 35% below high)
export const FIFTY_TWO_WEEK_HIGH_MIN_THRESHOLD = 0.15;
export const FIFTY_TWO_WEEK_HIGH_MAX_THRESHOLD = 0.35;

// Threshold for 52-week low insights (within 5% of 52-week low)
export const FIFTY_TWO_WEEK_LOW_THRESHOLD = 0.05;
