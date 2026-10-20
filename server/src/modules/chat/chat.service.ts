import { ChatMessage } from '../../types/index.js';
import {
  urgentPattern,
  urgentReply,
  getGroqChatCompletion,
  GroqApiError
} from '../../services/groq.service.js';

export interface ChatResponseResult {
  reply: string;
  urgent: boolean;
  crisis: boolean;
  suggestAppointment: boolean;
  source: 'groq' | 'crisis_safety';
  retryable?: boolean;
}

export class ChatService {
  public async processChat(messages: ChatMessage[]): Promise<ChatResponseResult> {
    const normalized = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: String(m.content || '').trim()
      }))
      .filter((m) => m.content.length > 0);

    const lastUser = [...normalized].reverse().find((m) => m.role === 'user');
    if (!lastUser) {
      throw new GroqApiError('A user message is required.', {
        status: 400,
        code: 'MISSING_USER_MESSAGE',
        retryable: false
      });
    }

    // Immediate crisis detection — safety path (not a generic empathy fallback)
    if (urgentPattern.test(lastUser.content)) {
      return {
        reply: urgentReply,
        urgent: true,
        crisis: true,
        suggestAppointment: false,
        source: 'crisis_safety'
      };
    }

    const userTurns = normalized.filter((m) => m.role === 'user').length;
    const wantsConsultation =
      /\b(book|appointment|psychiat|doctor|therapist|clinician|cost|fees|consult)\b/i.test(
        lastUser.content
      );
    const suggestAppointment = userTurns >= 8 || wantsConsultation;

    // Live AI only — do not silently replace failures with generic local copy
    const reply = await getGroqChatCompletion(normalized);
    return {
      reply,
      urgent: false,
      crisis: false,
      suggestAppointment,
      source: 'groq'
    };
  }
}

export const chatService = new ChatService();
