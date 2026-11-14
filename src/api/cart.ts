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

export async function checkoutCart(cartId: string) {
  if (!cartId.trim()) throw new Error('The server did not return a cart ID. Refresh the cart and try again.');
  return request<any>('/v1/checkout/', { method: 'POST', body: JSON.stringify({ cartId }) });
}
