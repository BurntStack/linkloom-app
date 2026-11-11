import { queryString, request, requestPage } from './client';

export async function getCart(cursor?: string) {
  return requestPage<any>(`/v1/cart/${queryString({ limit: 50, cursor })}`);
}

export async function addCartItem(packageId: string, brief: string) {
  return request<any>('/v1/cart/', { method: 'POST', body: JSON.stringify({ packageId, brief }) });
}

export async function removeCartItem(itemId: string) {
  return request(`/v1/cart/${encodeURIComponent(itemId)}/`, { method: 'DELETE' });
}

export async function checkoutCart(usageRights: string) {
  return request<any>('/v1/cart/checkout/', { method: 'POST', body: JSON.stringify({ usageRights }) });
}
