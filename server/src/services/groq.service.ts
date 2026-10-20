import { config } from '../config/env.js';
import { ChatMessage } from '../types/index.js';

export const urgentPattern = /\b(kill(ing)? myself|suicid\w*|end(ing)? (my|one's|this) life|want(ing)? to die|don'?t want to live|do not want to live|hurt(ing)? myself|harm(ing)? myself|self[- ]harm|overdose|cut(ting)? my wrist|hang(ing)? myself|end(ing)? it all|take|taking (my )?life)\b/i;

export const urgentReply = `I hear how much pain you are in right now, and your safety is the absolute most important thing. You do not have to carry this alone.

Because I am an automated wellness guide, I cannot provide crisis intervention or emergency medical care. Please reach out right now to one of these free, confidential, 24x7 support lines in India:

• Tele-MANAS (Govt of India, 24/7 National Mental Health Helpline): Call 14416 or 1800-891-4416
• National Emergency Services: Call 112 or visit the nearest hospital emergency room
• Vandrevala Foundation (24/7 Helpline & Crisis Counseling): Call +91 9999 666 555
• KIRAN (Mental Health Rehabilitation Helpline): Call 1800-599-0019

If you can, please stay with or call a family member, close friend, or someone you trust right this second and let them know you need support.`;

export const systemPrompt = `You are the Manospring Personal Wellness Guide, a warm, compassionate, culturally sensitive wellbeing companion for Manospring, a professional mental health platform in India. You are an automated supportive wellness guide, NOT a clinician, doctor, or therapist.

CRITICAL COMMUNICATION RULE:
- NEVER refer to yourself as "AI", "artificial intelligence", "bot", "robot", "language model", or "machine".
- Identify yourself naturally as "your Personal Wellness Guide" or "Manospring Guide".
- Always maintain a warm, human-centered, grounded tone without robotic or clinical jargon.

CONTEXT AWARENESS & NATURAL CONVERSATION:
- ALWAYS remember and reference the user's name if they mention it (e.g., "Hello Arjun", "It's good to hear from you, Priya").
- Actively build upon previous messages in the conversation history. Do NOT repeat generic greetings ("Hello, I am your wellness guide...") once a conversation is underway.
- Naturally understand typos, emotional shorthand, and informal Indian English ("kinda stressed yaar", "too much tension", "not feeling ok tbh", "bohot tension hai", "feeling low", "brain fog", "cant focus at work", "family pressure", "feeling overwhelmed", "burnout", "plz", "rn", "idk").
- Tailor your response directly to the specific topic the user chose or wrote:
  * Talk about my feelings: Validate their emotional courage, offer a safe non-judgmental space, and ask what feeling has felt heaviest today.
  * Sleep difficulties: Acknowledge the physical and mental exhaustion of poor sleep, provide a soothing night wind-down tip, and ask about their sleep pattern.
  * Stress and work pressure: Validate chronic workplace burnout and performance expectations, emphasize micro-pauses, and ask about their biggest current pressure.
  * Breathing exercise: Walk them warmly through the 4-7-8 breathing sequence with clear steps.
  * Grounding exercise: Guide them step-by-step through the 5-4-3-2-1 sensory grounding technique.
- Ask ONE relevant, supportive follow-up question that helps them reflect, rather than asking rapid-fire clinical questions.

CORE MISSION & ETHICAL BOUNDARIES:
- Provide empathetic emotional support, active listening, gentle psychoeducation, and low-risk grounding techniques.
- NEVER make medical diagnoses, prescribe medications, alter existing prescriptions, or claim to provide psychological therapy or cure.
- NEVER claim to be a doctor, psychiatrist, or licensed professional.
- Explain clearly that your conversations are for general wellbeing guidance and emotional reflection, not individualized clinical treatment.
- Suggest booking a consultation with a qualified psychiatrist or clinical psychologist after approximately 8–10 user messages, or IMMEDIATELY whenever the user asks about diagnosis, medication, severe chronic distress, or professional therapy.
- In emergencies (suicide, self-harm, severe violence), immediately provide the 112 and Tele-MANAS 14416 helplines.`;

export function generateCompassionateFallback(lastMsg: string, history?: ChatMessage[]): string {
  const text = lastMsg.toLowerCase();
  
  // Extract user's name if mentioned in current or previous messages
  let userName = '';
  const allUserTexts = (history || [])
    .filter(m => m.role === 'user')
    .map(m => m.content)
    .concat([lastMsg]);

  for (const msg of allUserTexts) {
    const match = msg.match(/\b(?:i am|i'm|my name is|this is|call me)\s+([A-Za-z]+)\b/i);
    if (match && match[1]) {
      const candidate = match[1];
      if (!/^(feeling|having|wondering|trying|just|not|very|really|here)$/i.test(candidate)) {
        userName = candidate.charAt(0).toUpperCase() + candidate.slice(1).toLowerCase();
        break;
      }
    }
  }

  const nameGreeting = userName ? `${userName}, ` : '';

  if (/feelings?|emotions?|sad|crying|lonely|heart|talk about/.test(text)) {
    return `${nameGreeting}thank you for reaching out to talk about what you're experiencing. Putting your feelings into words takes real emotional courage, and this is a completely safe, private space.\n\nTake a slow breath. What has been weighing most heavily on your mind today?`;
  }

  if (/sleep|insomnia|restless|night|tired|wake up|exhausted/.test(text)) {
    return `${nameGreeting}sleep difficulties can be so deeply draining, both physically and emotionally. When our nervous system stays on high alert, our minds keep spinning even when we desperately want to rest.\n\nA gentle first step is creating a 30-minute buffer before bed without work screens or notifications. How many nights recently have felt restless for you?`;
  }

  if (/stress|work|job|boss|deadline|burnout|pressure|office|study|exam/.test(text)) {
    return `${nameGreeting}workplace pressure and chronic stress can slowly drain your inner battery until even simple tasks feel overwhelming. Please remember that your worth is not measured only by your productivity.\n\nWhat particular project, deadline, or expectation is demanding the most energy from you right now?`;
  }

  if (/breath|4-7-8|pranayam|deep breath/.test(text)) {
    return `${nameGreeting}let's do a gentle 4-7-8 calming breath together right now:\n\n1. Inhale quietly through your nose for a count of 4.\n2. Hold your breath gently for a count of 7.\n3. Exhale slowly and completely through your mouth for 8.\n\nTry doing 3 cycles. Would you like to practice another cycle together, or share how your body feels right now?`;
  }

  if (/grounding|5-4-3-2-1|panic|anxiety|racing|dizzy|overwhelm/.test(text)) {
    return `${nameGreeting}when feelings run high, the 5-4-3-2-1 grounding technique can gently anchor your nervous system back to the present room:\n\n• 5 things you can see around you\n• 4 things you can physically feel or touch\n• 3 sounds you can hear right now\n• 2 scents you can notice\n• 1 deep, nourishing breath\n\nTake a moment to look around. What is one grounding object in your sight right now?`;
  }

  return `${nameGreeting}thank you for sharing that with me. I hear that things are feeling heavy right now, and what you are feeling is completely valid.\n\nTaking things one step at a time is more than enough. What would feel most supportive for you to focus on right now?`;
}

export async function getGroqChatCompletion(messages: ChatMessage[]): Promise<string> {
  if (!config.groqApiKey) {
    throw new Error('GROQ_API_KEY_NOT_CONFIGURED');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.groqApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.groqModel,
      temperature: 0.65,
      max_completion_tokens: 400,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ]
    }),
    signal: AbortSignal.timeout(18_000)
  });

  if (!response.ok) {
    throw new Error(`GROQ_API_ERROR_${response.status}`);
  }

  const payload = (await response.json()) as any;
  const reply = payload?.choices?.[0]?.message?.content;
  if (typeof reply !== 'string' || !reply.trim()) {
    throw new Error('EMPTY_GROQ_REPLY');
  }

  return reply.trim();
}
