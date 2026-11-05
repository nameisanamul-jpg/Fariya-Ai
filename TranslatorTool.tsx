import React, { useState } from 'react';
import { Languages, Sparkles, Copy, Check, RefreshCw, AlertCircle, Cpu, ArrowRightLeft } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const TranslatorTool: React.FC = () => {
  const { addSavedGeneration } = useApp();
  const [originalText, setOriginalText] = useState(
    'Welcome to Fariya AI. Our platform empowers creators and teams around the world to communicate effortlessly across languages and turn ideas into reality.'
  );
  const [sourceLang, setSourceLang] = useState('Auto Detect');
  const [targetLang, setTargetLang] = useState('Hindi');
  const [isLoading, setIsLoading] = useState(false);
  const [translatedResult, setTranslatedResult] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [model, setModel] = useState<string>('gemini-3.1-flash-lite-preview');

  const languages = [
    'English',
    'Hindi',
    'Urdu',
    'Bengali',
    'Arabic',
    'Spanish',
    'French',
    'German',
    'Portuguese',
    'Japanese',
    'Chinese (Simplified)',
    'Korean',
    'Turkish',
    'Italian',
    'Russian',
  ];

  const sampleTexts = [
    'Technology is most powerful when it brings people together across every language and culture.',
    'Thank you for your partnership. We look forward to launching our new project together next week.',
    'Good morning! Wishing you a peaceful, productive, and inspiring day ahead.',
  ];

  const swapLanguages = () => {
    if (isLoading) return;
    if (sourceLang === 'Auto Detect') {
      setSourceLang(targetLang);
      setTargetLang('English');
    } else {
      const prevSource = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(prevSource);
    }
  };

  const handleTranslate = async () => {
    const trimmedText = originalText.trim();
    if (!trimmedText || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    const sourceInstruction =
      sourceLang === 'Auto Detect'
        ? 'automatically detect the source language of the text'
        : `translate from ${sourceLang}`;

    const messageContent = `Please ${sourceInstruction} and translate the following text accurately and naturally into ${targetLang}.

Original Text:
"${trimmedText}"

Provide:
1. The direct, natural translation in ${targetLang}.
2. If ${targetLang} uses a non-Latin script (such as Hindi, Urdu, Bengali, Arabic, Japanese, etc.), also include a helpful Romanized pronunciation guide below the translation.`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          history: [],
          model: model,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      const translatedText = data.reply || data.result || '';
      if (!translatedText) {
        throw new Error('No translation was returned from the Gemini API.');
      }

      if (data.model) {
        setModel(data.model);
      }

      setTranslatedResult(translatedText);

      addSavedGeneration({
        toolId: 'ai-translator',
        toolName: 'AI Translator',
        prompt: `[${sourceLang} → ${targetLang}] ${trimmedText}`,
        outputPreview: translatedText.slice(0, 120) + '...',
        type: 'text',
      });
    } catch (err: any) {
      console.error('Translator error:', err);
      setErrorMessage(err?.message || 'Could not translate text using the Gemini API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!translatedResult) return;
    try {
      await navigator.clipboard.writeText(translatedResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = translatedResult;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-[#090d20] rounded-2xl border border-purple-950/60 overflow-hidden text-slate-100 p-4 sm:p-6 shadow-2xl">
      {/* Top Status Bar */}
      <div className="bg-purple-950/40 border border-purple-900/40 rounded-xl p-3 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-emerald-300">Gemini API Live</span>
          <span className="text-slate-400">· Neural Multi-Language Translator</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-purple-200 bg-[#101636] border border-purple-900/40 px-2.5 py-1 rounded-lg font-mono">
          <Cpu className="h-3 w-3 text-purple-400" />
          <span>{model}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls */}
        <div className="lg:col-span-5 space-y-4">
          {/* Source & Target Language Selection */}
          <div className="grid grid-cols-11 gap-2 items-end">
            <div className="col-span-5">
              <label
                htmlFor="source-lang-select"
                className="block text-xs font-semibold text-slate-200 mb-1"
              >
                Source Language
              </label>
              <select
                id="source-lang-select"
                value={sourceLang}
                disabled={isLoading}
                onChange={(e) => setSourceLang(e.target.value)}
                className="w-full bg-[#101636] border border-purple-900/50 rounded-xl px-2.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              >
                <option value="Auto Detect">Auto Detect</option>
                {languages.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-1 flex justify-center">
              <button
                type="button"
                onClick={swapLanguages}
                disabled={isLoading}
                className="p-2.5 rounded-xl bg-[#101636] hover:bg-[#1a2352] border border-purple-900/50 text-purple-300 hover:text-white transition-colors"
                title="Swap Languages"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="col-span-5">
              <label
                htmlFor="target-lang-select"
                className="block text-xs font-semibold text-slate-200 mb-1"
              >
                Target Language
              </label>
              <select
                id="target-lang-select"
                value={targetLang}
                disabled={isLoading}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full bg-[#101636] border border-purple-900/50 rounded-xl px-2.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              >
                {languages.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Target Language Buttons */}
          <div>
            <span className="block text-[11px] font-semibold text-slate-300 mb-1.5">
              Popular Target Languages:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {['English', 'Hindi', 'Urdu', 'Bengali', 'Arabic', 'Spanish', 'French'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setTargetLang(lang)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                    targetLang === lang
                      ? 'bg-purple-900/60 border-purple-500 text-white font-semibold'
                      : 'bg-[#0f1533] border-purple-950/60 text-slate-300 hover:text-white hover:bg-[#151c44]'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Original Text Input Box */}
          <div>
            <label
              htmlFor="translator-input-box"
              className="block text-xs font-semibold text-slate-200 mb-1.5"
            >
              Original Text
            </label>
            <textarea
              id="translator-input-box"
              rows={5}
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              disabled={isLoading}
              placeholder="Enter text in any language to translate..."
              className="w-full bg-[#101636] border border-purple-900/50 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors"
            />
          </div>

          {/* Sample Texts */}
          <div>
            <div className="text-[11px] font-semibold text-purple-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-purple-400" />
              <span>Try sample text:</span>
            </div>
            <div className="space-y-1.5">
              {sampleTexts.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setOriginalText(sample)}
                  className="w-full px-3 py-1.5 rounded-lg text-xs text-left bg-[#0f1533] hover:bg-[#16204e] text-slate-300 hover:text-white border border-purple-950/60 transition-colors truncate"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Translate Button */}
          <button
            type="button"
            onClick={handleTranslate}
            disabled={isLoading || !originalText.trim()}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950 transition-all min-h-[48px]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-purple-200" />
                <span>Translating to {targetLang}...</span>
              </>
            ) : (
              <>
                <Languages className="h-4 w-4" />
                <span>Translate</span>
              </>
            )}
          </button>
        </div>

        {/* Right Result Area */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-purple-950/60">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-200">
                Translated Text ({sourceLang} → {targetLang})
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!translatedResult}
              className="px-3 py-1.5 rounded-lg bg-[#101636] hover:bg-[#18214d] disabled:opacity-40 border border-purple-900/40 text-xs text-slate-200 hover:text-white flex items-center gap-1.5 transition-colors min-h-[34px]"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Translation</span>
                </>
              )}
            </button>
          </div>

          <div className="relative rounded-xl border border-purple-900/40 bg-[#070a1a] flex-1 min-h-[360px] max-h-[520px] overflow-y-auto p-4 sm:p-5">
            {isLoading ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                <p className="text-xs sm:text-sm text-purple-300 font-medium">
                  Translating from {sourceLang} into {targetLang}...
                </p>
                <p className="text-[11px] text-slate-500">Powered by Google Gemini API</p>
              </div>
            ) : errorMessage ? (
              <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/50 text-xs text-red-200 space-y-3">
                <div className="flex items-center gap-2 font-bold text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Unable to Translate Text</span>
                </div>
                <p>{errorMessage}</p>
                <button
                  type="button"
                  onClick={handleTranslate}
                  className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-white font-medium text-xs flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            ) : translatedResult ? (
              <div className="whitespace-pre-wrap text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                {translatedResult}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
                <Languages className="h-8 w-8 text-purple-400/60 mb-1" />
                <div className="text-sm font-semibold text-slate-200">Ready to Translate</div>
                <p className="text-xs max-w-sm">
                  Enter your original text on the left, select your source language (or{' '}
                  <strong className="text-white">Auto Detect</strong>) and target language, then
                  click <strong className="text-white">Translate</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

