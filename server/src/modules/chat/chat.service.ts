import { ChatMessage } from '../../types/index.js';
import { urgentPattern, urgentReply, getGroqChatCompletion, generateCompassionateFallback } from '../../services/groq.service.js';

export interface ChatResponseResult {
  reply: string;
  urgent: boolean;
  crisis: boolean;
  suggestAppointment: boolean;
  source: 'groq' | 'local_wellness_engine';
}

export class ChatService {
  public async processChat(messages: ChatMessage[]): Promise<ChatResponseResult> {
    const lastUser = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUser) {
      throw new Error('A user message is required.');
    }

    // Immediate crisis detection
    if (urgentPattern.test(lastUser.content)) {
      return {
        reply: urgentReply,
        urgent: true,
        crisis: true,
        suggestAppointment: false,
        source: 'local_wellness_engine'
      };
    }

    const userTurns = messages.filter(m => m.role === 'user').length;
    const wantsConsultation = /\b(book|appointment|psychiat|doctor|therapist|clinician|cost|fees|consult)\b/i.test(lastUser.content);
    const suggestAppointment = userTurns >= 8 || wantsConsultation;

    try {
      const reply = await getGroqChatCompletion(messages);
      return {
        reply,
        urgent: false,
        crisis: false,
        suggestAppointment,
        source: 'groq'
      };
    } catch (err: any) {
      // Fallback gracefully to compassionate local mental wellness engine
      const fallbackReply = generateCompassionateFallback(lastUser.content, messages);
      return {
        reply: fallbackReply,
        urgent: false,
        crisis: false,
        suggestAppointment,
        source: 'local_wellness_engine'
      };
    }
  }
}

export const chatService = new ChatService();
