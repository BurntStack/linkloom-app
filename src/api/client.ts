import * as SecureStore from 'expo-secure-store';
import { ApiEnvelope, ApiPage } from './types';

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://collab-api-ewju.onrender.com').replace(/\/+$/, '');
export const ACCESS_KEY = 'brandside.access';
export const REFRESH_KEY = 'brandside.refresh';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function saveAuthTokens(access: string, refresh: string) {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_KEY, access),
    SecureStore.setItemAsync(REFRESH_KEY, refresh),
  ]);
}

export async function clearAuthTokens() {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
  ]);
}

export async function hasSavedSession() {
  const [access, refresh] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_KEY),
    SecureStore.getItemAsync(REFRESH_KEY),
  ]);
  return Boolean(access || refresh);
}

export const rupeesToPaise = (amount: number) => Math.round(amount * 100);
export const paiseToRupees = (amount: number) => amount / 100;

async function readEnvelope<T>(response: Response): Promise<ApiEnvelope<T>> {
  const text = await response.text();
  let envelope: ApiEnvelope<T> = {};
  if (text) {
    try {
      const parsed = JSON.parse(text) as ApiEnvelope<T> & Record<string, unknown>;
      envelope = 'success' in parsed || 'data' in parsed || 'error' in parsed || 'meta' in parsed
        ? parsed
        : { data: parsed as T };
    } catch {
      throw new ApiError('The server returned an invalid response.', response.status);
    }
  }
  if (!response.ok || envelope.success === false) {
    const validationDetails = [
      envelope.error?.details,
      envelope.error?.fields,
      envelope.error?.errors,
    ].filter((detail) => detail !== undefined && detail !== null);
    const detailText = validationDetails.length
      ? validationDetails.map((detail) => typeof detail === 'string' ? detail : JSON.stringify(detail)).join('; ')
      : '';
    throw new ApiError(
      [
        envelope.error?.message || envelope.error?.code || `Request failed (${response.status})`,
        detailText,
      ].filter(Boolean).join(': '),
      response.status,
      envelope.error?.code,
    );
  }
  return envelope;
}

let refreshInFlight: Promise<string | null> | null = null;
export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refresh = await SecureStore.getItemAsync(REFRESH_KEY);
      if (!refresh) return null;
      try {
        const response = await fetch(`${API_BASE_URL}/v1/auth/token/refresh/`, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        });
        const envelope = await readEnvelope<{ access: string; refresh?: string }>(response);
        const tokens = envelope.data;
        if (!tokens?.access) throw new ApiError('The server did not return a refreshed access token.', response.status);
        await saveAuthTokens(tokens.access, tokens.refresh || refresh);
        return tokens.access;
      } catch (error) {
        if (error instanceof ApiError && [400, 401, 403].includes(error.status)) {
          await clearAuthTokens();
        }
        throw error;
      }
    })().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

export async function requestEnvelope<T>(
  path: string,
  options: RequestInit = {},
  auth = true,
  canRefresh = true,
): Promise<ApiEnvelope<T>> {
  const headers = new Headers(options.headers);
  headers.set('Accept', 'application/json');
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (auth) {
    let access = await SecureStore.getItemAsync(ACCESS_KEY);
    if (!access && canRefresh) access = await refreshAccessToken();
    if (!access) throw new ApiError('Your session has expired. Please log in again.', 401, 'not_authenticated');
    headers.set('Authorization', `Bearer ${access}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  } catch (error) {
    throw new ApiError(error instanceof Error ? error.message : 'Unable to reach the server.', 0, 'network_error');
  }

  if (response.status === 401 && auth && canRefresh) {
    const access = await refreshAccessToken();
    if (access) {
      const retryHeaders = new Headers(headers);
      retryHeaders.set('Authorization', `Bearer ${access}`);
      return requestEnvelope<T>(path, { ...options, headers: retryHeaders }, true, false);
    }
  }
  return readEnvelope<T>(response);
}

export async function request<T>(path: string, options?: RequestInit, auth = true): Promise<T> {
  const envelope = await requestEnvelope<T>(path, options, auth);
  return envelope.data as T;
}

export function queryString(params: Record<string, string | number | boolean | undefined>) {
  const query = Object.entries(params).filter(([, value]) => value !== undefined && value !== '');
  return query.length ? `?${query.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`).join('&')}` : '';
}

export function pageItems<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === 'object') {
    const record = data as Record<string, unknown>;
    const items = [
      record.results, record.items, record.data, record.creators, record.campaigns, record.bids,
      record.orders, record.lists, record.offers, record.packages, record.cartItems,
      record.notifications, record.deliverables, record.reviews, record.conversations, record.messages,
    ].find(Array.isArray);
    if (Array.isArray(items)) return items as T[];
    if (record.data && typeof record.data === 'object') return pageItems<T>(record.data);
  }
  return [];
}

export async function requestPage<T>(path: string): Promise<ApiPage<T>> {
  const envelope = await requestEnvelope<unknown>(path);
  const data = envelope.data;
  const dataRecord = data && typeof data === 'object' && !Array.isArray(data)
    ? data as Record<string, unknown>
    : undefined;
  const cartId = typeof dataRecord?.cartId === 'string'
    ? dataRecord.cartId
    : typeof envelope.meta?.cartId === 'string' ? envelope.meta.cartId : undefined;
  return {
    items: pageItems<T>(data),
    nextCursor: envelope.meta?.nextCursor,
    unreadCount: typeof envelope.meta?.unreadCount === 'number' ? envelope.meta.unreadCount : undefined,
    cartId,
  };
}

export async function requestDownload(path: string): Promise<string> {
  let access = await SecureStore.getItemAsync(ACCESS_KEY);
  if (!access) access = await refreshAccessToken() || undefined;
  if (!access) throw new ApiError('Your session has expired. Please log in again.', 401, 'not_authenticated');

  const send = async (token: string) => {
    try {
      return await fetch(`${API_BASE_URL}${path}`, {
        headers: { Accept: 'text/csv, application/json', Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      throw new ApiError(error instanceof Error ? error.message : 'Unable to reach the server.', 0, 'network_error');
    }
  };

  let response = await send(access);
  if (response.status === 401) {
    access = await refreshAccessToken() || undefined;
    if (access) response = await send(access);
  }
  if (!response.ok) {
    await readEnvelope<unknown>(response);
    throw new ApiError(`Request failed (${response.status})`, response.status);
  }
  return response.text();
}
