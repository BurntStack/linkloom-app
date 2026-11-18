export type AuthRole = 'brand' | 'creator';
export type AuthChannel = 'email';
export type KycStatus = 'not_started' | 'in_progress' | 'pending' | 'verified' | 'rejected';
export type KycStepProgress = {
  completed: boolean;
  maskedValue?: string;
};
export type KycStatusSnapshot = {
  status: KycStatus;
  pan: KycStepProgress;
  id: KycStepProgress;
  bank: KycStepProgress;
  rejectionReason?: string;
};
export type UsageRights = {
  duration: string;
  channels: string[];
  exclusivity: boolean;
  territory: string;
};

export type BrandOnboarding = {
  brandName: string;
  businessCategory: string;
  geographicalScope: string;
  regionState: string;
  termsAccepted: boolean;
  city?: string;
  country?: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  brandWebsite?: string;
  brandLogo?: string;
  legalName?: string;
  gstin?: string;
  stateCode?: string;
  billingAddress?: string;
};

export type ApiPage<T> = { items: T[]; nextCursor?: string; unreadCount?: number; cartId?: string };

export type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: { code?: string; message?: string; details?: unknown; fields?: unknown; errors?: unknown };
  meta?: { nextCursor?: string; [key: string]: unknown };
};
