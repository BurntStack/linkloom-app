import type { ImageSourcePropType } from 'react-native';
import { CREATORS, Creator, CreatorAccountProfile, Job, Bid } from '../data';
import { paiseToRupees, type BrandOnboarding } from '../api';

export const moneyInRupees = (value: any) => {
  if (typeof value === 'number') return paiseToRupees(value);
  if (typeof value?.paise === 'number') return paiseToRupees(value.paise);
  if (typeof value?.amount === 'number') return paiseToRupees(value.amount);
  return 0;
};

function stringList(value: unknown): string[] {
  const values = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
  return values
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

function creatorPlatforms(value: unknown): CreatorAccountProfile['platforms'] {
  const toPlatform = (name: unknown, account: unknown) => {
    const record = account && typeof account === 'object'
      ? account as Record<string, unknown>
      : undefined;
    const platformName = typeof name === 'string' && name.trim()
      ? name
      : record?.name || record?.platform;
    if (typeof platformName !== 'string' || !platformName.trim()) return null;
    const handle = typeof account === 'string'
      ? account
      : record?.handle || record?.username || record?.url;
    return {
      name: platformName.trim(),
      handle: typeof handle === 'string' ? handle : '',
    };
  };

  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      const platform = typeof item === 'string'
        ? toPlatform(item, undefined)
        : toPlatform(undefined, item);
      return platform ? [platform] : [];
    });
  }
  if (!value || typeof value !== 'object') return [];

  const record = value as Record<string, unknown>;
  if (typeof record.name === 'string' || typeof record.platform === 'string') {
    const platform = toPlatform(undefined, record);
    return platform ? [platform] : [];
  }
  return Object.entries(record).flatMap(([name, account]) => {
    const platform = toPlatform(name, account);
    return platform ? [platform] : [];
  });
}

export function mapCampaign(source: any): Job {
  source = source?.campaign || source?.job || source;
  const status = String(source.status || 'open').toLowerCase();
  const platform = String(source.platform || '');
  const moderation = source.moderation || {};
  return {
    id: String(source.id),
    title: source.title || '',
    platform: ({ instagram: 'Instagram', youtube: 'YouTube', tiktok: 'TikTok', ugc: 'UGC' } as Record<string, string>)[platform.toLowerCase()] || platform,
    deliverables: source.deliverables || '',
    min: moneyInRupees(source.budgetMin ?? source.budget_min),
    max: moneyInRupees(source.budgetMax ?? source.budget_max),
    status: status === 'draft' ? 'draft' : status === 'completed' || status === 'closed' ? 'completed' : status === 'progress' || status === 'in_progress' ? 'progress' : 'open',
    bidsCount: source.bidCount ?? source.bid_count ?? source.bidsCount ?? source.bids_count ?? 0,
    closes: source.closesAt || source.closes_at || '',
    moderationStatus: source.moderationStatus || source.moderation_status || moderation.status,
    moderationReason: source.moderationReason || source.moderation_reason || moderation.reason || '',
    bidders: [],
    bids: [],
    description: source.brief || '',
    category: source.category || '',
    city: source.city || '',
    language: source.language || '',
    usageRights: source.usageRights || source.usage_rights || '',
  };
}

export function mapBid(source: any): Bid {
  source = source?.bid || source?.proposal || source?.application || source;
  const creator = source.creator || {};
  const price = source.price?.amount ?? source.price;
  const decision = source.decisionStatus || source.decision_status || source.decision;
  const viewedAt = source.viewedAt || source.viewed_at || source.seenAt || source.seen_at;
  const hasBeenViewed = source.viewed === true || source.isViewed === true || source.is_viewed === true ||
    source.viewedByBrand === true || source.viewed_by_brand === true ||
    source.brandViewed === true || source.brand_viewed === true || Boolean(viewedAt);
  const status = typeof decision === 'string' && decision
    ? decision
    : hasBeenViewed ? 'viewed' : source.status || source.bidStatus || source.bid_status;
  return {
    id: String(source.id || source.bidId || source.bid_id || ''),
    creatorId: String(source.creatorId ?? source.creator_id ?? creator.id ?? ''),
    creatorName: source.creatorName || source.creator_name || creator.displayName || creator.display_name || creator.name || 'Creator',
    creatorPhotoUrl: source.creatorPhotoUrl || source.creator_photo_url || creator.avatarUrl || creator.avatar_url,
    status: typeof status === 'string' ? status : undefined,
    viewedAt,
    decision: typeof decision === 'string' ? decision : undefined,
    price: typeof price === 'number' ? paiseToRupees(price) : 0,
    note: source.message || '',
    proposal: source.message || '',
    expectedViews: source.expectedViews ?? source.expected_views,
    deliveryDays: source.deliveryDays ?? source.delivery_days,
    submittedAt: source.createdAt || source.created_at,
  };
}

export function mapOrder(source: any): any {
  const status = String(source.status || source.stage || 'working').toLowerCase();
  const total = source.total?.amount ?? source.total ?? source.amount?.amount ?? source.amount ??
    source.totalAmount ?? source.total_amount ?? source.price?.amount ?? source.price;
  return {
    ...source,
    id: String(source.id),
    code: source.code || source.orderNumber || source.order_number || String(source.id),
    title: source.title || source.campaign?.title || source.campaignTitle || source.campaign_title || 'Campaign order',
    kind: source.deliverables || source.kind || '',
    creatorId: String(source.creatorId ?? source.creator_id ?? source.creator?.id ?? ''),
    stage: status.includes('deliver') || status === 'submitted' ? 'delivered' : status.includes('complete') || status === 'approved' || status === 'released' ? 'released' : 'working',
    held: typeof total === 'number' ? paiseToRupees(total) : 0,
    fee: moneyInRupees(source.creatorFee ?? source.creator_fee ?? source.price),
    platformFee: moneyInRupees(source.platformFee ?? source.platform_fee),
    gst: moneyInRupees(source.tax),
    paidOn: source.createdAt || source.created_at || '',
    draftDue: source.dueAt || source.due_at || '',
    deliveredOn: source.deliveredAt || source.delivered_at || '',
    allowedActions: source.allowedActions || source.allowed_actions || [],
  };
}

export function mapDeliverable(source: any, order?: any) {
  const creator = source.creator || order?.creator || {};
  const campaign = source.campaign || order?.campaign || {};
  return {
    id: String(source.id),
    title: source.title || source.name || source.note || 'Campaign deliverable',
    by: creator.displayName || creator.display_name || creator.name || source.creatorName || 'Creator',
    date: source.createdAt || source.created_at || source.submittedAt || source.submitted_at || '',
    job: campaign.title || order?.title || source.campaignTitle || source.campaign_title || 'Campaign',
    status: source.status || 'Needs review',
    orderId: String(source.orderId ?? source.order_id ?? order?.id ?? ''),
    contentUrl: source.contentUrl || source.content_url || source.url || '',
    note: source.note || '',
  };
}

export function mapPackage(source: any) {
  const price = source.price?.amount ?? source.price;
  return {
    ...source,
    id: String(source.id),
    title: source.title || '',
    description: source.description || '',
    platform: source.platform || '',
    deliverables: source.deliverables || '',
    price: typeof price === 'number' ? paiseToRupees(price) : 0,
    deliveryDays: source.deliveryDays ?? source.delivery_days ?? 0,
  };
}

export function mapOffer(source: any) {
  const budget = source.budget?.amount ?? source.budget;
  return {
    ...source,
    id: String(source.id),
    creatorId: String(source.creatorId ?? source.creator_id ?? source.creator?.id ?? ''),
    creatorName: source.creator?.displayName || source.creator?.display_name || source.creator?.name || source.creatorName || 'Creator',
    deliverable: source.deliverable || '',
    budget: typeof budget === 'number' ? paiseToRupees(budget) : 0,
    status: source.status || 'pending',
    deadline: source.deadline || '',
    message: source.message || '',
  };
}

export function listCreatorIds(list: any): string[] {
  const members = list.creators || list.creatorIds || list.creator_ids || [];
  return members.map((creator: any) => String(typeof creator === 'object' ? creator.id ?? creator.creatorId ?? creator.creator_id : creator));
}

export function mapBrandProfile(source: any): BrandOnboarding {
  const record = source && typeof source === 'object' ? source : {};
  const profile = record.brand || record.profile || record.brandProfile || record.brand_profile || record;
  return {
    brandName: profile.name || profile.brandName || profile.brand_name || '',
    businessCategory: profile.industry || profile.businessCategory || profile.business_category || '',
    geographicalScope: profile.geographicalScope || profile.geographical_scope || '',
    regionState: profile.regionState || profile.region_state || profile.stateCode || profile.state_code || '',
    termsAccepted: true,
    city: profile.city || '',
    country: profile.country || '',
    firstName: profile.firstName || profile.first_name || '',
    lastName: profile.lastName || profile.last_name || '',
    mobile: profile.mobile || profile.phone || '',
    brandWebsite: profile.website || profile.brandWebsite || profile.brand_website || '',
    brandLogo: profile.logoUrl || profile.logo_url || profile.brandLogo || profile.brand_logo || '',
    legalName: profile.legalName || profile.legal_name || '',
    gstin: profile.gstin || '',
    stateCode: profile.stateCode || profile.state_code || '',
    billingAddress: profile.billingAddress || profile.billing_address || '',
  };
}

export function mapCreatorProfile(source: any): CreatorAccountProfile {
  const record = source && typeof source === 'object' ? source : {};
  const profile = record.creator || record.profile || record.creatorProfile || record.creator_profile || record;
  const platform = profile.primaryPlatform || profile.primary_platform;
  return {
    creatorId: String(profile.id || profile.creatorId || profile.creator_id || ''),
    name: profile.displayName || profile.display_name || profile.fullName || profile.full_name || profile.name || '',
    email: profile.email || '',
    mobile: profile.phone || profile.mobile || '',
    dateOfBirth: profile.dob || profile.dateOfBirth || profile.date_of_birth || '',
    gender: profile.gender || '',
    city: profile.location || profile.city || '',
    photoUrl: profile.avatarUrl || profile.avatar_url || profile.photoUrl || profile.photo_url || '',
    languages: stringList(profile.languages),
    bio: profile.bio || '',
    platforms: creatorPlatforms(profile.socialAccounts || profile.social_accounts || profile.platforms || (platform ? [{ name: platform, handle: '' }] : [])),
    categories: stringList(profile.categories),
    primaryPlatform: platform,
    repliesWithin: profile.repliesWithin || profile.replies_within,
  };
}

export function mapPublicCreator(source: any): Creator {
  const profile = source.creator || source.profile || source;
  const primaryPlatform = profile.primaryPlatform || profile.primary_platform || profile.platform || 'Other';
  const packagePrice = profile.startingPrice ?? profile.starting_price ?? profile.price;
  const avatar = profile.avatarUrl || profile.avatar_url || profile.photoUrl || profile.photo_url;
  return {
    id: String(profile.id || profile.creatorId || profile.creator_id || ''),
    name: profile.displayName || profile.display_name || profile.name || 'Creator',
    city: profile.location || profile.city || '',
    cat: (profile.categories || [])[0] || profile.category || '',
    followers: String(profile.followers ?? profile.followerCount ?? profile.follower_count ?? ''),
    platform: String(primaryPlatform),
    rating: Number(profile.rating ?? profile.averageRating ?? profile.average_rating ?? 0),
    price: moneyInRupees(packagePrice),
    verified: profile.verified === true || profile.isVerified === true || profile.is_verified === true,
    bio: profile.bio || '',
    reach: String(profile.reach ?? ''),
    eng: String(profile.engagementRate ?? profile.engagement_rate ?? ''),
    delivered: Number(profile.completedOrders ?? profile.completed_orders ?? 0),
    photo: (avatar ? { uri: avatar } : CREATORS[0].photo) as ImageSourcePropType,
    portfolioPreview: CREATORS[0].portfolioPreview,
    packages: (profile.packages || profile.packageOptions || []).map(mapPackage),
    ...(profile.badge ? { badge: profile.badge } : {}),
  };
}
