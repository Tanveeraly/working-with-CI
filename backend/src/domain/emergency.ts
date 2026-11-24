export const EMERGENCY_EXPIRY_MS = 4 * 60 * 60 * 1000;
export const POST_DEPLOY_REVIEW_BUSINESS_DAYS = 3;

export type EmergencyStatus = 'AWAITING_SECOND_SIGNATURE' | 'AUTHORIZED' | 'DECLINED' | 'EXPIRED';

export interface Signature {
  userId: string;
  signedAt: Date;
}

export interface EmergencyRequest {
  id: string;
  releaseId: string;
  incident: string;
  firstSignature: Signature;
  secondSignature: Signature | null;
  declined: Signature | null;
}

export class EmergencyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmergencyError';
  }
}

export function emergencyStatus(req: EmergencyRequest, now: Date): EmergencyStatus {
  if (req.declined) return 'DECLINED';
  if (req.secondSignature) return 'AUTHORIZED';
  if (now.getTime() - req.firstSignature.signedAt.getTime() >= EMERGENCY_EXPIRY_MS) return 'EXPIRED';
  return 'AWAITING_SECOND_SIGNATURE';
}

/** Records the independent second signature. The requester cannot sign twice. */
export function signSecond(req: EmergencyRequest, userId: string, now: Date): EmergencyRequest {
  const status = emergencyStatus(req, now);
  if (status !== 'AWAITING_SECOND_SIGNATURE') throw new EmergencyError(`Cannot sign: request is ${status}`);
  if (userId === req.firstSignature.userId) {
    throw new EmergencyError('The requester cannot provide the second signature');
  }
  return { ...req, secondSignature: { userId, signedAt: now } };
}

export function canDeployEmergency(req: EmergencyRequest, now: Date): boolean {
  return emergencyStatus(req, now) === 'AUTHORIZED';
}

/** Director review deadline: three business days (Mon–Fri) after deployment. */
export function postDeployReviewDue(deployedAt: Date): Date {
  const due = new Date(deployedAt);
  let added = 0;
  while (added < POST_DEPLOY_REVIEW_BUSINESS_DAYS) {
    due.setUTCDate(due.getUTCDate() + 1);
    const day = due.getUTCDay();
    if (day !== 0 && day !== 6) added++;
  }
  return due;
}
