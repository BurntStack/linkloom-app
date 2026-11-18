import { ApiError, request } from './client';
import type { KycStatus, KycStatusSnapshot, KycStepProgress } from './types';

const KYC_STATUSES: KycStatus[] = ['not_started', 'in_progress', 'pending', 'verified', 'rejected'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function mapProgress(value: unknown, step: string): KycStepProgress {
  if (value === undefined || value === null || value === false) return { completed: false };
  if (value === true) return { completed: true };
  if (typeof value === 'string') {
    const status = value.toLowerCase();
    if (['not_started', 'incomplete', 'missing', 'in_progress'].includes(status)) return { completed: false };
    if (['complete', 'completed', 'done', 'verified'].includes(status)) return { completed: true };
    return { completed: Boolean(value.trim()), maskedValue: value || undefined };
  }
  if (!isRecord(value)) throw new ApiError(`The server returned invalid ${step} KYC progress.`, 200);

  const completedValue = value.completed ?? value.complete ?? value.isComplete ?? value.done;
  const stepStatus = typeof value.status === 'string' ? value.status.toLowerCase() : '';
  const maskedValue = [
    value.maskedValue,
    value.masked,
    value.maskedPan,
    value.maskedId,
    value.maskedAccountNumber,
    value.maskedNumber,
    typeof value.panLast4 === 'string' && value.panLast4 ? `****${value.panLast4}` : undefined,
    typeof value.accountLast4 === 'string' && value.accountLast4 ? `****${value.accountLast4}` : undefined,
    typeof value.idType === 'string' && value.idType ? value.idType : undefined,
  ].find((item): item is string => typeof item === 'string' && Boolean(item));

  if (typeof completedValue === 'boolean') return { completed: completedValue, maskedValue };
  if (stepStatus) {
    if (['complete', 'completed', 'done', 'submitted', 'pending', 'verified'].includes(stepStatus)) return { completed: true, maskedValue };
    if (['incomplete', 'not_started', 'missing'].includes(stepStatus)) return { completed: false, maskedValue };
  }
  if (maskedValue) return { completed: true, maskedValue };
  throw new ApiError(`The server returned unrecognized ${step} KYC progress.`, 200);
}

export function mapKycStatus(value: unknown): KycStatusSnapshot {
  const root = isRecord(value) ? value : undefined;
  const payload = root && isRecord(root.kyc) ? root.kyc : root;
  if (!payload) throw new ApiError('The server returned an invalid KYC status.', 200);
  const status = payload.status;
  if (typeof status !== 'string' || !KYC_STATUSES.includes(status as KycStatus)) {
    throw new ApiError('The server returned an unsupported KYC status.', 200);
  }
  const progress = isRecord(payload.steps) ? payload.steps : payload;
  const rejectionReason = typeof payload.rejectionReason === 'string' ? payload.rejectionReason : undefined;
  return {
    status: status as KycStatus,
    pan: mapProgress(progress.pan, 'PAN'),
    id: mapProgress(progress.id, 'identity document'),
    bank: mapProgress(progress.bank, 'bank'),
    ...(rejectionReason ? { rejectionReason } : {}),
  };
}

export async function getKycStatus() {
  return mapKycStatus(await request<unknown>('/v1/kyc/'));
}

export function saveKycPan(input: { pan: string; nameOnPan: string }) {
  return request('/v1/kyc/pan/', { method: 'PUT', body: JSON.stringify(input) });
}

export function saveKycId(input: {
  idType: 'aadhaar' | 'passport' | 'driving_licence' | 'voter_id';
  uploadId: string;
}) {
  return request('/v1/kyc/id/', { method: 'PUT', body: JSON.stringify(input) });
}

export function saveKycBank(input: { accountHolderName: string; accountNumber: string; ifsc: string }) {
  return request('/v1/kyc/bank/', { method: 'PUT', body: JSON.stringify(input) });
}

export function submitKyc() {
  return request('/v1/kyc/submit/', { method: 'POST', body: JSON.stringify({}) });
}
