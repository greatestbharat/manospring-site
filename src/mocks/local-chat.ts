import { ChatMessage } from '../types';

/**
 * Browser-only wellness engine for GitHub Pages static builds.
 * Used when there is no Express/Groq backend. Not a substitute for live AI —
 * it is intentionally intent-aware so Pages demos stay coherent.
 */

export const urgentPattern =
  /\b(kill(ing)? myself|suicid\w*|end(ing)? (my|one's|this) life|want(ing)? to die|don'?t want to live|do not want to live|hurt(ing)? myself|harm(ing)? myself|self[- ]harm|overdose|cut(ting)? my wrist|hang(ing)? myself|end(ing)? it all|take|taking (my )?life)\b/i;

export const urgentReply = `I hear how much pain you are in right now, and your safety is the absolute most important thing. You do not have to carry this alone.

Because I am an automated wellness guide, I cannot provide crisis intervention or emergency medical care. Please reach out right now to one of these free, confidential, 24x7 support lines in India:

• Tele-MANAS (Govt of India, 24/7 National Mental Health Helpline): Call 14416 or 1800-891-4416
• National Emergency Services: Call 112 or visit the nearest hospital emergency room
• Vandrevala Foundation (24/7 Helpline & Crisis Counseling): Call +91 9999 666 555
• KIRAN (Mental Health Rehabilitation Helpline): Call 1800-599-0019

If you can, please stay with or call a family member, close friend, or someone you trust right this second and let them know you need support.`;

const NAME_STOPWORDS =
  /^(feeling|having|wondering|trying|just|not|very|really|here|stressed|tired|okay|fine|good|bad|sad|happy|anxious|overwhelmed)$/i;

type Memory = {
  name?: string;
  lastSuggestion?: string;
  concerns: string[];
  goals: string[];
};

function extractMemory(messages: ChatMessage[]): Memory {
  const memory: Memory = { concerns: [], goals: [] };

  for (const msg of messages) {
    if (msg.role !== 'user') continue;
    const text = msg.content.trim();
    const nameMatch = text.match(
      /\b(?:my name is|i am|i'm|this is|call me)\s+([A-Za-z][A-Za-z'-]{1,30})\b/i
    );
    if (nameMatch?.[1] && !NAME_STOPWORDS.test(nameMatch[1])) {
      memory.name =
        nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1).toLowerCase();
    }
    if (/\b(stress|work|time|sleep|anxious|overwhelm|burnout|sad|lonely)\b/i.test(text)) {
      memory.concerns.push(text);
    }
    if (/\b(goal|plan|want to|would like to)\b/i.test(text)) {
      memory.goals.push(text);
    }
  }

  for (const msg of [...messages].reverse()) {
    if (msg.role === 'assistant' && /\b(try|practice|next step|for today)\b/i.test(msg.content)) {
      memory.lastSuggestion = msg.content.split('\n')[0].slice(0, 140);
      break;
    }
  }

  return memory;
}

function withName(memory: Memory, sentence: string): string {
  return memory.name ? sentence.replace(/^/, `${memory.name}, `).replace(`${memory.name}, ${memory.name}`, memory.name) : sentence;
}

export function processLocalChat(messages: ChatMessage[]) {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUser) {
    throw new Error('A user message is required.');
  }

  if (urgentPattern.test(lastUser.content)) {
    return {
      ok: true,
      reply: urgentReply,
      urgent: true,
      crisis: true,
      suggestAppointment: false,
      source: 'crisis_safety'
    };
  }

  const memory = extractMemory(messages);
  const text = lastUser.content.trim();
  const lower = text.toLowerCase();
  const userTurns = messages.filter((m) => m.role === 'user').length;
  const wantsConsultation =
    /\b(book|appointment|psychiat|doctor|therapist|clinician|cost|fees|consult)\b/i.test(text);

  let reply = '';

  // Name recall
  if (/\b(what('?s| is) my name|do you remember my name|who am i)\b/i.test(lower)) {
    reply = memory.name
      ? `Your name is ${memory.name}. How would you like to continue with your wellbeing today?`
      : `I do not have your name yet in this conversation. What should I call you?`;
  }
  // Greeting only
  else if (/^(hi|hello|hey|namaste|good (morning|afternoon|evening))[\s!.]*$/i.test(lower)) {
    reply = memory.name
      ? `Hi ${memory.name} — welcome back. How can I help with your wellbeing today?`
      : `Hi there — welcome. I am your Personal Wellness Guide. How can I help with your wellbeing today?`;
  }
  // Introduces name
  else if (/\b(my name is|i am|i'm|call me)\s+[A-Za-z]/i.test(text) && memory.name) {
    reply = `Nice to meet you, ${memory.name}! How can I help you with your wellbeing today?`;
  }
  // Progress update
  else if (/\b(helped|helpful|better|worked|tried your suggestion|progress)\b/i.test(lower)) {
    const prior = memory.lastSuggestion
      ? ` I am glad that earlier suggestion was useful.`
      : '';
    reply = `That is encouraging to hear.${prior} What felt most helpful, and would you like to build on it or try a related next step?`;
  }
  // Ask for plan
  else if (/\b(wellness plan|make a (simple )?plan|create a plan|daily plan)\b/i.test(lower)) {
    if (!memory.concerns.length && !memory.goals.length) {
      reply = `I can put together a simple wellness plan. What is the main goal you want it to support — for example sleep, work stress, energy, or mood?`;
    } else {
      const focus =
        memory.goals[memory.goals.length - 1] ||
        memory.concerns[memory.concerns.length - 1] ||
        'your wellbeing';
      reply = [
        `Here is a simple, achievable plan based on what you shared about ${focus}:`,
        ``,
        `1. Morning (5 min): Note one priority for the day and one thing you will intentionally not do.`,
        `2. Midday (3 min): Pause for a few slow breaths and a short stretch away from screens.`,
        `3. Evening (10 min): Wind down without work messages; jot one win and one worry to revisit tomorrow.`,
        `4. This week: Protect two 25-minute focus blocks on your hardest task first.`,
        ``,
        `Would you like this tuned more toward sleep, stress, or focus?`
      ].join('\n');
    }
  }
  // Time management / workload
  else if (/\b(too much work|cannot manage|can't manage|time management|priorit)\b/i.test(lower)) {
    reply = [
      withName(
        memory,
        `It sounds like the workload is outpacing the time you have — that is a prioritization problem we can make more manageable.`
      ),
      ``,
      `A practical start:`,
      `• List today's tasks and mark only 1–3 as must-do.`,
      `• Do the hardest must-do in a 25-minute focus block first.`,
      `• Park the rest on a "later" list so they stop competing for attention.`,
      ``,
      `What is the single most important task on your plate right now?`
    ].join('\n');
  }
  // Work stress
  else if (/\b(stress|stressed).*(work|job|office)|work.*(stress|pressure)|burnout\b/i.test(lower)) {
    reply = [
      withName(
        memory,
        `Work stress can feel relentless when demands keep stacking up. Thank you for naming that clearly.`
      ),
      ``,
      `What part of work is weighing on you most right now — deadlines, workload volume, people dynamics, or uncertainty?`
    ].join('\n');
  }
  // Sleep
  else if (/\b(sleep|insomnia|restless|wake up)\b/i.test(lower)) {
    reply = [
      withName(memory, `Sleep trouble is draining both physically and mentally.`),
      ``,
      `One gentle step: keep a 30-minute screen-light buffer before bed.`,
      `How many nights lately have felt restless for you?`
    ].join('\n');
  }
  // Breathing / grounding quick topics
  else if (/\b(breath|4-7-8|pranayam)\b/i.test(lower)) {
    reply = [
      withName(memory, `Let's do a calm 4-7-8 breath together:`),
      `1. Inhale through your nose for 4.`,
      `2. Hold gently for 7.`,
      `3. Exhale through your mouth for 8.`,
      `Try 3 cycles, then tell me how your body feels.`
    ].join('\n');
  } else if (/\b(grounding|5-4-3-2-1)\b/i.test(lower)) {
    reply = [
      withName(memory, `Here is a quick 5-4-3-2-1 grounding pass:`),
      `• 5 things you can see`,
      `• 4 you can feel`,
      `• 3 you can hear`,
      `• 2 you can smell`,
      `• 1 slow breath`,
      `What is one object you can see right now?`
    ].join('\n');
  }
  // Feelings without inventing extras
  else if (/\b(feel|feeling|sad|lonely|anxious|anxiety|overwhelm|low)\b/i.test(lower)) {
    reply = [
      withName(memory, `Thank you for sharing how you have been feeling.`),
      ``,
      `I am here with you. What feels heaviest about it today?`
    ].join('\n');
  }
  // Unclear / short non-greeting
  else if (text.length < 3 || /^(ok|okay|hmm|idk|dunno)\.?$/i.test(lower)) {
    reply = memory.name
      ? `${memory.name}, I want to make sure I understand — could you share a bit more about what you would like help with?`
      : `I want to make sure I understand — could you share a bit more about what you would like help with?`;
  } else {
    reply = [
      withName(memory, `Thanks for sharing that.`),
      ``,
      `I hear you. What would be most useful next — understanding it better, a practical tip, or a simple plan?`
    ].join('\n');
  }

  // Clean accidental double-name from withName edge cases
  if (memory.name) {
    reply = reply.replace(new RegExp(`${memory.name},\\s*${memory.name}`, 'g'), memory.name);
  }

  return {
    ok: true,
    reply,
    urgent: false,
    crisis: false,
    suggestAppointment: userTurns >= 8 || wantsConsultation,
    source: 'local_wellness_engine'
  };
}
