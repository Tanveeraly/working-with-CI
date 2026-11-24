// Sample lab utilities. This code only exists so the repo has something real to change, review,
// test and release. The generated GitHub data (issues, PRs, CI runs, bundles) is what matters.

/** Glucose: mg/dL -> mmol/L (factor 18.016). Rounded to one decimal place. */
export function glucoseMgDlToMmolL(mgdl: number): number {
  if (!Number.isFinite(mgdl) || mgdl < 0) throw new RangeError('Glucose must be a non-negative number');
  return Math.round((mgdl / 18.016) * 10) / 10;
}

export interface ReferenceRange {
  low: number;
  high: number;
  criticalLow?: number;
  criticalHigh?: number;
}

export type Flag = 'CRITICAL_LOW' | 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL_HIGH';

export function flagResult(value: number, range: ReferenceRange): Flag {
  if (range.criticalLow !== undefined && value <= range.criticalLow) return 'CRITICAL_LOW';
  if (range.criticalHigh !== undefined && value >= range.criticalHigh) return 'CRITICAL_HIGH';
  if (value < range.low) return 'LOW';
  if (value > range.high) return 'HIGH';
  return 'NORMAL';
}

/** Formats a result line for a report, e.g. "Glucose: 5.4 mmol/L (NORMAL)". */
export function formatResult(test: string, value: number, unit: string, flag: Flag): string {
  return `${test}: ${value} ${unit} (${flag})`;
}
