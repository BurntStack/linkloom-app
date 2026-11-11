import { ImageSourcePropType } from 'react-native';

export type CreatorPackage = {
  id: string;
  title: string;
  platform: string;
  deliverables: string;
  price: number;
  deliveryDays: number;
};

export type Creator = {
  id: string;
  name: string;
  city: string;
  cat: string;
  followers: string;
  platform: string;
  rating: number;
  price: number;
  badge?: string;
  bio: string;
  reach: string;
  eng: string;
  delivered: number;
  photo: ImageSourcePropType;
  portfolioPreview: ImageSourcePropType;
  packages?: CreatorPackage[];
};

export type CreatorAccountProfile = {
  creatorId?: string;
  name: string;
  email: string;
  mobile: string;
  dateOfBirth: string;
  gender: string;
  city: string;
  photoUrl: string;
  languages: string[];
  bio: string;
  platforms: { name: string; handle: string }[];
  categories?: string[];
  primaryPlatform?: string;
  repliesWithin?: number;
};

export type CampaignUsageRights = {
  duration: string;
  channels: string[];
  exclusivity: boolean;
  exclusivityCategory: string;
  territory: string;
};

export type Bid = {
  id: string;
  creatorId: string;
  creatorName?: string;
  creatorPhotoUrl?: string;
  price: number;
  note: string;
  proposal?: string;
  expectedViews?: number;
  deliveryDays?: number;
  postDate?: string;
  links?: string[];
  submittedAt?: string;
};

export type Job = {
  id: string;
  title: string;
  platform: string;
  deliverables: string;
  min: number;
  max: number;
  status: 'open' | 'progress' | 'completed';
  bidsCount: number;
  closes: string;
  bidders: string[];
  hired?: string;
  escrow?: number;
  bids: Bid[];
  description?: string;
  category?: string;
  city?: string;
  language?: string;
  usageRights?: CampaignUsageRights | string;
};

export type Order = {
  id: string;
  code: string;
  title: string;
  kind: string;
  creatorId: string;
  stage: 'working' | 'delivered' | 'released';
  held: number;
  fee: number;
  platformFee: number;
  gst: number;
  paidOn: string;
  draftDue: string;
  deliveredOn: string;
};
