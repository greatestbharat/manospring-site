import { apiFetch } from './api';
import { ChatMessage } from '../types';

export interface ChatApiResponse {
  ok: boolean;
  reply: string;
  urgent: boolean;
  suggestAppointment: boolean;
  source: string;
}

export const chatService = {
  async sendMessage(messages: ChatMessage[]): Promise<ChatApiResponse> {
    return apiFetch<ChatApiResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({ messages })
    });
  }
};
