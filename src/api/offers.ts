import { queryString, request, requestPage, rupeesToPaise } from './client';

export async function getOffers(cursor?: string) {
  return requestPage<any>(`/v1/offers/${queryString({ limit: 50, cursor })}`);
}

export async function createOffer(input: {
  creatorId: string; deliverable: string; budget: number; deadline: string; message: string; usageRights: string;
}) {
  return request<any>('/v1/offers/', {
    method: 'POST',
    body: JSON.stringify({ ...input, budget: rupeesToPaise(input.budget) }),
  });
}

export async function withdrawOffer(id: string) {
  return request<any>(`/v1/offers/${encodeURIComponent(id)}/withdraw/`, { method: 'POST' });
}

export async function getCreatorOffers(cursor?: string) {
  return requestPage<any>(`/v1/creators/me/offers/${queryString({ limit: 50, cursor })}`);
}

export async function respondToOffer(id: string, status: 'accepted' | 'rejected') {
  return request<any>(`/v1/creators/me/offers/${encodeURIComponent(id)}/`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
