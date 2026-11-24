import type { ApprovalRecord, LabVerification, Release } from '../src/domain/types.js';

export const BUILD = { releaseId: 'rel-1', buildId: 'build-100', bundleHash: 'a'.repeat(64) };

export function release(overrides: Partial<Release> = {}): Release {
  return {
    ...BUILD,
    version: '1.4.0',
    risk: 'LOW',
    linkedIssues: [{ number: 12, riskClass: 'LOW', documentationImpact: false }],
    pullRequests: [{ number: 34, author: 'dev-a', approvers: ['dev-b'] }],
    testSummary: { buildId: BUILD.buildId, passed: true },
    manual: { version: '1.4.0' },
    labVerifications: [],
    approvals: [],
    ...overrides,
  };
}

export function labVerification(overrides: Partial<LabVerification> = {}): LabVerification {
  return { ...BUILD, reviewed: true, ...overrides };
}

export function approval(overrides: Partial<ApprovalRecord> = {}): ApprovalRecord {
  return {
    ...BUILD,
    decision: 'ACCEPT',
    approverId: 'director-1',
    reason: 'Verified in test environment',
    decidedAt: new Date('2026-11-20T10:00:00Z'),
    ...overrides,
  };
}
