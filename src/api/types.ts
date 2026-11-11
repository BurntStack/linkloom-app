export type AuthRole = 'brand' | 'creator';
export type AuthChannel = 'sms' | 'email';

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

export type ApiPage<T> = { items: T[]; nextCursor?: string; unreadCount?: number };

export type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  error?: { code?: string; message?: string; details?: unknown; fields?: unknown; errors?: unknown };
  meta?: { nextCursor?: string; [key: string]: unknown };
};
