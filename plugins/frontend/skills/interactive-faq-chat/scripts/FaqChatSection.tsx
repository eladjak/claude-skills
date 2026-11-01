'use client';

import { useState, useRef, useEffect, useCallback, type CSSProperties, type KeyboardEvent } from 'react';

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */

interface KnowledgeEntry {
  q: string[];
  a: string;
}

interface PresetQuestion {
  q: string;
  icon: string;
}

export interface FaqChatProps {
  agentName: string;
  agentTitle: string;
  agentAvatar?: string;
  whatsappNumber: string;
  primaryColor?: string;
  knowledgeBase: KnowledgeEntry[];
  presetQuestions: PresetQuestion[];
  fallbackMessage?: string;
  className?: string;
  theme?: 'dark' | 'light';
  statusText?: string;
  welcomeEmoji?: string;
  welcomeText?: string;
  inputPlaceholder?: string;
  typingDelay?: number;
  maxHeight?: number | string;
}

interface ChatMessage {
  id: string;
  type: 'bot' | 'user';
  html: string;
  time: string;
}

/* ─────────────────────────────────────────────
   Helpers
   ───────────────────────────────────────────── */

function getTime(): string {
  return new Date().toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

function normalizeHebrew(text: string): string {
  return text
    .replace(/[?!.,;:'"()\-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function formatText(text: string): string {
  return text.replace(/\n/g, '<br>');
}

function findBestMatch(userText: string, knowledgeBase: KnowledgeEntry[]): string | null {
  const normalized = normalizeHebrew(userText);
  if (normalized.length < 2) return null;

  let bestScore = 0;
  let bestEntry: KnowledgeEntry | null = null;

  for (const entry of knowledgeBase) {
    let score = 0;
    for (const keyword of entry.q) {
      const kw = normalizeHebrew(keyword);
      if (kw.length < 2) continue;
      if (normalized.includes(kw) || kw.includes(normalized)) {
        score += 10;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  if (bestScore >= 10 && bestEntry) {
    return bestEntry.a;
  }
  return null;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

/* ─────────────────────────────────────────────
   CSS-in-JS tokens
   ───────────────────────────────────────────── */

function buildTokens(primary: string, theme: 'dark' | 'light') {
  if (theme === 'light') {
    return {
      bgPrimary: '#f5f5f7',
      bgSecondary: '#ffffff',
      bgCard: '#eeeef2',
      bgBubbleBot: '#e8e8f0',
      bgBubbleUser: primary,
      bgInput: '#ffffff',
      textPrimary: '#1a1a2e',
      textSecondary: '#5e5e78',
      textMuted: '#9898b0',
      accent: primary,
      accentGlow: `${primary}40`,
      accentSubtle: `${primary}18`,
      border: 'rgba(0,0,0,0.08)',
      borderAccent: `${primary}50`,
      glassBg: 'rgba(255,255,255,0.92)',
      glassBorder: 'rgba(0,0,0,0.06)',
      onlineGreen: '#22c55e',
      whatsappGreen: '#25D366',
      shadowLg: '0 20px 60px rgba(0,0,0,0.12)',
      userTimeColor: 'rgba(255,255,255,0.6)',
    };
  }
  return {
    bgPrimary: '#0a0a0f',
    bgSecondary: '#111118',
    bgCard: '#1a1a2e',
    bgBubbleBot: '#1c1c32',
    bgBubbleUser: primary.replace('#6C5CE7', '#6c3ce0').length ? primary : '#6c3ce0',
    bgInput: '#16161f',
    textPrimary: '#e8e8f0',
    textSecondary: '#9898b0',
    textMuted: '#5e5e78',
    accent: primary,
    accentGlow: `${primary}40`,
    accentSubtle: `${primary}18`,
    border: 'rgba(255,255,255,0.06)',
    borderAccent: `${primary}50`,
    glassBg: 'rgba(17,17,24,0.85)',
    glassBorder: 'rgba(255,255,255,0.08)',
    onlineGreen: '#22c55e',
    whatsappGreen: '#25D366',
    shadowLg: '0 20px 60px rgba(0,0,0,0.5)',
    userTimeColor: 'rgba(255,255,255,0.45)',
  };
}

/* ─────────────────────────────────────────────
   WhatsApp SVG icon (inline)
   ───────────────────────────────────────────── */

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'white', flexShrink: 0 }}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, fill: 'white', transform: 'scaleX(-1)' }}>
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

/* ─────────────────────────────────────────────
   Keyframes (injected once)
   ───────────────────────────────────────────── */

const STYLE_ID = '__faq-chat-keyframes__';

function ensureKeyframes() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
@keyframes faqchat-fadeSlideIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes faqchat-pulseOnline{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.4)}50%{box-shadow:0 0 0 5px rgba(34,197,94,0)}}
@keyframes faqchat-typingBounce{0%,60%,100%{transform:translateY(0);opacity:0.4}30%{transform:translateY(-6px);opacity:1}}
`;
  document.head.appendChild(style);
}

/* ─────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────── */

function Avatar({
  avatar,
  agentName,
  size = 48,
  accent,
}: {
  avatar?: string;
  agentName: string;
  size?: number;
  accent: string;
}) {
  const isUrl = avatar && (avatar.startsWith('http') || avatar.startsWith('/') || avatar.startsWith('.'));
  const s: CSSProperties = {
    width: size,
    height: size,
    borderRadius: 9999,
    background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: size * 0.46,
    color: 'white',
    flexShrink: 0,
    boxShadow: size > 40 ? `0 0 24px ${accent}40` : undefined,
    position: 'relative' as const,
    overflow: 'hidden',
  };
  return (
    <div style={s}>
      {isUrl ? (
        <img
          src={avatar}
          alt={agentName}
          style={{ width: '100%', height: '100%', borderRadius: 9999, objectFit: 'cover' }}
        />
      ) : (
        <span>{avatar || agentName.charAt(0)}</span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Component
   ───────────────────────────────────────────── */

export default function FaqChatSection({
  agentName,
  agentTitle,
  agentAvatar,
  whatsappNumber,
  primaryColor = '#8b5cf6',
  knowledgeBase,
  presetQuestions,
  fallbackMessage,
  className,
  theme = 'dark',
  statusText = '\u05DE\u05D7\u05D5\u05D1\u05E8 \u05E2\u05DB\u05E9\u05D9\u05D5',
  welcomeEmoji = '\u{1F916}',
  welcomeText = `\u05E9\u05DC\u05D5\u05DD! \u05D0\u05E0\u05D9 \u05D4\u05D1\u05D5\u05D8 \u05E9\u05DC ${agentName}. \u05E9\u05D0\u05DC\u05D5 \u05D0\u05D5\u05EA\u05D9 \u05DB\u05DC \u05E9\u05D0\u05DC\u05D4, \u05D0\u05D5 \u05D1\u05D7\u05E8\u05D5 \u05DE\u05D4\u05E0\u05D5\u05E9\u05D0\u05D9\u05DD \u05DC\u05DE\u05D8\u05D4.`,
  inputPlaceholder = '\u05DB\u05EA\u05D1\u05D5 \u05E9\u05D0\u05DC\u05D4...',
  typingDelay = 1200,
  maxHeight = 720,
}: FaqChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [disabledChips, setDisabledChips] = useState<Set<number>>(new Set());

  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const t = buildTokens(primaryColor, theme);

  useEffect(() => {
    ensureKeyframes();
  }, []);

  // Auto-scroll on new messages / typing
  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    });
  }, [messages, showTyping]);

  const defaultFallback =
    fallbackMessage ??
    `\u05E9\u05D0\u05DC\u05D4 \u05DE\u05E6\u05D5\u05D9\u05E0\u05D4! \u{1F914}\n\u05D4\u05D0\u05DE\u05EA \u05E9\u05D0\u05E0\u05D9 \u05DE\u05DE\u05DC\u05D9\u05E5 \u05DC\u05E9\u05D0\u05D5\u05DC \u05D0\u05EA ${agentName} \u05D9\u05E9\u05D9\u05E8\u05D5\u05EA \u2014 \u05D4\u05D5\u05D0 \u05D9\u05EA\u05DF \u05DC\u05DA \u05EA\u05E9\u05D5\u05D1\u05D4 \u05DE\u05D3\u05D5\u05D9\u05E7\u05EA \u05D5\u05DE\u05D5\u05EA\u05D0\u05DE\u05EA \u05D0\u05D9\u05E9\u05D9\u05EA.`;

  const buildFallbackHTML = useCallback(
    (userQuestion: string) => {
      const encodedQ = encodeURIComponent(`\u05E9\u05D0\u05DC\u05D4 \u05DE\u05D4\u05D0\u05EA\u05E8: ${userQuestion}`);
      const waUrl = `https://wa.me/${whatsappNumber}?text=${encodedQ}`;
      let html = formatText(defaultFallback);
      html += `<br><a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;margin-top:10px;padding:10px 18px;background:${t.whatsappGreen};color:white;border:none;border-radius:9999px;font-size:13.5px;font-weight:600;cursor:pointer;text-decoration:none;box-shadow:0 2px 12px rgba(37,211,102,0.3);font-family:inherit;transition:transform 0.15s ease">`;
      html += `<svg viewBox="0 0 24 24" style="width:18px;height:18px;fill:white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`;
      html += `\u{1F4AC} \u05E9\u05DC\u05D7 \u05DC\u05D9 \u05D1\u05D5\u05D5\u05D0\u05D8\u05E1\u05D0\u05E4</a>`;
      return html;
    },
    [whatsappNumber, defaultFallback, t.whatsappGreen],
  );

  const processQuestion = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isProcessing) return;
      setIsProcessing(true);

      // User message
      const userMsg: ChatMessage = { id: uid(), type: 'user', html: formatText(trimmed), time: getTime() };
      setMessages((prev) => [...prev, userMsg]);

      // Typing indicator after short delay
      setTimeout(() => {
        setShowTyping(true);

        const answer = findBestMatch(trimmed, knowledgeBase);
        const delay = typingDelay + Math.random() * 600;

        setTimeout(() => {
          setShowTyping(false);
          const responseHTML = answer ? formatText(answer) : buildFallbackHTML(trimmed);
          const botMsg: ChatMessage = { id: uid(), type: 'bot', html: responseHTML, time: getTime() };
          setMessages((prev) => [...prev, botMsg]);
          setIsProcessing(false);
        }, delay);
      }, 300);
    },
    [isProcessing, knowledgeBase, typingDelay, buildFallbackHTML],
  );

  const handlePresetClick = useCallback(
    (index: number) => {
      if (isProcessing) return;
      setDisabledChips((prev) => new Set(prev).add(index));
      processQuestion(presetQuestions[index].q);
    },
    [isProcessing, presetQuestions, processQuestion],
  );

  const handleSend = useCallback(() => {
    const text = inputValue.trim();
    if (!text || isProcessing) return;
    setInputValue('');
    processQuestion(text);
  }, [inputValue, isProcessing, processQuestion]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  /* ── Styles ── */

  const containerStyle: CSSProperties = {
    width: '100%',
    maxWidth: 560,
    background: t.glassBg,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: 20,
    border: `1px solid ${t.glassBorder}`,
    overflow: 'hidden',
    boxShadow: `${t.shadowLg}, 0 0 80px ${t.accentGlow}`,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: typeof maxHeight === 'number' ? maxHeight : maxHeight,
    minHeight: 400,
    fontFamily: "'Heebo', -apple-system, BlinkMacSystemFont, sans-serif",
    direction: 'rtl',
    color: t.textPrimary,
    position: 'relative',
  };

  const headerStyle: CSSProperties = {
    padding: '18px 22px',
    background: `linear-gradient(135deg, ${t.bgCard}e6 0%, ${primaryColor}14 100%)`,
    borderBottom: `1px solid ${t.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    flexShrink: 0,
  };

  const messagesStyle: CSSProperties = {
    flex: 1,
    overflowY: 'auto',
    padding: '20px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    scrollBehavior: 'smooth',
  };

  const chipStripStyle: CSSProperties = {
    padding: '10px 18px 6px',
    borderTop: `1px solid ${t.border}`,
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    flexShrink: 0,
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
  };

  const inputAreaStyle: CSSProperties = {
    padding: '10px 16px 16px',
    borderTop: `1px solid ${t.border}`,
    background: `linear-gradient(0deg, ${t.bgPrimary}99 0%, transparent 100%)`,
    display: 'flex',
    gap: 10,
    alignItems: 'flex-end',
    flexShrink: 0,
  };

  const textareaStyle: CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    background: t.bgInput,
    border: `1px solid ${t.border}`,
    borderRadius: 12,
    color: t.textPrimary,
    fontFamily: 'inherit',
    fontSize: 14,
    outline: 'none',
    direction: 'rtl',
    resize: 'none',
    lineHeight: 1.5,
    minHeight: 44,
    maxHeight: 100,
  };

  const sendBtnStyle: CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: 12,
    border: 'none',
    background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)`,
    color: 'white',
    cursor: isProcessing || !inputValue.trim() ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    boxShadow: `0 2px 12px ${t.accentGlow}`,
    opacity: !inputValue.trim() ? 0.4 : 1,
    transition: 'opacity 0.15s ease',
  };

  return (
    <div className={className} style={containerStyle}>
      {/* ── Header ── */}
      <div style={headerStyle}>
        <div style={{ position: 'relative' }}>
          <Avatar avatar={agentAvatar} agentName={agentName} size={48} accent={primaryColor} />
          <div
            style={{
              position: 'absolute',
              bottom: 1,
              left: 1,
              width: 13,
              height: 13,
              background: t.onlineGreen,
              borderRadius: 9999,
              border: `2.5px solid ${t.bgSecondary}`,
              animation: 'faqchat-pulseOnline 2s ease-in-out infinite',
            }}
          />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: t.textPrimary, lineHeight: 1.3 }}>
            {agentName} — {agentTitle}
          </div>
          <div
            style={{
              fontSize: 13,
              color: t.onlineGreen,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              marginTop: 2,
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                background: t.onlineGreen,
                borderRadius: 9999,
                display: 'inline-block',
              }}
            />
            {statusText}
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div ref={messagesRef} style={messagesStyle}>
        {/* Welcome */}
        <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
          <span style={{ fontSize: 36, display: 'block', marginBottom: 8 }}>{welcomeEmoji}</span>
          <p style={{ fontSize: 14, color: t.textSecondary, lineHeight: 1.6 }}>{welcomeText}</p>
        </div>

        {/* Messages */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              gap: 10,
              maxWidth: '88%',
              alignSelf: msg.type === 'bot' ? 'flex-start' : 'flex-end',
              flexDirection: msg.type === 'user' ? 'row-reverse' : 'row',
              animation: 'faqchat-fadeSlideIn 0.3s ease-out',
            }}
          >
            <div style={{ marginTop: 4 }}>
              {msg.type === 'bot' ? (
                <Avatar avatar={agentAvatar} agentName={agentName} size={32} accent={primaryColor} />
              ) : (
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 9999,
                    background: `linear-gradient(135deg, ${t.bgBubbleUser}, ${primaryColor})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'white',
                  }}
                >
                  {'\u{1F464}'}
                </div>
              )}
            </div>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 16,
                ...(msg.type === 'bot'
                  ? { background: t.bgBubbleBot, color: t.textPrimary, borderBottomLeftRadius: 4 }
                  : { background: t.bgBubbleUser, color: 'white', borderBottomRightRadius: 4 }),
                fontSize: 14.5,
                lineHeight: 1.65,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: msg.html }} />
              <div
                style={{
                  fontSize: 11,
                  color: msg.type === 'user' ? t.userTimeColor : t.textMuted,
                  marginTop: 5,
                  textAlign: msg.type === 'user' ? 'end' : 'start',
                }}
              >
                {msg.time}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {showTyping && (
          <div
            style={{
              display: 'flex',
              gap: 10,
              alignSelf: 'flex-start',
              maxWidth: '88%',
              animation: 'faqchat-fadeSlideIn 0.3s ease-out',
            }}
          >
            <div style={{ marginTop: 4 }}>
              <Avatar avatar={agentAvatar} agentName={agentName} size={32} accent={primaryColor} />
            </div>
            <div
              style={{
                background: t.bgBubbleBot,
                padding: '14px 20px',
                borderRadius: 16,
                borderBottomLeftRadius: 4,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 7,
                    height: 7,
                    background: t.textSecondary,
                    borderRadius: 9999,
                    animation: `faqchat-typingBounce 1.2s ease-in-out infinite`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Suggestion Chips ── */}
      <div style={chipStripStyle}>
        {presetQuestions.map((item, i) => (
          <button
            key={i}
            disabled={disabledChips.has(i) || isProcessing}
            onClick={() => handlePresetClick(i)}
            style={{
              flexShrink: 0,
              background: t.bgCard,
              border: `1px solid ${t.border}`,
              borderRadius: 9999,
              padding: '8px 16px',
              color: t.textPrimary,
              fontFamily: 'inherit',
              fontSize: 12.5,
              cursor: disabledChips.has(i) || isProcessing ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              opacity: disabledChips.has(i) ? 0.35 : 1,
              transition: 'opacity 0.15s ease',
            }}
          >
            <span style={{ fontSize: 13 }}>{item.icon}</span>
            {item.q}
          </button>
        ))}
      </div>

      {/* ── Input Area ── */}
      <div style={inputAreaStyle}>
        <div style={{ flex: 1 }}>
          <textarea
            ref={inputRef}
            rows={1}
            placeholder={inputPlaceholder}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            style={textareaStyle}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || isProcessing}
          aria-label={'\u05E9\u05DC\u05D7'}
          style={sendBtnStyle}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
