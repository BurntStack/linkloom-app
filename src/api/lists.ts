import { queryString, request, requestPage } from './client';

export async function getLists(cursor?: string) {
  return requestPage<any>(`/v1/lists/${queryString({ limit: 50, cursor })}`);
}

export async function createList(name: string) {
  return request<any>('/v1/lists/', { method: 'POST', body: JSON.stringify({ name }) });
}

export async function getList(id: string) {
  return request<any>(`/v1/lists/${encodeURIComponent(id)}/`);
}

export async function updateList(id: string, name: string) {
  return request<any>(`/v1/lists/${encodeURIComponent(id)}/`, { method: 'PATCH', body: JSON.stringify({ name }) });
}

export async function deleteList(id: string) {
  return request(`/v1/lists/${encodeURIComponent(id)}/`, { method: 'DELETE' });
}

export async function addCreatorToList(listId: string, creatorId: string) {
  return request<any>(`/v1/lists/${encodeURIComponent(listId)}/creators/`, {
    method: 'POST',
    body: JSON.stringify({ creatorId }),
  });
}

export async function removeCreatorFromList(listId: string, creatorId: string) {
  return request(`/v1/lists/${encodeURIComponent(listId)}/creators/${encodeURIComponent(creatorId)}/`, { method: 'DELETE' });
}
