import { evaluateReadiness, sameBuild, type Readiness } from './readiness.js';
import type { BuildRef, Release } from './types.js';

export class DeploymentBlockedError extends Error {
  constructor(
    message: string,
    readonly readiness?: Readiness,
  ) {
    super(message);
    this.name = 'DeploymentBlockedError';
  }
}

/**
 * Re-checks readiness immediately before deployment. Must be called inside the same DB transaction
 * that records the deployment event, with `release` freshly loaded (row-locked) from the database.
 */
export function assertDeployable(release: Release, requested: BuildRef): Readiness {
  if (!sameBuild(release, requested)) {
    throw new DeploymentBlockedError(
      'Requested build does not match the persisted release (release ID, build ID or bundle hash differs)',
    );
  }
  const readiness = evaluateReadiness(release);
  if (readiness.rejected) throw new DeploymentBlockedError('Release was rejected', readiness);
  if (!readiness.deployable) {
    const missing = readiness.items.filter((i) => i.required && !i.satisfied).map((i) => i.key);
    throw new DeploymentBlockedError(`Missing required evidence: ${missing.join(', ')}`, readiness);
  }
  return readiness;
}
