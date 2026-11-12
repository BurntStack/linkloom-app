import { queryString, request, requestPage, rupeesToPaise } from './client';

export async function getCreatorProfile() {
  return request<any>('/v1/creators/me/');
}

export async function saveCreatorProfile(profile: {
  displayName: string; bio?: string; categories?: string[]; location?: string; primaryPlatform?: string; repliesWithin?: number;
  dob?: string; gender?: string; socialAccounts?: { platform: string; handle: string }[];
}) {
  return request<any>('/v1/creators/me/', {
    method: 'PATCH',
    body: JSON.stringify({
      ...profile,
      ...(profile.primaryPlatform ? { primaryPlatform: profile.primaryPlatform.trim().toLowerCase() } : {}),
    }),
  });
}

export async function uploadCreatorAvatar(file: { uri: string; name: string; type: string }) {
  const form = new FormData();
  form.append('file', file as unknown as Blob);
  return request<any>('/v1/creators/me/avatar/', { method: 'POST', body: form });
}

export async function getCreatorPackages(cursor?: string) {
  return requestPage<any>(`/v1/creators/me/packages/${queryString({ limit: 50, cursor })}`);
}

export async function createCreatorPackage(input: {
  title: string; description: string; platform: string; deliverables: string; price: number; deliveryDays: number; active?: boolean;
}) {
  return request<any>('/v1/creators/me/packages/', {
    method: 'POST',
    body: JSON.stringify({ ...input, platform: input.platform.trim().toLowerCase(), price: rupeesToPaise(input.price) }),
  });
}

export async function updateCreatorPackage(id: string, input: Partial<{
  title: string; description: string; platform: string; deliverables: string; price: number; deliveryDays: number; active: boolean;
}>) {
  const body = {
    ...input,
    ...(input.platform ? { platform: input.platform.trim().toLowerCase() } : {}),
    ...(input.price !== undefined ? { price: rupeesToPaise(input.price) } : {}),
  };
  return request<any>(`/v1/creators/me/packages/${encodeURIComponent(id)}/`, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function deleteCreatorPackage(id: string) {
  return request(`/v1/creators/me/packages/${encodeURIComponent(id)}/`, { method: 'DELETE' });
}

export async function listCreators(params: { q?: string; category?: string; location?: string; platform?: string; minPrice?: number; maxPrice?: number; verified?: boolean; cursor?: string } = {}) {
  return requestPage<any>(`/v1/creators/${queryString({
    ...params,
    platform: params.platform?.trim().toLowerCase(),
    minPrice: params.minPrice === undefined ? undefined : rupeesToPaise(params.minPrice),
    maxPrice: params.maxPrice === undefined ? undefined : rupeesToPaise(params.maxPrice),
    limit: 50,
  })}`);
}

export async function getCreator(id: string) {
  return request<any>(`/v1/creators/${encodeURIComponent(id)}/`);
}

export async function getCreatorReviews(id: string, cursor?: string) {
  return requestPage<any>(`/v1/creators/${encodeURIComponent(id)}/reviews/${queryString({ limit: 50, cursor })}`);
}
