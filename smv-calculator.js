/**
 * SMV (Standard Minute Value) Calculator
 *
 * The standard time required to complete a sewing operation,
 * including allowances for personal needs, fatigue, and unavoidable delays.
 *
 * Formula:
 *   SMV = Basic Time × (1 + Allowance%)
 *   Basic Time = Observed Time × Performance Rating
 *
 * Used across the garment industry as the baseline for:
 *   - Operator wage calculation (piece-rate)
 *   - Production capacity planning
 *   - Line balancing
 *   - CMT pricing
 *
 * Reference: https://scan-erp.web.app/blog/sam-smv-calculation-garment-industry.html
 *
 * @example
 *   const smv = calculateSMV({
 *     observedTimeSeconds: 18,
 *     performanceRating: 1.05,
 *     allowancePercent: 0.30,
 *   });
 *   // → 0.4095 minutes per piece
 */
function calculateSMV({ observedTimeSeconds, performanceRating, allowancePercent }) {
  if (observedTimeSeconds <= 0) throw new Error('observedTimeSeconds must be > 0');
  if (performanceRating <= 0) throw new Error('performanceRating must be > 0');
  if (allowancePercent < 0 || allowancePercent > 1) {
    throw new Error('allowancePercent must be between 0 and 1 (e.g., 0.30 for 30%)');
  }

  const basicTimeMinutes = (observedTimeSeconds / 60) * performanceRating;
  const smv = basicTimeMinutes * (1 + allowancePercent);
  return smv;
}

/**
 * Calculate operator capacity per hour given SMV
 */
function calculateHourlyCapacity({ smvMinutes, efficiencyPercent = 100 }) {
  if (smvMinutes <= 0) throw new Error('smvMinutes must be > 0');
  const piecesPerHour = (60 / smvMinutes) * (efficiencyPercent / 100);
  return Math.floor(piecesPerHour);
}

/**
 * Reverse: calculate SMV from target hourly output
 */
function calculateSMVFromTarget({ targetPiecesPerHour, efficiencyPercent = 100 }) {
  if (targetPiecesPerHour <= 0) throw new Error('targetPiecesPerHour must be > 0');
  return (60 / targetPiecesPerHour) * (efficiencyPercent / 100);
}

module.exports = { calculateSMV, calculateHourlyCapacity, calculateSMVFromTarget };
