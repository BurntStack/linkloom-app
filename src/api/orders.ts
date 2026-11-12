import { queryString, request, requestPage } from './client';

export async function getOrders(cursor?: string, status?: string) {
  return requestPage<any>(`/v1/orders/${queryString({ limit: 50, cursor, status })}`);
}

export async function getCreatorOrders(cursor?: string, status?: string) {
  return requestPage<any>(`/v1/creators/me/orders/${queryString({ limit: 50, cursor, status })}`);
}

export async function getOrder(id: string) {
  return request<any>(`/v1/orders/${encodeURIComponent(id)}/`);
}

export async function getOrderDeliverables(id: string, cursor?: string) {
  return requestPage<any>(`/v1/orders/${encodeURIComponent(id)}/deliverables/${queryString({ limit: 50, cursor })}`);
}

export async function submitOrderDeliverable(id: string, contentUrl: string, note: string) {
  return request<any>(`/v1/orders/${encodeURIComponent(id)}/deliverables/`, {
    method: 'POST',
    body: JSON.stringify({ contentUrl, note }),
  });
}

export async function requestOrderRevision(id: string, feedback: string) {
  return request<any>(`/v1/orders/${encodeURIComponent(id)}/revisions/`, {
    method: 'POST',
    body: JSON.stringify({ feedback }),
  });
}

export async function approveOrder(id: string) {
  return request<any>(`/v1/orders/${encodeURIComponent(id)}/approve/`, { method: 'POST' });
}

export async function cancelOrder(id: string, reason: string) {
  return request<any>(`/v1/orders/${encodeURIComponent(id)}/cancel/`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function disputeOrder(id: string, reason: string) {
  return request<any>(`/v1/orders/${encodeURIComponent(id)}/disputes/`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export async function reviewOrder(id: string, stars: number, text: string) {
  return request<any>(`/v1/orders/${encodeURIComponent(id)}/review/`, {
    method: 'POST',
    body: JSON.stringify({ stars, text }),
  });
}
