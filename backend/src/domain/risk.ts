export type RiskLevel = 'LOW' | 'HIGH';

const RANK: Record<RiskLevel, number> = { LOW: 0, HIGH: 1 };

export class RiskLoweringError extends Error {
  constructor(from: RiskLevel, to: RiskLevel) {
    super(`Risk can be raised but never lowered (attempted ${from} -> ${to})`);
    this.name = 'RiskLoweringError';
  }
}

/** Returns the new risk level, refusing any attempt to lower it. */
export function reclassifyRisk(current: RiskLevel, requested: RiskLevel): RiskLevel {
  if (RANK[requested] < RANK[current]) throw new RiskLoweringError(current, requested);
  return requested;
}

export type ConfigArea =
  | 'REPORT_TEMPLATE'
  | 'TEST_CATALOG'
  | 'INTERFACE'
  | 'RULE'
  | 'DATA_FIX'
  | 'ACCESS'
  | 'OTHER';

/** Report-template changes are always High risk; otherwise the declared risk stands. */
export function configChangeRisk(area: ConfigArea, declared: RiskLevel): RiskLevel {
  return area === 'REPORT_TEMPLATE' ? 'HIGH' : declared;
}
