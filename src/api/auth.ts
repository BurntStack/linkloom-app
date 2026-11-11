import * as SecureStore from 'expo-secure-store';
import { ApiError, clearAuthTokens, REFRESH_KEY, request, saveAuthTokens } from './client';
import { AuthChannel, AuthRole } from './types';

export async function requestAuthOtp(input: {
  channel: AuthChannel;
  destination: string;
}) {
  return request<{ challengeId: string }>('/v1/auth/otp/request/', {
    method: 'POST',
    body: JSON.stringify(input),
  }, false);
}

export async function verifyOtp(challengeId: string, code: string) {
  const tokens = await request<{ access: string; refresh: string; user: any }>('/v1/auth/otp/verify/', {
    method: 'POST',
    body: JSON.stringify({ challengeId, code }),
  }, false);
  if (!tokens?.access || !tokens.refresh || !tokens.user) {
    throw new ApiError('The server returned incomplete login details.', 200);
  }
  await saveAuthTokens(tokens.access, tokens.refresh);
  return tokens;
}

export async function completeSignup(input: {
  role: AuthRole;
  fullName: string;
  brandName?: string;
  displayName?: string;
}) {
  return request<any>('/v1/auth/signup/complete/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getCurrentUser() {
  return request<any>('/v1/auth/me/');
}

export async function logout() {
  const refresh = await SecureStore.getItemAsync(REFRESH_KEY);
  try {
    if (refresh) await request('/v1/auth/logout/', { method: 'POST', body: JSON.stringify({ refresh }) });
  } finally {
    await clearAuthTokens();
  }
}

export async function logoutAll() {
  try {
    await request('/v1/auth/logout-all/', { method: 'POST' });
  } finally {
    await clearAuthTokens();
  }
}
