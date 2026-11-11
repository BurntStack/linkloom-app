import { request } from './client';

export async function getBrandProfile() {
  return request<any>('/v1/brands/me/');
}

export async function saveBrandProfile(profile: {
  name: string; website?: string; industry?: string; legalName?: string; gstin?: string; stateCode?: string; billingAddress?: string;
}) {
  return request<any>('/v1/brands/me/', { method: 'PATCH', body: JSON.stringify(profile) });
}
