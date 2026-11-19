import { CampaignUsageRights } from '../data';
import { queryString, request, requestPage, rupeesToPaise } from './client';

function apiUsageRights(rights?: CampaignUsageRights) {
  if (!rights) return undefined;
  return {
    duration: rights.duration,
    channels: rights.channels,
    exclusivity: rights.exclusivity,
    territory: rights.territory,
  };
}

export async function getCampaigns(cursor?: string, filters: {
  status?: 'open' | 'draft'; platform?: string; category?: string; budgetMin__gte?: number; budgetMax__lte?: number; search?: string;
} = {}) {
  const { budgetMin__gte, budgetMax__lte, ...otherFilters } = filters;
  return requestPage<any>(`/v1/campaigns/${queryString({
    limit: 50, cursor, ...otherFilters,
    ...(budgetMin__gte !== undefined ? { budgetMin__gte: rupeesToPaise(budgetMin__gte) } : {}),
    ...(budgetMax__lte !== undefined ? { budgetMax__lte: rupeesToPaise(budgetMax__lte) } : {}),
    ...(otherFilters.platform ? { platform: otherFilters.platform.trim().toLowerCase() } : {}),
  })}`);
}

export async function createCampaign(input: {
  title: string; brief: string; platform: string; deliverables: string; budgetMin: number; budgetMax: number;
  closesAt?: string; status?: 'open' | 'draft'; usageRights?: CampaignUsageRights;
}) {
  const { usageRights, ...campaign } = input;
  return request<any>('/v1/campaigns/', {
    method: 'POST',
    body: JSON.stringify({
      ...campaign,
      platform: input.platform.trim().toLowerCase(),
      budgetMin: rupeesToPaise(input.budgetMin),
      budgetMax: rupeesToPaise(input.budgetMax),
      status: input.status || 'open',
      ...(usageRights ? { usageRights: apiUsageRights(usageRights) } : {}),
    }),
  });
}

export async function getCampaign(id: string) {
  return request<any>(`/v1/campaigns/${encodeURIComponent(id)}/`);
}

export async function updateCampaign(id: string, input: Partial<{
  title: string; brief: string; platform: string; deliverables: string; budgetMin: number; budgetMax: number;
  closesAt: string; status: 'open' | 'draft'; usageRights: CampaignUsageRights;
}>) {
  const { usageRights, ...campaign } = input;
  const body = {
    ...campaign,
    ...(input.platform ? { platform: input.platform.trim().toLowerCase() } : {}),
    ...(input.budgetMin !== undefined ? { budgetMin: rupeesToPaise(input.budgetMin) } : {}),
    ...(input.budgetMax !== undefined ? { budgetMax: rupeesToPaise(input.budgetMax) } : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(usageRights ? { usageRights: apiUsageRights(usageRights) } : {}),
  };
  return request<any>(`/v1/campaigns/${encodeURIComponent(id)}/`, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function closeCampaign(id: string) {
  return request<any>(`/v1/campaigns/${encodeURIComponent(id)}/close/`, { method: 'POST' });
}

export async function getCampaignBids(campaignId: string, cursor?: string) {
  return requestPage<any>(`/v1/campaigns/${encodeURIComponent(campaignId)}/bids/${queryString({ limit: 50, cursor })}`);
}

export async function submitCampaignBid(campaignId: string, input: { price: number; message: string; deliveryDays?: number }) {
  return request<any>(`/v1/campaigns/${encodeURIComponent(campaignId)}/bids/`, {
    method: 'POST',
    body: JSON.stringify({ price: rupeesToPaise(input.price), message: input.message, deliveryDays: input.deliveryDays }),
  });
}

export async function updateCampaignBid(campaignId: string, bidId: string, input: Partial<{ price: number; message: string; deliveryDays: number }>) {
  const body = {
    ...input,
    ...(input.price !== undefined ? { price: rupeesToPaise(input.price) } : {}),
  };
  return request<any>(`/v1/campaigns/${encodeURIComponent(campaignId)}/bids/${encodeURIComponent(bidId)}/`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export async function withdrawCampaignBid(campaignId: string, bidId: string) {
  return request<any>(`/v1/campaigns/${encodeURIComponent(campaignId)}/bids/${encodeURIComponent(bidId)}/withdraw/`, { method: 'POST' });
}

export async function selectCampaignBid(campaignId: string, bidId: string) {
  return request<any>(`/v1/campaigns/${encodeURIComponent(campaignId)}/bids/${encodeURIComponent(bidId)}/select/`, { method: 'POST' });
}

export async function getCreatorCampaigns(cursor?: string) {
  return requestPage<any>(`/v1/creators/me/campaigns/${queryString({ limit: 50, cursor })}`);
}
