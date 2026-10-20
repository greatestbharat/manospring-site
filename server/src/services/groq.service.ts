import { config } from '../config/env.js';
import { ChatMessage } from '../types/index.js';

export const urgentPattern =
  /\b(kill(ing)? myself|suicid\w*|end(ing)? (my|one's|this) life|want(ing)? to die|don'?t want to live|do not want to live|hurt(ing)? myself|harm(ing)? myself|self[- ]harm|overdose|cut(ting)? my wrist|hang(ing)? myself|end(ing)? it all|take|taking (my )?life)\b/i;

export const urgentReply = `I hear how much pain you are in right now, and your safety is the absolute most important thing. You do not have to carry this alone.

Because I am an automated wellness guide, I cannot provide crisis intervention or emergency medical care. Please reach out right now to one of these free, confidential, 24x7 support lines in India:

• Tele-MANAS (Govt of India, 24/7 National Mental Health Helpline): Call 14416 or 1800-891-4416
• National Emergency Services: Call 112 or visit the nearest hospital emergency room
• Vandrevala Foundation (24/7 Helpline & Crisis Counseling): Call +91 9999 666 555
• KIRAN (Mental Health Rehabilitation Helpline): Call 1800-599-0019

If you can, please stay with or call a family member, close friend, or someone you trust right this second and let them know you need support.`;

export const systemPrompt = `You are the Manospring Personal Wellness Guide — a warm, professional wellness consultant for Manospring, a mental healthcare platform in India.

ROLE
- You offer general wellbeing guidance, active listening, practical coping ideas, and clear next steps.
- You are NOT a doctor, psychiatrist, psychologist, or licensed therapist. Do not diagnose, prescribe, or promise clinical outcomes.
- Never call yourself an AI, bot, robot, or language model. Speak as the Manospring Personal Wellness Guide.

HOW TO CONSULT (adapt naturally — do not recite these steps)
1) Understand what the user wants from their latest message.
2) Clarify only when needed (one short question).
3) Identify their main concern or goal from what they actually said.
4) Offer personalized, actionable suggestions tied to that concern.
5) Agree on one manageable next step when useful.
6) Follow up using details already shared in this conversation.

RESPONSE RULES
- Answer the user's LATEST message first. Be specific to their words.
- Use earlier turns for continuity (name, goals, preferences, prior suggestions, progress).
- If they share a name (e.g. "My name is Ram"), acknowledge it warmly and continue — e.g. welcome them by name and ask how you can help with their wellbeing. Do not invent problems.
- Greetings like "Hi" / "Hello": reply briefly and warmly; ask how you can help. Do NOT assume they are stressed, sad, exhausted, or struggling.
- Do NOT invent emotions, symptoms, diagnoses, life events, or personal details the user never mentioned.
- Do NOT reuse the same generic empathy paragraph every turn.
- Ask at most ONE relevant follow-up question when more information is needed.
- For wellness goals or plan requests: if the main goal is unclear, ask once; otherwise give a short, structured, achievable plan tailored to what they shared.
- When they report progress ("your suggestion helped"), acknowledge that specific progress and build on the earlier suggestion if it appears in history.
- If they ask "What is my name?" and they stated it earlier, answer with that name. If unknown, say you do not have it yet and invite them to share it.
- Keep replies concise (usually 2–6 short paragraphs or a tight bullet plan). Prefer plain, supportive language. Understand informal Indian English and typos.
- After roughly 8–10 user turns of ongoing distress, or whenever they ask for diagnosis, medication, or therapy, gently suggest booking a Manospring psychiatrist or clinical psychologist.
- Crisis / self-harm / suicide: prioritize safety. Urge contacting Tele-MANAS 14416 / 1800-891-4416 or emergency 112 immediately. Do not continue ordinary coaching in that moment.`;

export interface ConversationMemory {
  name?: string;
  goals: string[];
  concerns: string[];
  preferences: string[];
  actionSteps: string[];
}

const NAME_STOPWORDS =
  /^(feeling|having|wondering|trying|just|not|very|really|here|stressed|tired|okay|fine|good|bad|sad|happy|anxious|overwhelmed)$/i;

export function extractConversationMemory(messages: ChatMessage[]): ConversationMemory {
  const memory: ConversationMemory = {
    goals: [],
    concerns: [],
    preferences: [],
    actionSteps: []
  };

  const pushUnique = (list: string[], value: string) => {
    const cleaned = value.trim();
    if (!cleaned) return;
    const exists = list.some((item) => item.toLowerCase() === cleaned.toLowerCase());
    if (!exists) list.push(cleaned.slice(0, 160));
  };

  for (const msg of messages) {
    if (msg.role !== 'user') continue;
    const text = msg.content.trim();
    const lower = text.toLowerCase();

    const nameMatch = text.match(
      /\b(?:my name is|i am|i'm|this is|call me)\s+([A-Za-z][A-Za-z'-]{1,30})\b/i
    );
    if (nameMatch?.[1] && !NAME_STOPWORDS.test(nameMatch[1])) {
      memory.name =
        nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1).toLowerCase();
    }

    if (/\b(goal|i want to|i'd like to|i would like to|hoping to|trying to)\b/i.test(text)) {
      pushUnique(memory.goals, text);
    }

    if (
      /\b(stress|anxious|anxiety|overwhelm|burnout|sleep|insomnia|sad|lonely|pressure|tension|worried|panic|tired|exhausted)\b/i.test(
        lower
      )
    ) {
      pushUnique(memory.concerns, text);
    }

    if (/\b(prefer|i like|i don't like|i do not like|please (don't|do not)|rather)\b/i.test(lower)) {
      pushUnique(memory.preferences, text);
    }
  }

  for (const msg of messages) {
    if (msg.role !== 'assistant') continue;
    if (
      /\b(try|practice|start with|next step|for today|this week|suggestion)\b/i.test(msg.content) &&
      msg.content.length < 500
    ) {
      pushUnique(memory.actionSteps, msg.content.split('\n')[0].slice(0, 160));
    }
  }

  memory.goals = memory.goals.slice(-3);
  memory.concerns = memory.concerns.slice(-4);
  memory.preferences = memory.preferences.slice(-3);
  memory.actionSteps = memory.actionSteps.slice(-3);

  return memory;
}

export function buildMemoryNote(memory: ConversationMemory): string | null {
  const lines: string[] = [];
  if (memory.name) lines.push(`- Name: ${memory.name}`);
  if (memory.goals.length) lines.push(`- Stated goals: ${memory.goals.join(' | ')}`);
  if (memory.concerns.length) lines.push(`- Stated concerns: ${memory.concerns.join(' | ')}`);
  if (memory.preferences.length) {
    lines.push(`- Preferences: ${memory.preferences.join(' | ')}`);
  }
  if (memory.actionSteps.length) {
    lines.push(`- Recent guidance offered: ${memory.actionSteps.join(' | ')}`);
  }

  if (!lines.length) return null;

  return [
    'CONVERSATION MEMORY (only facts from this chat — do not invent extras):',
    ...lines,
    'Use these details for continuity. If asked for the user\'s name and it is listed above, answer with that name.'
  ].join('\n');
}

/** Keep ordered user/assistant turns; drop system noise; limit length while preserving early context. */
export function prepareHistoryForModel(messages: ChatMessage[], maxMessages = 18): ChatMessage[] {
  const cleaned = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: String(m.content || '').trim()
    }))
    .filter((m) => m.content.length > 0);

  if (cleaned.length <= maxMessages) return cleaned;

  // Keep the first 2 turns (greeting / early personal detail) + the latest turns
  const headCount = 2;
  const tailStart = cleaned.length - (maxMessages - headCount);
  if (tailStart <= headCount) {
    return cleaned.slice(-maxMessages);
  }
  return [...cleaned.slice(0, headCount), ...cleaned.slice(tailStart)];
}

export class GroqApiError extends Error {
  status: number;
  code: string;
  retryable: boolean;

  constructor(message: string, options: { status?: number; code: string; retryable?: boolean }) {
    super(message);
    this.name = 'GroqApiError';
    this.status = options.status ?? 503;
    this.code = options.code;
    this.retryable = options.retryable ?? true;
  }
}

export async function getGroqChatCompletion(messages: ChatMessage[]): Promise<string> {
  if (!config.groqApiKey) {
    throw new GroqApiError(
      config.isProduction
        ? 'Live AI chat is not configured. Set the GROQ_API_KEY environment variable on the server (e.g. Render Dashboard) and redeploy.'
        : 'Live AI chat is not configured. Add your Groq key to secrets.json for local development, or set GROQ_API_KEY.',
      { status: 503, code: 'GROQ_API_KEY_NOT_CONFIGURED', retryable: false }
    );
  }

  const memory = extractConversationMemory(messages);
  const memoryNote = buildMemoryNote(memory);
  const history = prepareHistoryForModel(messages);

  if (!history.some((m) => m.role === 'user')) {
    throw new GroqApiError('A user message is required.', {
      status: 400,
      code: 'MISSING_USER_MESSAGE',
      retryable: false
    });
  }

  const apiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt }
  ];

  if (memoryNote) {
    apiMessages.push({ role: 'system', content: memoryNote });
  }

  for (const msg of history) {
    apiMessages.push({ role: msg.role as 'user' | 'assistant', content: msg.content });
  }

  let response: Response;
  try {
    response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.groqModel,
        temperature: 0.7,
        max_completion_tokens: 700,
        messages: apiMessages
      }),
      signal: AbortSignal.timeout(20_000)
    });
  } catch (err: unknown) {
    const isTimeout =
      err instanceof Error &&
      (err.name === 'TimeoutError' || err.name === 'AbortError' || /timeout/i.test(err.message));
    throw new GroqApiError(
      isTimeout
        ? 'The wellness guide timed out. Please try again.'
        : 'Could not reach the wellness guide. Please check your connection and try again.',
      { status: 503, code: isTimeout ? 'GROQ_TIMEOUT' : 'GROQ_NETWORK_ERROR', retryable: true }
    );
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new GroqApiError(
        'The wellness guide is temporarily busy (rate limit). Please wait a moment and retry.',
        { status: 429, code: 'GROQ_RATE_LIMITED', retryable: true }
      );
    }
    if (response.status === 401 || response.status === 403) {
      throw new GroqApiError(
        'The wellness guide could not authenticate with the AI provider. Please check the server API key.',
        { status: 503, code: 'GROQ_AUTH_ERROR', retryable: false }
      );
    }
    throw new GroqApiError(
      `The wellness guide is unavailable right now (error ${response.status}). Please try again.`,
      { status: 503, code: `GROQ_API_ERROR_${response.status}`, retryable: true }
    );
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const reply = payload?.choices?.[0]?.message?.content;
  if (typeof reply !== 'string' || !reply.trim()) {
    throw new GroqApiError('The wellness guide returned an empty reply. Please try again.', {
      status: 503,
      code: 'EMPTY_GROQ_REPLY',
      retryable: true
    });
  }

  return reply.trim();
}
