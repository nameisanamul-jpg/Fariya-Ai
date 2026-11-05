import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  AlertCircle,
  RefreshCw,
  Cpu,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
  isError?: boolean;
}

// Clean markdown text formatter for AI responses
const FormattedText: React.FC<{ content: string }> = ({ content }) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState<number | null>(null);

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  // Split by code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-200">
      {parts.map((part, pIdx) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3).trim().split('\n');
          const firstLine = lines[0].trim();
          const hasLang = /^[a-zA-Z0-9_-]+$/.test(firstLine);
          const lang = hasLang ? firstLine : '';
          const code = (hasLang ? lines.slice(1) : lines).join('\n');

          return (
            <div key={pIdx} className="my-2 rounded-lg bg-[#070a1a] border border-purple-950/80 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 bg-[#0d122d] border-b border-purple-950/60 text-[11px] text-slate-400">
                <span className="font-mono text-purple-300">{lang || 'code'}</span>
                <button
                  type="button"
                  onClick={() => copyCode(code, pIdx)}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  {copiedCodeIdx === pIdx ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-3 font-mono text-[11px] sm:text-xs overflow-x-auto text-purple-100">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Standard text lines
        const lines = part.split('\n');
        return (
          <div key={pIdx} className="space-y-1.5">
            {lines.map((line, lIdx) => {
              if (!line.trim()) return <div key={lIdx} className="h-1" />;

              // Headers
              if (line.startsWith('### ')) {
                return (
                  <h4 key={lIdx} className="text-sm font-bold text-white pt-1">
                    {renderInlineMarkdown(line.slice(4))}
                  </h4>
                );
              }
              if (line.startsWith('## ')) {
                return (
                  <h3 key={lIdx} className="text-base font-bold text-white pt-2">
                    {renderInlineMarkdown(line.slice(3))}
                  </h3>
                );
              }
              if (line.startsWith('# ')) {
                return (
                  <h2 key={lIdx} className="text-lg font-extrabold text-white pt-2">
                    {renderInlineMarkdown(line.slice(2))}
                  </h2>
                );
              }

              // Bullet points
              if (line.trim().startsWith('• ') || line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                const bulletText = line.trim().replace(/^[•\-\*]\s+/, '');
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-purple-400 mt-1 text-[10px]">●</span>
                    <span>{renderInlineMarkdown(bulletText)}</span>
                  </div>
                );
              }

              // Numbered list items
              if (/^\d+\.\s+/.test(line.trim())) {
                const match = line.trim().match(/^(\d+\.)\s+(.*)/);
                if (match) {
                  return (
                    <div key={lIdx} className="flex items-start gap-2 pl-2">
                      <span className="font-mono text-purple-400 text-xs font-semibold">{match[1]}</span>
                      <span>{renderInlineMarkdown(match[2])}</span>
                    </div>
                  );
                }
              }

              return <p key={lIdx}>{renderInlineMarkdown(line)}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
};

// Safe inline markdown renderer (bold, italics, inline code) returning escaped React elements
function renderInlineMarkdown(text: string): React.ReactNode[] {
  // Match inline code (`...`), bold (**...**), or italic (*...*)
  const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
  const segments = text.split(tokenRegex);

  return segments.map((segment, idx) => {
    if (segment.startsWith('`') && segment.endsWith('`') && segment.length > 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-[#070a1a] border border-purple-900/40 text-purple-300 font-mono text-[11px]"
        >
          {segment.slice(1, -1)}
        </code>
      );
    }
    if (segment.startsWith('**') && segment.endsWith('**') && segment.length > 4) {
      return (
        <strong key={idx} className="font-bold text-white">
          {segment.slice(2, -2)}
        </strong>
      );
    }
    if (segment.startsWith('*') && segment.endsWith('*') && segment.length > 2) {
      return (
        <em key={idx} className="italic text-purple-200">
          {segment.slice(1, -1)}
        </em>
      );
    }
    return <React.Fragment key={idx}>{segment}</React.Fragment>;
  });
}

export const ChatDemo: React.FC = () => {
  const { addSavedGeneration } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! I am **Fariya AI**, connected directly to Google Gemini. Ask me anything—from complex code architectures and technical questions to creative copywriting and strategy.",
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [model, setModel] = useState<string>('gemini-3.1-flash-lite');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const presets = [
    'Explain how Google Gemini multimodal reasoning works',
    'Write a TypeScript helper to debounce rapid user inputs',
    'Draft a launch email announcing Fariya AI platform',
    'Compare microservices vs monolithic architecture tradeoffs'
  ];

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, errorMessage]);

  const handleSend = async (textToSend?: string) => {
    const messageContent = (textToSend !== undefined ? textToSend : input).trim();
    if (!messageContent || isLoading) return;

    setErrorMessage(null);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: messageContent,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentHistory = messages
      .filter(m => !m.isError)
      .map(m => ({ role: m.role, text: m.text }));

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageContent,
          history: currentHistory,
          model: model
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      if (!data.reply) {
        throw new Error('No reply content was returned from Gemini API.');
      }

      if (data.model) {
        setModel(data.model);
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);

      // Save to local generations
      addSavedGeneration({
        toolId: 'ai-chat',
        toolName: 'AI Chat (Gemini)',
        prompt: messageContent,
        outputPreview: data.reply.slice(0, 100) + '...',
        type: 'text'
      });
    } catch (err: any) {
      console.error('Chat error:', err);
      const readableError = err?.message || 'Could not connect to Gemini API.';
      setErrorMessage(readableError);

      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: `⚠️ **Unable to generate response**\n\n${readableError}\n\n*Note: Ensure \`GEMINI_API_KEY\` is configured in your project secrets (Settings > Secrets).*`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
      // Refocus input on desktop
      if (window.innerWidth > 768) {
        inputRef.current?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        text: "Chat cleared. I'm ready for your next question or task!",
        time: 'Just now'
      }
    ]);
    setErrorMessage(null);
  };

  const copyMessage = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-[620px] max-h-[80vh] bg-[#090d20] rounded-2xl border border-purple-950/60 overflow-hidden text-slate-100 shadow-2xl">
      {/* Top Header Bar */}
      <div className="bg-[#0b1029] border-b border-purple-950/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">Fariya AI Chat</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>Gemini API Live</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Connected via secure server proxy · Model: {model}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Model indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#101636] border border-purple-900/40 text-[11px] text-purple-200">
            <Cpu className="h-3 w-3 text-purple-400" />
            <span className="font-mono">{model}</span>
          </div>

          {/* Clear chat button */}
          <button
            type="button"
            onClick={clearChat}
            className="px-2.5 py-1.5 rounded-lg bg-[#101636] hover:bg-[#18214d] text-slate-300 hover:text-white border border-purple-900/40 text-xs flex items-center gap-1.5 transition-colors min-h-[36px]"
            title="Reset conversation"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Chat</span>
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex gap-3 max-w-3xl ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                m.role === 'user'
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
                  : m.isError
                  ? 'bg-red-950 text-red-400 border border-red-800/50'
                  : 'bg-gradient-to-br from-purple-700 to-indigo-800 text-purple-200 border border-purple-600/40'
              }`}
            >
              {m.role === 'user' ? (
                <User className="h-4 w-4" />
              ) : m.isError ? (
                <AlertCircle className="h-4 w-4" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`group relative rounded-2xl px-4 sm:px-5 py-3.5 text-xs sm:text-sm leading-relaxed max-w-[88%] sm:max-w-[82%] shadow-lg ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border border-purple-400/20'
                  : m.isError
                  ? 'bg-[#180e1a] border border-red-900/50 text-red-200'
                  : 'bg-[#0f1538] border border-purple-900/50 text-slate-100'
              }`}
            >
              {m.role === 'user' ? (
                <div className="whitespace-pre-wrap">{m.text}</div>
              ) : (
                <FormattedText content={m.text} />
              )}

              {/* Timestamp & Copy Action */}
              <div
                className={`flex items-center justify-between mt-2 pt-2 border-t text-[10px] ${
                  m.role === 'user'
                    ? 'border-white/15 text-purple-200'
                    : 'border-purple-950/80 text-slate-400'
                }`}
              >
                <span>{m.time}</span>
                <button
                  type="button"
                  onClick={() => copyMessage(m.text, m.id)}
                  className="opacity-75 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:text-white flex items-center gap-1"
                  title="Copy message"
                >
                  {copiedId === m.id ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-3xl">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-700 to-indigo-800 text-purple-200 border border-purple-600/40 flex items-center justify-center shrink-0 shadow-md">
              <Bot className="h-4 w-4" />
            </div>

            <div className="rounded-2xl px-5 py-3.5 bg-[#0f1538] border border-purple-900/50 text-slate-200 flex items-center gap-3 shadow-lg">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-purple-300 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
              <span className="text-xs text-purple-300 font-medium">Fariya AI is reasoning...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starters (Only when conversation is fresh) */}
      {messages.length <= 2 && !isLoading && (
        <div className="px-4 py-2 border-t border-purple-950/60 bg-[#070a1a] flex gap-2 overflow-x-auto text-xs no-scrollbar shrink-0">
          <span className="text-[11px] text-purple-400 font-medium shrink-0 py-1.5 flex items-center gap-1">
            <Sparkles className="h-3 w-3" /> Try asking:
          </span>
          {presets.map((preset, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(preset)}
              className="whitespace-nowrap shrink-0 px-3 py-1.5 rounded-lg bg-[#0e1435] hover:bg-[#16204e] text-slate-300 hover:text-white border border-purple-900/40 transition-colors text-xs min-h-[36px]"
            >
              {preset}
            </button>
          ))}
        </div>
      )}

      {/* Error Retry Bar (If last request failed) */}
      {errorMessage && (
        <div className="px-4 py-2 bg-red-950/70 border-t border-red-900/60 flex items-center justify-between gap-2 text-xs text-red-200 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
            <span className="truncate">{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              const lastUser = [...messages].reverse().find(m => m.role === 'user');
              if (lastUser) handleSend(lastUser.text);
            }}
            className="px-2.5 py-1 rounded bg-red-900/60 hover:bg-red-800 text-white font-medium text-[11px] flex items-center gap-1 shrink-0 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Message Input Box & Send Button */}
      <div className="p-3 sm:p-4 bg-[#0a0e26] border-t border-purple-950/80 shrink-0">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-end gap-2"
        >
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Fariya AI anything... (Press Enter to send, Shift+Enter for newline)"
              disabled={isLoading}
              className="w-full bg-[#101638] border border-purple-900/50 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors resize-none max-h-32 min-h-[48px]"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-12 px-5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950 transition-all shrink-0 min-w-[48px] min-h-[48px]"
            aria-label="Send message to Fariya AI"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
          <span>Powered by Google Gemini API (Server-side)</span>
          <span className="hidden sm:inline">Markdown formatting supported</span>
        </div>
      </div>
    </div>
  );
};
