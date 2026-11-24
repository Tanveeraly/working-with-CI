import type { RiskLevel } from './risk.js';

/** Identifies the exact build an approval or deployment refers to. */
export interface BuildRef {
  releaseId: string;
  buildId: string;
  bundleHash: string;
}

export interface LinkedIssue {
  number: number;
  riskClass: RiskLevel | null;
  documentationImpact: boolean | null;
}

export interface PullRequest {
  number: number;
  author: string;
  approvers: string[];
}

export interface TestSummary {
  buildId: string;
  passed: boolean;
}

export interface Manual {
  version: string;
}

export interface LabVerification extends BuildRef {
  reviewed: boolean;
}

export interface ApprovalRecord extends BuildRef {
  decision: 'ACCEPT' | 'REJECT';
  approverId: string;
  reason: string;
  decidedAt: Date;
}

/** Server-side persisted state of a release. Readiness is computed only from this. */
export interface Release extends BuildRef {
  version: string;
  risk: RiskLevel;
  linkedIssues: LinkedIssue[];
  pullRequests: PullRequest[];
  testSummary: TestSummary | null;
  manual: Manual | null;
  labVerifications: LabVerification[];
  approvals: ApprovalRecord[];
}
