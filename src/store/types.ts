export type Sheet = { type: string; params?: any } | null;

export type ChatMessage = {
  id: string;
  sender: 'brand' | 'creator';
  text: string;
  sentAt: string;
};

export type Conversation = {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorPhotoUrl?: string;
  brandName?: string;
  jobId?: string;
  jobTitle?: string;
  messages: ChatMessage[];
};

