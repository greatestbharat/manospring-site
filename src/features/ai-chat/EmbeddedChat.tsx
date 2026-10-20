import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { chatService } from '../../services/chat.service';
import { ChatMessage } from '../../types';

interface EmbeddedChatProps {
  onBookClick: () => void;
  onEmergencyTrigger: () => void;
}

const INITIAL_GREETING: ChatMessage = {
  role: 'assistant',
  content:
    "Hello — I'm your Personal Wellness Guide. This is a private space to talk about your wellbeing. How can I help today?"
};

export const EmbeddedChat: React.FC<EmbeddedChatProps> = ({
  onBookClick,
  onEmergencyTrigger
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [suggestAppointment, setSuggestAppointment] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, busy, errorNotice]);

  const requestGuideReply = async (conversation: ChatMessage[]) => {
    setBusy(true);
    setErrorNotice(null);
    setCanRetry(false);

    try {
      const data = await chatService.sendMessage(conversation);

      if (data.urgent) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
        onEmergencyTrigger();
        return;
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      if (data.suggestAppointment) {
        setSuggestAppointment(true);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Could not reach the wellness guide. Please try again.';
      setErrorNotice(message);
      setCanRetry(true);
    } finally {
      setBusy(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || busy) return;

    setInput('');
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    await requestGuideReply(newMessages);
  };

  const handleRetry = async () => {
    if (busy || !canRetry) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'user') return;
    await requestGuideReply(messages);
  };

  const handleReset = () => {
    setMessages([INITIAL_GREETING]);
    setSuggestAppointment(false);
    setErrorNotice(null);
    setCanRetry(false);
  };

  return (
    <section className="py-18 bg-paper" id="wellness-guide">
      <div className="wrap grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5 space-y-5">
          <span className="inline-flex items-center px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-semibold">
            Interactive Companion
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
            Sometimes, the first step is simply talking.
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            Manospring Guide helps you put thoughts into words. Share your feelings naturally without rush, judgment, or clinical pressure.
          </p>

          <div className="space-y-2.5 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-brand-600 font-bold">✓</span>
              <span>Understands everyday expressions, typos, and Indian English</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-600 font-bold">✓</span>
              <span>Evidence-based grounding ideas (breathing, sleep hygiene)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-brand-600 font-bold">✓</span>
              <span>Never makes definitive diagnoses or replaces clinical care</span>
            </div>
          </div>

          <div className="flex gap-2.5 pt-2 flex-wrap">
            <Button variant="primary" size="md" onClick={onBookClick}>
              Book Specialist Consultation →
            </Button>
            <Button variant="outline" size="md" onClick={handleReset}>
              Clear Chat
            </Button>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="bg-white border border-sage-100 rounded-3xl shadow-soft flex flex-col h-[480px] overflow-hidden">
            <div className="px-5 py-3.5 bg-paper-cream border-b border-sage-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center text-sm font-bold">
                  🌿
                </div>
                <div>
                  <strong className="block text-sm font-bold text-slate-900">Personal Wellness Guide</strong>
                  <span className="text-[11px] text-slate-500">Confidential Wellbeing Support</span>
                </div>
              </div>
              <Button variant="subtle" size="sm" onClick={handleReset}>
                Reset
              </Button>
            </div>

            <div ref={scrollRef} className="flex-1 p-5 overflow-y-auto space-y-3 bg-[#fafbf8]">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'ml-auto bg-brand-600 text-white rounded-tr-sm'
                      : 'mr-auto bg-sage-50 text-slate-800 rounded-tl-sm border border-sage-100'
                  }`}
                >
                  {msg.content}
                </div>
              ))}

              {suggestAppointment && (
                <div className="p-4 bg-brand-50 border border-brand-200/80 rounded-2xl text-xs space-y-2 animate-in fade-in">
                  <strong className="text-brand-900 block text-sm">🌿 Consider speaking with a professional</strong>
                  <p className="text-slate-600">
                    We've explored a few things together. A confidential session with a certified psychiatrist or psychologist can provide personalized care.
                  </p>
                  <Button variant="primary" size="sm" onClick={onBookClick}>
                    Browse Specialists & Slots →
                  </Button>
                </div>
              )}

              {busy && (
                <div className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-sage-50 rounded-2xl border border-sage-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-typing-1" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-typing-2" />
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-typing-3" />
                </div>
              )}
            </div>

            {errorNotice && (
              <div className="px-4 py-2.5 bg-amber-50 border-t border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2">
                <span className="leading-snug">{errorNotice}</span>
                {canRetry && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={busy}
                    className="shrink-0 font-semibold underline disabled:opacity-50"
                  >
                    Retry
                  </button>
                )}
              </div>
            )}

            {messages.length === 1 && (
              <div className="px-5 py-2 flex gap-1.5 flex-wrap bg-paper-cream border-t border-sage-50">
                <button
                  type="button"
                  onClick={() => handleSend('I have been feeling stressed and anxious lately.')}
                  className="bg-white hover:bg-brand-50 border border-sage-200 text-slate-700 text-xs px-2.5 py-1 rounded-full transition-colors"
                >
                  Feeling stressed
                </button>
                <button
                  type="button"
                  onClick={() => handleSend('I have trouble sleeping peacefully at night.')}
                  className="bg-white hover:bg-brand-50 border border-sage-200 text-slate-700 text-xs px-2.5 py-1 rounded-full transition-colors"
                >
                  Sleep difficulty
                </button>
                <button
                  type="button"
                  onClick={() => handleSend('I have been feeling low and exhausted.')}
                  className="bg-white hover:bg-brand-50 border border-sage-200 text-slate-700 text-xs px-2.5 py-1 rounded-full transition-colors"
                >
                  Feeling low
                </button>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-sage-100 flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type what is on your mind..."
                maxLength={1200}
                className="flex-1 px-4 py-2.5 bg-paper-cream border border-sage-200 rounded-full text-sm outline-none focus:bg-white focus:border-brand-600"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="w-10 h-10 rounded-full bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center disabled:opacity-40 transition-colors"
                aria-label="Send message"
              >
                ↑
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
