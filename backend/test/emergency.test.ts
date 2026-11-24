import { describe, expect, it } from 'vitest';
import {
  canDeployEmergency,
  emergencyStatus,
  EmergencyError,
  postDeployReviewDue,
  signSecond,
  type EmergencyRequest,
} from '../src/domain/emergency.js';

const t0 = new Date('2026-11-24T08:00:00Z');
const hours = (h: number) => new Date(t0.getTime() + h * 3_600_000);

const request = (): EmergencyRequest => ({
  id: 'em-1',
  releaseId: 'rel-1',
  incident: 'Results not posting to interface',
  firstSignature: { userId: 'release-manager', signedAt: t0 },
  secondSignature: null,
  declined: null,
});

describe('Scenario 6: emergency deployment needs a second signature', () => {
  it('is blocked until the second signature is recorded', () => {
    expect(canDeployEmergency(request(), hours(1))).toBe(false);
    const signed = signSecond(request(), 'lab-contact', hours(1));
    expect(canDeployEmergency(signed, hours(1))).toBe(true);
  });

  it('rejects the requester signing twice', () => {
    expect(() => signSecond(request(), 'release-manager', hours(1))).toThrow(EmergencyError);
  });

  it('cannot be signed after being declined', () => {
    const declined = { ...request(), declined: { userId: 'lab-contact', signedAt: hours(1) } };
    expect(() => signSecond(declined, 'lab-contact-2', hours(2))).toThrow(/DECLINED/);
  });
});

describe('Scenario 7: emergency request expires after four hours', () => {
  it('is still open just before four hours', () => {
    expect(emergencyStatus(request(), hours(3.99))).toBe('AWAITING_SECOND_SIGNATURE');
  });

  it('expires at four hours and can no longer be signed', () => {
    expect(emergencyStatus(request(), hours(4))).toBe('EXPIRED');
    expect(() => signSecond(request(), 'lab-contact', hours(4))).toThrow(/EXPIRED/);
  });
});

describe('Post-deployment director review', () => {
  it('is due three business days later, skipping weekends', () => {
    // Thu 26 Nov -> Fri 27, (skip Sat/Sun), Mon 30, Tue 1 Dec
    const due = postDeployReviewDue(new Date('2026-11-26T12:00:00Z'));
    expect(due.toISOString()).toBe('2026-12-01T12:00:00.000Z');
  });
});
