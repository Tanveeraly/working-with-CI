import { describe, expect, it } from 'vitest';
import { effectiveRisk, recordProductionApplication, type ConfigChange } from '../src/domain/configChange.js';

const change = (overrides: Partial<ConfigChange> = {}): ConfigChange => ({
  id: 'cfg-1',
  product: 'CaseVu LIS',
  area: 'RULE',
  risk: 'HIGH',
  acceptedAt: null,
  ...overrides,
});

const appliedAt = new Date('2026-11-24T12:00:00Z');

describe('Configuration changes', () => {
  it('treats report-template changes as High risk regardless of declared risk', () => {
    expect(effectiveRisk(change({ area: 'REPORT_TEMPLATE', risk: 'LOW' }))).toBe('HIGH');
  });

  it('Scenario 8: applying before acceptance is recorded as a deviation', () => {
    expect(recordProductionApplication(change(), 'ops-1', appliedAt).deviation).toBe(true);
  });

  it('acceptance recorded after application does not clear the deviation', () => {
    const late = change({ acceptedAt: new Date('2026-11-24T13:00:00Z') });
    expect(recordProductionApplication(late, 'ops-1', appliedAt).deviation).toBe(true);
  });

  it('applying after acceptance is not a deviation', () => {
    const ok = change({ acceptedAt: new Date('2026-11-24T11:00:00Z') });
    expect(recordProductionApplication(ok, 'ops-1', appliedAt)).toMatchObject({
      appliedBy: 'ops-1',
      deviation: false,
    });
  });
});
