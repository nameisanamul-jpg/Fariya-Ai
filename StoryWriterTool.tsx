import React, { useState } from 'react';
import { BookOpen, Sparkles, Copy, Check, RefreshCw, AlertCircle, Cpu } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const StoryWriterTool: React.FC = () => {
  const { addSavedGeneration } = useApp();
  const [topic, setTopic] = useState(
    'A curious little star who wants to visit Earth and help a lost firefly find its way home'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [storyResult, setStoryResult] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [model, setModel] = useState<string>('gemini-3.1-flash-lite');

  const sampleTopics = [
    'A friendly baby dragon who is afraid of the dark',
    'Two squirrel siblings building a treehouse bakery in the forest',
    'A magical paintbrush that brings kindness to a quiet village',
    'A little robot who learns how to plant a flower garden',
  ];

  const handleGenerate = async () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    const messageContent = `Write a short children's story in simple, easy-to-read English about the following topic: "${trimmedTopic}". Give the story a cheerful title, clear paragraphs, and a warm moral lesson at the end.`;

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

      const generatedStory = data.reply || data.result || '';
      if (!generatedStory) {
        throw new Error('No story content was returned from the Gemini API.');
      }

      if (data.model) {
        setModel(data.model);
      }

      setStoryResult(generatedStory);

      addSavedGeneration({
        toolId: 'ai-story',
        toolName: 'AI Story Writer',
        prompt: trimmedTopic,
        outputPreview: generatedStory.slice(0, 120) + '...',
        type: 'text',
      });
    } catch (err: any) {
      console.error('Story Writer error:', err);
      setErrorMessage(err?.message || 'Could not generate story from Gemini API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!storyResult) return;
    try {
      await navigator.clipboard.writeText(storyResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = storyResult;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const wordCount = storyResult ? storyResult.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="bg-[#090d20] rounded-2xl border border-purple-950/60 overflow-hidden text-slate-100 p-4 sm:p-6 shadow-2xl">
      {/* Top Status Bar */}
      <div className="bg-purple-950/40 border border-purple-900/40 rounded-xl p-3 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-emerald-300">Gemini API Live</span>
          <span className="text-slate-400">· Children&apos;s Story Writer (Simple English)</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-purple-200 bg-[#101636] border border-purple-900/40 px-2.5 py-1 rounded-lg font-mono">
          <Cpu className="h-3 w-3 text-purple-400" />
          <span>{model}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label
              htmlFor="story-topic-input"
              className="block text-xs font-semibold text-slate-200 mb-1.5"
            >
              Story Topic
            </label>
            <textarea
              id="story-topic-input"
              rows={4}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
              placeholder="Enter a story topic (e.g., A brave little turtle who learns to share)..."
              className="w-full bg-[#101636] border border-purple-900/50 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors"
            />
          </div>

          {/* Quick Sample Topics */}
          <div>
            <div className="text-[11px] font-semibold text-purple-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-purple-400" />
              <span>Try a sample story topic:</span>
            </div>
            <div className="space-y-1.5">
              {sampleTopics.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setTopic(sample)}
                  className="w-full px-3 py-2 rounded-lg text-xs text-left bg-[#0f1533] hover:bg-[#16204e] text-slate-300 hover:text-white border border-purple-950/60 transition-colors truncate"
                >
                  {sample}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950 transition-all min-h-[48px]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-purple-200" />
                <span>Generating Story...</span>
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4" />
                <span>Generate Story</span>
              </>
            )}
          </button>
        </div>

        {/* Right Result Area */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-purple-950/60">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-200">Story Result</span>
              {wordCount > 0 && (
                <span className="text-slate-400 font-mono text-[11px]">· {wordCount} words</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!storyResult}
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
                  <span>Copy Story</span>
                </>
              )}
            </button>
          </div>

          <div className="relative rounded-xl border border-purple-900/40 bg-[#070a1a] flex-1 min-h-[360px] max-h-[500px] overflow-y-auto p-4 sm:p-5">
            {isLoading ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                <p className="text-xs sm:text-sm text-purple-300 font-medium">
                  Writing your children&apos;s story in simple English...
                </p>
                <p className="text-[11px] text-slate-500">Powered by Google Gemini API</p>
              </div>
            ) : errorMessage ? (
              <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/50 text-xs text-red-200 space-y-3">
                <div className="flex items-center gap-2 font-bold text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Unable to Generate Story</span>
                </div>
                <p>{errorMessage}</p>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-white font-medium text-xs flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            ) : storyResult ? (
              <div className="whitespace-pre-wrap text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                {storyResult}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
                <BookOpen className="h-8 w-8 text-purple-400/60 mb-1" />
                <div className="text-sm font-semibold text-slate-200">Ready to Write a Story</div>
                <p className="text-xs max-w-sm">
                  Enter a story topic on the left and click{' '}
                  <strong className="text-white">Generate Story</strong> to create a short
                  children&apos;s story in simple English.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

