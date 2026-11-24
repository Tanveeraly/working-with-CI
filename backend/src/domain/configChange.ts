import { configChangeRisk, type ConfigArea, type RiskLevel } from './risk.js';

export interface ConfigChange {
  id: string;
  product: string;
  area: ConfigArea;
  risk: RiskLevel;
  acceptedAt: Date | null;
}

export interface ProductionApplication {
  changeId: string;
  appliedBy: string;
  appliedAt: Date;
  deviation: boolean;
}

export function effectiveRisk(change: ConfigChange): RiskLevel {
  return configChangeRisk(change.area, change.risk);
}

/**
 * Records that a configuration change was applied in production. Applying a change that requires
 * acceptance before it was accepted is not silently allowed: it is recorded as a deviation.
 */
export function recordProductionApplication(
  change: ConfigChange,
  appliedBy: string,
  appliedAt: Date,
): ProductionApplication {
  const needsAcceptance = effectiveRisk(change) === 'HIGH';
  const accepted = change.acceptedAt !== null && change.acceptedAt.getTime() <= appliedAt.getTime();
  return { changeId: change.id, appliedBy, appliedAt, deviation: needsAcceptance && !accepted };
}
