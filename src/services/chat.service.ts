import { apiFetch } from './api';
import { ChatMessage } from '../types';

export interface ChatApiResponse {
  ok: boolean;
  reply: string;
  urgent: boolean;
  suggestAppointment: boolean;
  source: string;
}

/** Send ordered user/assistant turns only (no empty/system noise). */
export function prepareChatPayload(messages: ChatMessage[]): ChatMessage[] {
  return messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role, content: String(m.content || '').trim() }))
    .filter((m) => m.content.length > 0)
    .slice(-20);
}

export const chatService = {
  async sendMessage(messages: ChatMessage[]): Promise<ChatApiResponse> {
    return apiFetch<ChatApiResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ messages: prepareChatPayload(messages) })
    });
  }
};
