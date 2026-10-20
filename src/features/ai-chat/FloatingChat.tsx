import React, { useState, useRef, useEffect } from 'react';
import { chatService } from '../../services/chat.service';
import { ChatMessage } from '../../types';
import { 
  MessageSquare, X, Send, RotateCcw, AlertCircle, 
  Calendar, Shield, Sparkles, HeartPulse, Maximize2, 
  Minimize2, Copy, Check, Wind, Clock, User, ChevronRight,
  Save, Phone, History, Trash2, UserPlus
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useTranslation } from '../../app/i18n';
import { useTheme } from '../../app/theme';
import { cn } from '../../lib/utils';

interface FloatingChatProps {
  onBookWithDoctor?: () => void;
  onBookClick?: () => void;
  onOpenEmergency?: () => void;
  onEmergencyTrigger?: () => void;
  isOpenControlled?: boolean;
  onOpenControlled?: () => void;
  onCloseControlled?: () => void;
  incomingPrompt?: string;
}

interface QuickStarter {
  id: string;
  label: string;
  icon: string;
  description: string;
  prompt: string;
}

const QUICK_STARTERS: QuickStarter[] = [
  { 
    id: 'feelings',
    label: 'Talk about my feelings', 
    icon: '🌿', 
    description: 'Explore personal emotions, sadness, or thoughts',
    prompt: 'I would like to talk through how I have been feeling lately.'
  },
  { 
    id: 'sleep',
    label: 'Sleep difficulties', 
    icon: '🌙', 
    description: 'Racing thoughts, restlessness, or insomnia',
    prompt: 'I have been having trouble sleeping peacefully at night.'
  },
  { 
    id: 'stress',
    label: 'Stress and work pressure', 
    icon: '💼', 
    description: 'Burnout, heavy workload, and daily pressure',
    prompt: 'I am feeling overwhelmed with stress and work pressure.'
  },
  { 
    id: 'breathing',
    label: 'Breathing exercise', 
    icon: '💨', 
    description: '4-7-8 breathing to calm your nervous system',
    prompt: 'Could you guide me through a calming breathing exercise?'
  },
  { 
    id: 'grounding',
    label: 'Grounding exercise', 
    icon: '🧘', 
    description: '5-4-3-2-1 technique to ease acute tension',
    prompt: 'Could you walk me through a quick grounding exercise?'
  }
];

export const FloatingChat: React.FC<FloatingChatProps> = ({
  onBookWithDoctor,
  onBookClick,
  onOpenEmergency,
  onEmergencyTrigger,
  isOpenControlled,
  onOpenControlled,
  onCloseControlled,
  incomingPrompt
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  // Primary open/close state: synchronized with parent controls
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);

  // Sync external open state if provided by parent
  useEffect(() => {
    if (isOpenControlled !== undefined) {
      setIsOpen(isOpenControlled);
    }
  }, [isOpenControlled]);

  const handleOpen = () => {
    setIsOpen(true);
    if (onOpenControlled) {
      onOpenControlled();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    if (onCloseControlled) {
      onCloseControlled();
    }
  };

  const initialGreeting: ChatMessage = {
    role: 'assistant',
    content: "Hello — I am your Personal Wellness Guide. This is a private, confidential space.\n\nHow can I help with your wellbeing today? You can choose a topic below or type freely."
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const [timestamps, setTimestamps] = useState<string[]>([formatTime(new Date())]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [canRetry, setCanRetry] = useState(false);
  const [showConsultationSuggestion, setShowConsultationSuggestion] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // In-chat interactive breathing tool state
  const [showBreathingWidget, setShowBreathingWidget] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathCount, setBreathCount] = useState<number>(4);
  const [breathActive, setBreathActive] = useState<boolean>(false);

  // Reset flow: ask to save history (name + number) or discard
  const [resetPanelOpen, setResetPanelOpen] = useState(false);
  const [resetStep, setResetStep] = useState<'confirm' | 'form' | 'saved'>('confirm');
  const [saveName, setSaveName] = useState('');
  const [savePhone, setSavePhone] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  const SAVED_HISTORY_KEY = 'manospring_saved_conversations';

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastHandledPrompt = useRef<string | null>(null);

  function formatTime(d: Date): string {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const triggerBook = () => {
    if (onBookWithDoctor) onBookWithDoctor();
    else if (onBookClick) onBookClick();
  };

  const triggerEmergency = () => {
    if (onOpenEmergency) onOpenEmergency();
    else if (onEmergencyTrigger) onEmergencyTrigger();
  };

  // Scroll to bottom on message updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, busy, isOpen, isExpanded, showBreathingWidget, showAllTopics]);

  // Handle incoming prompt from Explore topics
  useEffect(() => {
    if (incomingPrompt && isOpen && lastHandledPrompt.current !== incomingPrompt) {
      lastHandledPrompt.current = incomingPrompt;
      handleSend(incomingPrompt);
    }
  }, [incomingPrompt, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Breathing tool timer effect
  useEffect(() => {
    if (!breathActive) return;
    const interval = setInterval(() => {
      setBreathCount((prev) => {
        if (prev > 1) return prev - 1;
        if (breathPhase === 'Inhale') {
          setBreathPhase('Hold');
          return 7;
        } else if (breathPhase === 'Hold') {
          setBreathPhase('Exhale');
          return 8;
        } else {
          setBreathPhase('Inhale');
          return 4;
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [breathActive, breathPhase]);

  const requestGuideReply = async (conversation: ChatMessage[]) => {
    setBusy(true);
    setErrorNotice(null);
    setCanRetry(false);

    try {
      const data = await chatService.sendMessage(conversation);

      if (data.urgent) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
        setTimestamps((prev) => [...prev, formatTime(new Date())]);
        triggerEmergency();
        return;
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
      setTimestamps((prev) => [...prev, formatTime(new Date())]);

      if (data.suggestAppointment || conversation.filter((m) => m.role === 'user').length >= 8) {
        setShowConsultationSuggestion(true);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : 'Could not reach the wellness guide. Please try again.';
      setErrorNotice(message);
      setCanRetry(true);
      // Keep the user's message; do not invent a generic assistant fallback reply
    } finally {
      setBusy(false);
    }
  };

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || busy) return;

    setInput('');
    setErrorNotice(null);
    setCanRetry(false);

    const nowStr = formatTime(new Date());
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setTimestamps((prev) => [...prev, nowStr]);

    // If user asks about breathing, toggle the interactive breathing widget
    if (/breath|4-7-8|pranayam/i.test(text)) {
      setShowBreathingWidget(true);
      setBreathActive(true);
    }

    await requestGuideReply(newMessages);
  };

  const handleRetry = async () => {
    if (busy || !canRetry) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'user') return;
    await requestGuideReply(messages);
  };

  const handleCopyMessage = (content: string, index: number) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const doClearConversation = () => {
    setMessages([initialGreeting]);
    setTimestamps([formatTime(new Date())]);
    setErrorNotice(null);
    setCanRetry(false);
    setShowConsultationSuggestion(false);
    setShowBreathingWidget(false);
    setBreathActive(false);
    setShowAllTopics(false);
    lastHandledPrompt.current = null;
  };

  const handleReset = () => {
    // Nothing meaningful to keep yet — clear straight away
    if (messages.length <= 1) {
      doClearConversation();
      return;
    }
    setSaveName('');
    setSavePhone('');
    setSaveError(null);
    setResetStep('confirm');
    setResetPanelOpen(true);
  };

  const handleSaveHistory = () => {
    const name = saveName.trim();
    const phoneDigits = savePhone.replace(/[\s-]/g, '');
    const phoneOk = /^(?:\+91|0)?[6-9]\d{9}$/.test(phoneDigits);

    if (name.length < 2) {
      setSaveError('Please enter your full name (at least 2 characters).');
      return;
    }
    if (!phoneOk) {
      setSaveError('Please enter a valid 10-digit mobile number (India).');
      return;
    }

    try {
      const existing = JSON.parse(localStorage.getItem(SAVED_HISTORY_KEY) || '[]');
      existing.push({
        id: `conv_${Date.now()}`,
        name,
        phone: phoneDigits,
        savedAt: new Date().toISOString(),
        messages,
        timestamps
      });
      localStorage.setItem(SAVED_HISTORY_KEY, JSON.stringify(existing));
    } catch {
      // Storage unavailable — still clear gracefully
    }

    setResetStep('saved');
    setTimeout(() => {
      setResetPanelOpen(false);
      doClearConversation();
    }, 2200);
  };

  // Formats text with markdown-like bold and bullet lists (theme + role aware)
  const renderFormattedContent = (content: string, role: 'user' | 'assistant' | 'system') => {
    const isUser = role === 'user';
    const listText = isUser
      ? 'text-white/95'
      : 'text-slate-700 dark:text-slate-200';
    const markerText = isUser
      ? 'text-teal-100'
      : 'text-teal-700 dark:text-teal-300';
    const numberText = isUser
      ? 'text-teal-50'
      : 'text-teal-800 dark:text-teal-300';
    const strongText = isUser
      ? 'text-white'
      : 'text-slate-900 dark:text-white';

    const lines = content.split('\n');
    return (
      <div className={`space-y-1.5 leading-relaxed ${listText}`}>
        {lines.map((line, idx) => {
          if (!line.trim()) return <div key={idx} className="h-1.5" />;
          
          if (line.startsWith('• ') || line.startsWith('- ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className={`${markerText} font-bold`}>•</span>
                <span>{renderInlineFormatting(line.substring(2), strongText)}</span>
              </div>
            );
          }

          const matchNum = line.match(/^(\d+)\.\s+(.*)/);
          if (matchNum) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1">
                <span className={`font-semibold ${numberText} text-[11px] min-w-[16px]`}>{matchNum[1]}.</span>
                <span>{renderInlineFormatting(matchNum[2], strongText)}</span>
              </div>
            );
          }

          return <p key={idx}>{renderInlineFormatting(line, strongText)}</p>;
        })}
      </div>
    );
  };

  const renderInlineFormatting = (text: string, strongClass: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className={`font-semibold ${strongClass}`}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const dynamicQuickStarters: QuickStarter[] = [
    { 
      id: 'feelings',
      label: t('chat.feelingsLabel', 'Talk about my feelings'), 
      icon: '🌿', 
      description: t('chat.feelingsDesc', 'Explore personal emotions, sadness, or thoughts'),
      prompt: 'I would like to talk through how I have been feeling lately.'
    },
    { 
      id: 'sleep',
      label: t('chat.sleepLabel', 'Sleep difficulties'), 
      icon: '🌙', 
      description: t('chat.sleepDesc', 'Racing thoughts, restlessness, or insomnia'),
      prompt: 'I have been having trouble sleeping peacefully at night.'
    },
    { 
      id: 'stress',
      label: t('chat.stressLabel', 'Stress and work pressure'), 
      icon: '💼', 
      description: t('chat.stressDesc', 'Burnout, heavy workload, and daily pressure'),
      prompt: 'I am feeling overwhelmed with stress and work pressure.'
    },
    { 
      id: 'breathing',
      label: t('chat.breathingLabel', 'Breathing exercise'), 
      icon: '💨', 
      description: t('chat.breathingDesc', '4-7-8 breathing to calm your nervous system'),
      prompt: 'Could you guide me through a calming breathing exercise?'
    },
    { 
      id: 'grounding',
      label: t('chat.groundingLabel', 'Grounding exercise'), 
      icon: '🧘', 
      description: t('chat.groundingDesc', '5-4-3-2-1 technique to ease acute tension'),
      prompt: 'Could you walk me through a quick grounding exercise?'
    }
  ];

  // Show only 3 initially, with a "More topics" expansion
  const displayedStarters = showAllTopics ? dynamicQuickStarters : dynamicQuickStarters.slice(0, 3);

  return (
    <>
      {/* Floating AI Guide — weightless float, ambient glow, gradient heart */}
      {!isOpen && (
        <button
          type="button"
          onClick={handleOpen}
          className="group animate-fab-float fixed bottom-15 right-15 z-40 flex h-[45px] w-[45px] items-center justify-center cursor-pointer"
          aria-label={t('chat.launcherTitle', 'Personal Wellness Guide')}
        >
          {/* Hover tooltip */}
          <span className="pointer-events-none absolute right-full top-1/2 mr-3 -translate-y-1/2 translate-x-2 whitespace-nowrap text-left rounded-full border border-slate-200/80 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 px-2.5 py-1 text-[10px] font-semibold text-slate-800 dark:text-slate-100 shadow-lg opacity-0 backdrop-blur transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
            {t('chat.launcherTitle', 'Personal Wellness Guide')}
            <span className="ml-1.5 inline-flex items-center gap-1 font-normal text-teal-600 dark:text-teal-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              online
            </span>
          </span>

          {/* Ambient colored halo */}
          <span
            aria-hidden="true"
            className="absolute -inset-2.5 rounded-full bg-gradient-to-br from-rose-300/50 via-teal-400/35 to-brand-600/40 blur-xl opacity-80 animate-pulse dark:opacity-60"
            style={{ animationDuration: '4.5s' }}
          />

          {/* Gradient ring — the element that scales on hover */}
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-full bg-gradient-to-br from-[#fb7185] via-[#2dd4bf] to-[#226450] shadow-[0_12px_32px_rgba(15,84,62,0.35)] transition-transform duration-300 group-hover:scale-105 group-active:scale-95"
          />

          {/* Porcelain core (bottom-weighted inner light) */}
          <span
            aria-hidden="true"
            className="absolute inset-[3px] rounded-full bg-white shadow-[inset_0_-8px_14px_rgba(15,84,62,0.08),inset_0_2px_4px_rgba(255,255,255,0.9)] dark:bg-slate-950 dark:shadow-[inset_0_-8px_14px_rgba(45,212,191,0.12)]"
          />

          {/* Gradient heart: layered rose gradient + sheen */}
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="relative h-[23px] w-[23px] animate-heartbeat drop-shadow-[0_3px_8px_rgba(225,29,72,0.45)]"
          >
            <defs>
              <linearGradient id="msHeartGrad" x1="0.15" y1="0.1" x2="0.85" y2="1">
                <stop offset="0%" stopColor="#fda4af" />
                <stop offset="38%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#9f1239" />
              </linearGradient>
              <linearGradient id="msHeartSheen" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"
              fill="url(#msHeartGrad)"
            />
            <path
              d="M7.4 7.6c.8-.8 2-1.05 2.9-.55"
              fill="none"
              stroke="url(#msHeartSheen)"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>

          {/* AI badge */}
          <span className="absolute -right-0.5 -top-0.5 flex h-[17px] w-[17px] items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-brand-700 dark:from-teal-500 dark:to-brand-600 shadow-md ring-[1.5px] ring-white dark:ring-slate-950">
            <Sparkles className="h-[9px] w-[9px] text-white fill-white" />
          </span>

          {/* Online status dot */}
          <span className="absolute bottom-0.5 left-0.5 h-[10px] w-[10px] rounded-full border-2 border-white bg-emerald-500 dark:border-slate-950" />
        </button>
      )}

      {/* Modern, Compact Chat Dialog Container — fully light/dark theme aware */}
      {isOpen && (
        <div
          data-chat-dialog
          data-theme={theme}
          className={cn(
            'fixed z-50 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-3',
            'bg-white text-slate-800 border border-slate-200/90',
            'dark:bg-slate-900 dark:text-slate-100 dark:border-slate-800',
            isExpanded
              ? 'bottom-[10px] right-[10px] w-[calc(100vw-20px)] h-[calc(100vh-20px)] sm:bottom-5 sm:right-5 sm:w-[560px] sm:h-[680px]'
              : 'bottom-5 right-5 w-[calc(100vw-40px)] sm:w-[395px] h-[550px] max-h-[84vh]'
          )}
        >
          
          {/* Theme-aware header: light surface in light mode, dark surface in dark mode */}
          <div
            className={cn(
              'px-4 py-3 flex items-center justify-between border-b shrink-0',
              'bg-paper-cream text-slate-900 border-slate-200',
              'dark:bg-slate-950 dark:text-white dark:border-slate-800'
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-inner border',
                    'bg-teal-50 text-teal-800 border-teal-200',
                    'dark:bg-teal-800 dark:text-teal-50 dark:border-teal-600/60'
                  )}
                >
                  🌿
                </div>
                <span
                  className={cn(
                    'absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border-2',
                    'border-paper-cream dark:border-slate-950'
                  )}
                />
              </div>
              <div className="min-w-0">
                <div
                  className={cn(
                    'text-xs font-semibold tracking-tight flex items-center gap-1.5 leading-tight flex-wrap',
                    'text-slate-900 dark:text-white'
                  )}
                >
                  <span className="truncate">{t('chat.headerTitle', 'Personal Wellness Guide')}</span>
                  <span
                    className={cn(
                      'inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium tracking-wide shrink-0 border',
                      /* Light: soft teal pill on cream header */
                      'bg-teal-50 text-teal-800 border-teal-200',
                      /* Dark: muted teal chip on dark header */
                      'dark:bg-teal-900/80 dark:text-teal-100 dark:border-teal-700/60'
                    )}
                  >
                    {t('chat.confidentialBadge', 'Confidential')}
                  </span>
                </div>
                <span
                  className={cn(
                    'text-[10px] block leading-tight truncate',
                    'text-slate-500 dark:text-slate-400'
                  )}
                >
                  {t('chat.headerSubtitle', 'Supportive listening & grounding companion')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse window' : 'Expand window'}
                className={cn(
                  'w-6 h-6 rounded-lg flex items-center justify-center transition-colors text-xs cursor-pointer',
                  'text-slate-500 hover:text-brand-800 hover:bg-slate-100',
                  'dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                )}
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleReset}
                title="Restart conversation"
                className={cn(
                  'w-6 h-6 rounded-lg flex items-center justify-center transition-colors text-xs cursor-pointer',
                  'text-slate-500 hover:text-brand-800 hover:bg-slate-100',
                  'dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                )}
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleClose}
                title="Close guide"
                className={cn(
                  'w-6 h-6 rounded-lg flex items-center justify-center transition-colors text-xs cursor-pointer',
                  'text-slate-500 hover:text-brand-800 hover:bg-slate-100',
                  'dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                )}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Discreet Crisis Helplines Alert Bar */}
          <div className="bg-amber-50/90 dark:bg-rose-950/40 px-3.5 py-1.5 border-b border-amber-200/80 dark:border-rose-900/50 text-[10.5px] text-amber-950 dark:text-rose-200 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-1.5 truncate">
              <HeartPulse className="w-3.5 h-3.5 text-amber-700 dark:text-rose-400 shrink-0" />
              <span className="truncate">{t('chat.urgentBanner', 'Need urgent emotional support? Call')} <strong>14416</strong></span>
            </div>
            <button
              type="button"
              onClick={triggerEmergency}
              className="text-amber-950 dark:text-rose-200 font-semibold underline text-[10px] shrink-0 hover:text-black dark:hover:text-rose-100 cursor-pointer"
            >
              {t('chat.helplinesBtn', '24/7 Helplines')}
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div ref={scrollRef} className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/60 dark:bg-slate-950/80 text-xs">
            
            {/* Encryption & privacy badge */}
            <div className="text-center py-0.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9.5px] font-medium">
                <Shield className="w-2.5 h-2.5 text-teal-800 dark:text-teal-400" />
                <span>{t('chat.encryptedBadge', 'Conversations are private & encrypted')}</span>
              </span>
            </div>

            {messages.map((msg, i) => {
              const isUser = msg.role === 'user';
              const time = timestamps[i] || '';

              return (
                <div
                  key={i}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1">
                    {!isUser && (
                      <span className="w-3.5 h-3.5 rounded-full bg-teal-800 dark:bg-teal-700 text-teal-100 text-[8px] flex items-center justify-center">
                        🌿
                      </span>
                    )}
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {isUser ? 'You' : 'Wellness Guide'}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                      {time}
                    </span>
                  </div>

                  <div className="relative max-w-[88%] sm:max-w-[82%]">
                    <div
                      className={cn(
                        'p-3 rounded-2xl leading-relaxed text-xs shadow-xs',
                        isUser
                          ? 'bg-teal-800 text-white rounded-tr-none dark:bg-teal-700'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700'
                      )}
                    >
                      {renderFormattedContent(msg.content, msg.role)}
                    </div>

                    {/* Copy button for guide messages */}
                    {!isUser && (
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.content, i)}
                        title="Copy message"
                        className="opacity-0 group-hover:opacity-100 transition-opacity absolute -right-7 top-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 cursor-pointer"
                      >
                        {copiedIndex === i ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Suggested Conversation Starters — Compact Clickable List */}
            {messages.length <= 1 && (
              <div className="pt-1.5 pb-1 space-y-1.5 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400" />
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t('chat.suggestedStarters', 'Suggested Conversation Starters')}
                    </span>
                  </div>
                  <span className="text-[10px] text-teal-800 dark:text-teal-300 font-medium">Click to begin</span>
                </div>

                <div className="space-y-1.5" role="list" aria-label="Suggested Conversation Starters">
                  {displayedStarters.map((starter) => (
                    <button
                      key={starter.id}
                      type="button"
                      onClick={() => handleSend(starter.prompt)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-teal-50/80 dark:hover:bg-slate-700/70 border border-slate-200/90 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-500 transition-all text-left group cursor-pointer shadow-2xs hover:shadow-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-teal-50 dark:bg-teal-950/80 border border-teal-100 dark:border-teal-800 flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform">
                          {starter.icon}
                        </span>
                        <div className="min-w-0 pr-1">
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-teal-900 dark:group-hover:text-teal-300 block leading-tight">
                            {starter.label}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block leading-tight mt-0.5 font-normal">
                            {starter.description}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-teal-700 dark:group-hover:text-teal-300 shrink-0 group-hover:translate-x-0.5 transition-transform ml-1" />
                    </button>
                  ))}
                </div>

                {/* More topics expander */}
                <div className="flex items-center justify-between pt-0.5 px-1">
                  <button
                    type="button"
                    onClick={() => setShowAllTopics(!showAllTopics)}
                    className="text-[11px] font-medium text-teal-800 dark:text-teal-300 hover:text-teal-950 dark:hover:text-teal-200 underline flex items-center gap-1 cursor-pointer"
                  >
                    {showAllTopics ? '− Show fewer topics' : '+ More topics (Breathing, Grounding)'}
                  </button>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">or type below</span>
                </div>
              </div>
            )}

            {/* Interactive Calming Breathing Widget (When requested) */}
            {showBreathingWidget && (
              <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/70 space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-teal-900 dark:text-teal-100 font-semibold text-xs">
                    <Wind className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400 animate-pulse" />
                    <span>4-7-8 Calming Breathing Tool</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBreathActive(!breathActive)}
                    className="text-[10.5px] font-semibold text-teal-800 dark:text-teal-300 hover:text-teal-950 dark:hover:text-teal-100 underline cursor-pointer"
                  >
                    {breathActive ? 'Pause' : 'Start'}
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center py-1">
                  <div className={`w-18 h-18 rounded-full flex flex-col items-center justify-center border-3 transition-all duration-1000 ${
                    breathPhase === 'Inhale'
                      ? 'border-teal-500 bg-teal-100 dark:bg-teal-900 scale-105'
                      : breathPhase === 'Hold'
                      ? 'border-amber-400 bg-amber-50 dark:bg-amber-950 scale-100'
                      : 'border-blue-400 bg-blue-50 dark:bg-slate-800 scale-95'
                  }`}>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-teal-900 dark:text-teal-100">
                      {breathPhase}
                    </span>
                    <span className="text-lg font-bold font-mono text-teal-950 dark:text-teal-50">
                      {breathCount}s
                    </span>
                  </div>
                  <span className="text-[10px] text-teal-700 dark:text-teal-300 mt-1.5 text-center">
                    {breathPhase === 'Inhale' && 'Breathe gently in through your nose (4s)'}
                    {breathPhase === 'Hold' && 'Hold your breath softly (7s)'}
                    {breathPhase === 'Exhale' && 'Exhale slowly through your mouth (8s)'}
                  </span>
                </div>
              </div>
            )}

            {/* Modern Dynamic Typing Indicator */}
            {busy && (
              <div className="flex flex-col items-start space-y-1">
                <div className="flex items-center gap-1.5 px-1">
                  <span className="w-3.5 h-3.5 rounded-full bg-teal-800 dark:bg-teal-700 text-teal-100 text-[8px] flex items-center justify-center">
                    🌿
                  </span>
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
                    Wellness Guide is reflecting...
                  </span>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-2.5 rounded-2xl rounded-tl-none flex items-center gap-1.5 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-typing-1" />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-typing-2" />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-typing-3" />
                </div>
              </div>
            )}

            {/* Soft Consultation Offer Card */}
            {showConsultationSuggestion && (
              <div className="p-3.5 rounded-2xl bg-teal-50/90 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800/70 text-teal-900 dark:text-teal-100 space-y-2.5 animate-in fade-in shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Calendar className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                    <span>Speak with a Verified Specialist</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold tracking-wide bg-teal-200/70 dark:bg-teal-900/70 text-teal-900 dark:text-teal-200">
                    Next Step
                  </span>
                </div>
                <p className="text-[11px] text-teal-800/90 dark:text-teal-200/90 leading-relaxed">
                  Talking things through is a meaningful first step. When you are ready, you can book a private 1-on-1 consultation with a licensed psychiatrist or psychologist.
                </p>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-teal-200 dark:border-teal-800/60 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 flex items-center justify-center text-xs font-bold">
                      👩🏽‍⚕️
                    </div>
                    <div>
                      <strong className="text-xs text-slate-900 dark:text-white block leading-tight">Dr. Ananya Sharma</strong>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">Consultant Psychiatrist · ₹1,200</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={triggerBook}
                    className="text-xs font-semibold px-2.5 py-1.5 h-auto cursor-pointer"
                  >
                    Book Session →
                  </Button>
                </div>
              </div>
            )}

          </div>

          {/* Non-diagnostic disclaimer footer note */}
          <div className="px-3 py-1 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[9.5px] text-slate-500 dark:text-slate-400 text-center shrink-0">
            {t('chat.disclaimer', 'Automated personal wellness guide. Non-clinical & non-diagnostic.')}
          </div>

          {errorNotice && (
            <div className="px-3 py-2 bg-amber-50 dark:bg-amber-950/40 border-t border-amber-200 dark:border-amber-800/60 flex items-start gap-2 shrink-0">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700 dark:text-amber-300 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-amber-900 dark:text-amber-100 leading-snug">{errorNotice}</p>
                {canRetry && (
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={busy}
                    className="mt-1.5 text-[11px] font-semibold text-teal-800 dark:text-teal-300 underline hover:no-underline disabled:opacity-50 cursor-pointer"
                  >
                    Retry last message
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  setErrorNotice(null);
                  setCanRetry(false);
                }}
                className="text-amber-700 dark:text-amber-300 text-xs cursor-pointer"
                aria-label="Dismiss error"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Compact Chat Input Box Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-end gap-2 shrink-0"
          >
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={t('chat.inputPlaceholder', 'Share what is on your mind... (Enter to send)')}
                disabled={busy}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/90 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none max-h-20"
              />
            </div>
            
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={busy || !input.trim()}
              className="px-3 h-[34px] text-xs font-semibold rounded-xl flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>

          {/* Save / Discard history panel */}
          {resetPanelOpen && (
            <div className="absolute inset-0 z-30 flex items-center justify-center p-5 bg-slate-950/50 backdrop-blur-[2px]">
              <div className="w-full max-w-[290px] rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-4 space-y-3">
                {resetStep === 'confirm' && (
                  <>
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-teal-950/60 flex items-center justify-center shrink-0">
                        <History className="w-4.5 h-4.5 text-brand-700 dark:text-teal-300" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          Keep this conversation?
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                          Restarting clears this chat. You can save your history first, or discard it.
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => { setResetStep('form'); setSaveError(null); }}
                        className="w-full justify-center text-xs cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5 shrink-0" />
                        <span>Save history</span>
                      </Button>
                      <Button
                        type="button"
                        variant="subtle"
                        size="sm"
                        onClick={() => { setResetPanelOpen(false); doClearConversation(); }}
                        className="w-full justify-center text-xs border border-slate-200 dark:border-slate-700 rounded-full cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 shrink-0" />
                        <span>Discard</span>
                      </Button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setResetPanelOpen(false)}
                      className="w-full text-center text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 font-medium cursor-pointer"
                    >
                      Cancel — I will continue chatting
                    </button>
                  </>
                )}

                {resetStep === 'form' && (
                  <form onSubmit={(e) => { e.preventDefault(); handleSaveHistory(); }} className="space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-teal-950/60 flex items-center justify-center shrink-0">
                        <UserPlus className="w-4.5 h-4.5 text-brand-700 dark:text-teal-300" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          Save conversation history
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          Stored only on this device, never sent to servers.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={saveName}
                          onChange={(e) => { setSaveName(e.target.value); setSaveError(null); }}
                          placeholder="Full name"
                          autoFocus
                          className="w-full pl-8 pr-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                        />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                          type="tel"
                          inputMode="numeric"
                          value={savePhone}
                          onChange={(e) => { setSavePhone(e.target.value); setSaveError(null); }}
                          placeholder="Mobile number (10 digits)"
                          className="w-full pl-8 pr-2.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                        />
                      </div>
                      {saveError && (
                        <p className="text-[10.5px] font-medium text-rose-600 dark:text-rose-400 flex items-start gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          {saveError}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-[1fr_auto] gap-2 pt-1">
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        className="w-full justify-center text-xs cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5 shrink-0" />
                        <span>Save &amp; restart</span>
                      </Button>
                      <Button
                        type="button"
                        variant="subtle"
                        size="sm"
                        onClick={() => setResetStep('confirm')}
                        className="justify-center text-xs border border-slate-200 dark:border-slate-700 rounded-full cursor-pointer px-3"
                      >
                        Back
                      </Button>
                    </div>
                  </form>
                )}

                {resetStep === 'saved' && (
                  <div className="text-center py-2 space-y-2">
                    <div className="w-10 h-10 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center">
                      <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      History saved, {saveName.trim().split(' ')[0]}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      A fresh conversation is starting…
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
};
