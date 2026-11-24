import type { BuildRef, Release } from './types.js';

export type ReadinessKey =
  | 'LINKED_ISSUES'
  | 'REVIEWED_PULL_REQUESTS'
  | 'CI_TEST_SUMMARY'
  | 'USER_MANUAL'
  | 'LABORATORY_VERIFICATION'
  | 'DIRECTOR_ACCEPTANCE';

export interface ReadinessItem {
  key: ReadinessKey;
  required: boolean;
  satisfied: boolean;
  detail: string;
}

export interface Readiness {
  items: ReadinessItem[];
  rejected: boolean;
  deployable: boolean;
}

export const sameBuild = (a: BuildRef, b: BuildRef): boolean =>
  a.releaseId === b.releaseId && a.buildId === b.buildId && a.bundleHash === b.bundleHash;

/**
 * Computes readiness from persisted evidence only. Never accept readiness values from the client.
 * Approvals and lab verification count only when bound to this exact release + build + bundle hash.
 */
export function evaluateReadiness(release: Release): Readiness {
  const highRisk = release.risk === 'HIGH';

  const issuesOk =
    release.linkedIssues.length > 0 &&
    release.linkedIssues.every((i) => i.riskClass !== null && i.documentationImpact !== null);

  const prsOk =
    release.pullRequests.length > 0 &&
    release.pullRequests.every((pr) => pr.approvers.some((a) => a !== pr.author));

  const testsOk =
    release.testSummary !== null &&
    release.testSummary.passed &&
    release.testSummary.buildId === release.buildId;

  const manualOk = release.manual !== null && release.manual.version === release.version;

  const labOk = release.labVerifications.some((v) => v.reviewed && sameBuild(v, release));

  const decisions = release.approvals
    .filter((a) => sameBuild(a, release))
    .sort((a, b) => a.decidedAt.getTime() - b.decidedAt.getTime());
  const latest = decisions.at(-1);
  const rejected = decisions.some((d) => d.decision === 'REJECT');
  const accepted = latest?.decision === 'ACCEPT' && !rejected;

  const items: ReadinessItem[] = [
    item('LINKED_ISSUES', true, issuesOk, 'Issues attached with risk class and documentation impact'),
    item('REVIEWED_PULL_REQUESTS', true, prsOk, 'Every PR approved by an engineer other than its author'),
    item('CI_TEST_SUMMARY', true, testsOk, 'Test suites passed for this build ID'),
    item('USER_MANUAL', true, manualOk, 'Manual version matches release version'),
    item('LABORATORY_VERIFICATION', highRisk, labOk, 'Reviewed test-environment evidence for this build'),
    item('DIRECTOR_ACCEPTANCE', highRisk, accepted, 'Director/designee accepted this exact build'),
  ];

  const deployable = !rejected && items.every((i) => !i.required || i.satisfied);
  return { items, rejected, deployable };
}

function item(key: ReadinessKey, required: boolean, satisfied: boolean, detail: string): ReadinessItem {
  return { key, required, satisfied, detail };
}
