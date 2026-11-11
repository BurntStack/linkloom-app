import { CampaignUsageRights } from '../data';
import { queryString, request, requestPage, rupeesToPaise } from './client';

export async function getCampaigns(cursor?: string) {
  return requestPage<any>(`/v1/campaigns/${queryString({ limit: 50, cursor })}`);
}

export async function createCampaign(input: {
  title: string; brief: string; platform: string; deliverables: string; budgetMin: number; budgetMax: number;
  closesAt?: string; usageRights?: CampaignUsageRights;
}) {
  return request<any>('/v1/campaigns/', {
    method: 'POST',
    body: JSON.stringify({
      ...input,
      platform: input.platform.trim().toLowerCase(),
      budgetMin: rupeesToPaise(input.budgetMin),
      budgetMax: rupeesToPaise(input.budgetMax),
    }),
  });
}

export async function getCampaign(id: string) {
  return request<any>(`/v1/campaigns/${encodeURIComponent(id)}/`);
}

export async function updateCampaign(id: string, input: Partial<{
  title: string; brief: string; platform: string; deliverables: string; budgetMin: number; budgetMax: number;
  closesAt: string; usageRights: CampaignUsageRights;
}>) {
  const body = {
    ...input,
    ...(input.platform ? { platform: input.platform.trim().toLowerCase() } : {}),
    ...(input.budgetMin !== undefined ? { budgetMin: rupeesToPaise(input.budgetMin) } : {}),
    ...(input.budgetMax !== undefined ? { budgetMax: rupeesToPaise(input.budgetMax) } : {}),
  };
  return request<any>(`/v1/campaigns/${encodeURIComponent(id)}/`, { method: 'PATCH', body: JSON.stringify(body) });
}

export async function closeCampaign(id: string) {
  return request<any>(`/v1/campaigns/${encodeURIComponent(id)}/close/`, { method: 'POST' });
}

export async function getCampaignBids(campaignId: string, cursor?: string) {
  return requestPage<any>(`/v1/campaigns/${encodeURIComponent(campaignId)}/bids/${queryString({ limit: 50, cursor })}`);
}

export async function submitCampaignBid(campaignId: string, input: { price: number; message: string; expectedViews?: number; deliveryDays?: number }) {
  return request<any>(`/v1/campaigns/${encodeURIComponent(campaignId)}/bids/`, {
    method: 'POST',
    body: JSON.stringify({ ...input, price: rupeesToPaise(input.price) }),
  });
}

export async function updateCampaignBid(campaignId: string, bidId: string, input: Partial<{ price: number; message: string; expectedViews: number; deliveryDays: number }>) {
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
