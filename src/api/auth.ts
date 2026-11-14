import * as SecureStore from 'expo-secure-store';
import { ApiError, clearAuthTokens, REFRESH_KEY, request, saveAuthTokens } from './client';
import { AuthChannel, AuthRole } from './types';

export async function requestAuthOtp(input: {
  channel: AuthChannel;
  destination: string;
}) {
  return request<{ challengeId: string; expiresIn: number }>('/v1/auth/otp/request/', {
    method: 'POST',
    body: JSON.stringify(input),
  }, false);
}

export async function loginWithPassword(identifier: string, password: string) {
  const session = await request<{ access: string; refresh: string; user: any }>('/v1/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  }, false);
  if (!session?.access || !session.refresh || !session.user) {
    throw new ApiError('The server returned incomplete login details.', 200);
  }
  await saveAuthTokens(session.access, session.refresh);
  return session;
}

export async function loginWithGoogle(idToken: string, role?: AuthRole) {
  const session = await request<{ access: string; refresh: string; user: any }>('/v1/auth/google/', {
    method: 'POST',
    body: JSON.stringify({ idToken, ...(role ? { role } : {}) }),
  }, false);
  if (!session?.access || !session.refresh || !session.user) {
    throw new ApiError('The server returned incomplete login details.', 200);
  }
  await saveAuthTokens(session.access, session.refresh);
  return session;
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
  password?: string;
  confirmPassword?: string;
}) {
  return request<any>('/v1/auth/signup/complete/', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function getCurrentUser() {
  return request<any>('/v1/auth/me/');
}

export async function updateCurrentUser(input: { email?: string; fullName?: string }) {
  return request<any>('/v1/auth/me/', { method: 'PATCH', body: JSON.stringify(input) });
}

export async function requestEmailVerification(email: string) {
  return request<{ challengeId: string }>('/v1/auth/email/request/', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export async function verifyEmail(challengeId: string, code: string) {
  return request<any>('/v1/auth/email/verify/', {
    method: 'POST',
    body: JSON.stringify({ challengeId, code }),
  });
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
