import { describe, expect, it } from 'vitest';
import { assertDeployable, DeploymentBlockedError } from '../src/domain/deploymentGate.js';
import { evaluateReadiness } from '../src/domain/readiness.js';
import { reclassifyRisk, RiskLoweringError } from '../src/domain/risk.js';
import type { Release } from '../src/domain/types.js';
import { approval, BUILD, labVerification, release } from './fixtures.js';

describe('Scenario 1: high-risk release needs lab verification + director acceptance for the exact build', () => {
  it('is blocked with neither', () => {
    expect(() => assertDeployable(release({ risk: 'HIGH' }), BUILD)).toThrow(/LABORATORY_VERIFICATION/);
  });

  it('is blocked with lab verification only', () => {
    const r = release({ risk: 'HIGH', labVerifications: [labVerification()] });
    expect(() => assertDeployable(r, BUILD)).toThrow(/DIRECTOR_ACCEPTANCE/);
  });

  it('is blocked when lab verification is not yet reviewed', () => {
    const r = release({
      risk: 'HIGH',
      labVerifications: [labVerification({ reviewed: false })],
      approvals: [approval()],
    });
    expect(evaluateReadiness(r).deployable).toBe(false);
  });

  it('deploys with both recorded for this build', () => {
    const r = release({ risk: 'HIGH', labVerifications: [labVerification()], approvals: [approval()] });
    expect(assertDeployable(r, BUILD).deployable).toBe(true);
  });
});

describe('Scenario 2: low-risk release', () => {
  it('does not require director acceptance', () => {
    const readiness = evaluateReadiness(release());
    expect(readiness.deployable).toBe(true);
    expect(readiness.items.find((i) => i.key === 'DIRECTOR_ACCEPTANCE')?.required).toBe(false);
  });

  it.each([
    ['no linked issues', { linkedIssues: [] }],
    ['issue missing risk class', { linkedIssues: [{ number: 1, riskClass: null, documentationImpact: false }] }],
    ['PR self-approved only', { pullRequests: [{ number: 1, author: 'dev-a', approvers: ['dev-a'] }] }],
    ['tests failed', { testSummary: { buildId: BUILD.buildId, passed: false } }],
    ['tests from another build', { testSummary: { buildId: 'build-99', passed: true } }],
    ['manual missing', { manual: null }],
    ['manual for wrong version', { manual: { version: '1.3.0' } }],
  ] satisfies [string, Partial<Release>][])('still blocks when %s', (_label, overrides) => {
    expect(() => assertDeployable(release(overrides), BUILD)).toThrow(DeploymentBlockedError);
  });
});

describe('Scenario 3: rejected release stays blocked', () => {
  it('blocks even if a later acceptance is recorded for the same build', () => {
    const r = release({
      risk: 'HIGH',
      labVerifications: [labVerification()],
      approvals: [
        approval({ decision: 'REJECT', decidedAt: new Date('2026-11-20T09:00:00Z') }),
        approval({ decision: 'ACCEPT', decidedAt: new Date('2026-11-20T11:00:00Z') }),
      ],
    });
    expect(() => assertDeployable(r, BUILD)).toThrow(/rejected/);
  });

  it('blocks a low-risk release that was rejected', () => {
    const r = release({ approvals: [approval({ decision: 'REJECT' })] });
    expect(evaluateReadiness(r).rejected).toBe(true);
    expect(evaluateReadiness(r).deployable).toBe(false);
  });
});

describe('Scenario 4: approval is bound to release ID, build ID and bundle hash', () => {
  it.each([
    ['different build ID', { buildId: 'build-101' }],
    ['different bundle hash', { bundleHash: 'b'.repeat(64) }],
    ['different release ID', { releaseId: 'rel-2' }],
  ])('ignores an acceptance for a %s', (_label, mismatch) => {
    const r = release({
      risk: 'HIGH',
      labVerifications: [labVerification()],
      approvals: [approval(mismatch)],
    });
    expect(evaluateReadiness(r).deployable).toBe(false);
  });

  it('refuses to deploy a build that differs from the persisted release', () => {
    expect(() => assertDeployable(release(), { ...BUILD, bundleHash: 'c'.repeat(64) })).toThrow(
      /does not match/,
    );
  });
});

describe('Risk classification', () => {
  it('can be raised', () => {
    expect(reclassifyRisk('LOW', 'HIGH')).toBe('HIGH');
  });

  it('can never be lowered', () => {
    expect(() => reclassifyRisk('HIGH', 'LOW')).toThrow(RiskLoweringError);
  });
});
