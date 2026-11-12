import { queryString, request, requestPage } from './client';

export async function getConversations(cursor?: string) {
  return requestPage<any>(`/v1/conversations/${queryString({ limit: 50, cursor })}`);
}

export async function startConversation(input: { creatorId?: string; brandId?: string }) {
  if (!input.creatorId && !input.brandId) {
    throw new Error('Provide a creatorId or brandId to start a conversation.');
  }
  return request<any>('/v1/conversations/', { method: 'POST', body: JSON.stringify(input) });
}

export async function getConversationMessages(conversationId: string, cursor?: string) {
  return requestPage<any>(
    `/v1/conversations/${encodeURIComponent(conversationId)}/messages/${queryString({ limit: 50, cursor })}`,
  );
}

export async function sendConversationMessage(conversationId: string, content: string) {
  const message = content.trim();
  if (!message) throw new Error('Enter a message before sending.');
  return request<any>(`/v1/conversations/${encodeURIComponent(conversationId)}/messages/`, {
    method: 'POST',
    body: JSON.stringify({ content: message }),
  });
}
