import { queryString, request, requestPage } from './client';

export async function getNotifications(cursor?: string) {
  return requestPage<any>(`/v1/notifications/${queryString({ limit: 50, cursor })}`);
}

export async function getUnreadNotificationCount() {
  return request<any>('/v1/notifications/unread-count/');
}

export async function markNotificationRead(id: string) {
  return request<any>(`/v1/notifications/${encodeURIComponent(id)}/read/`, { method: 'PATCH' });
}

export async function markAllNotificationsRead() {
  return request<any>('/v1/notifications/read-all/', { method: 'POST' });
}
