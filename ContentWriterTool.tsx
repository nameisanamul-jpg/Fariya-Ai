import React, { useState } from 'react';
import { PenTool, Sparkles, Copy, Check, RefreshCw, AlertCircle, Cpu, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';

type ContentTypeOption =
  | 'YouTube Title'
  | 'Description'
  | 'Keywords'
  | 'Hashtags'
  | 'Social Media Post';

export const ContentWriterTool: React.FC = () => {
  const { addSavedGeneration } = useApp();
  const [topic, setTopic] = useState(
    'How beginners can use AI productivity tools to save 10 hours every week'
  );
  const [contentType, setContentType] = useState<ContentTypeOption>('YouTube Title');
  const [isLoading, setIsLoading] = useState(false);
  const [contentResult, setContentResult] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [model, setModel] = useState<string>('gemini-3.1-flash-lite-preview');

  const contentTypes: ContentTypeOption[] = [
    'YouTube Title',
    'Description',
    'Keywords',
    'Hashtags',
    'Social Media Post',
  ];

  const sampleTopics = [
    'Top 5 budget smartphone photography tips for stunning travel videos',
    'Healthy 15-minute high-protein breakfast recipes for busy mornings',
    'Complete beginner guide to launching a successful online store in 2026',
  ];

  const buildPromptForContentType = (selectedType: ContentTypeOption, userTopic: string): string => {
    switch (selectedType) {
      case 'YouTube Title':
        return `Generate 10 original, high-converting, click-worthy YouTube video titles in clear English for the following topic:\n"${userTopic}"\n\nInclude a mix of curiosity-driven, tutorial/how-to, and listicle styles, plus a brief tip on which title works best for high click-through rate (CTR).`;
      case 'Description':
        return `Write an original, engaging, SEO-optimized YouTube & content description in clear English for the following topic:\n"${userTopic}"\n\nInclude:\n1. A compelling opening hook (first 2 lines)\n2. Detailed overview of what viewers/readers will learn\n3. Suggested video chapters/timestamps\n4. Call-to-action (subscribe, comment, share)`;
      case 'Keywords':
        return `Generate a comprehensive list of original, high-value SEO keywords and search phrases in English for the following topic:\n"${userTopic}"\n\nOrganize them clearly into:\n1. Primary High-Intent Keywords\n2. Long-Tail Search Queries\n3. Questions People Ask (Search Intent)\n4. Related Semantic Tags`;
      case 'Hashtags':
        return `Generate a strategic set of original, relevant hashtags in English for the following topic:\n"${userTopic}"\n\nGroup them into:\n1. High-Reach Broad Hashtags\n2. Niche & Targeted Community Hashtags\n3. Trending & Discovery Hashtags\n4. A ready-to-copy block of the top 15 hashtags`;
      case 'Social Media Post':
        return `Write original, engaging, ready-to-publish English social media posts for the following topic:\n"${userTopic}"\n\nProvide tailored versions for:\n1. LinkedIn / Facebook Post (value-driven storytelling with clear takeaways)\n2. Instagram Caption (engaging hook + bullet points + call to action)\n3. X / Short-Form Post (punchy, shareable highlight)`;
    }
  };

  const handleGenerate = async () => {
    const trimmedTopic = topic.trim();
    if (!trimmedTopic || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    const messageContent = buildPromptForContentType(contentType, trimmedTopic);

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

      const generatedContent = data.reply || data.result || '';
      if (!generatedContent) {
        throw new Error('No content was returned from the Gemini API.');
      }

      if (data.model) {
        setModel(data.model);
      }

      setContentResult(generatedContent);

      addSavedGeneration({
        toolId: 'ai-content',
        toolName: 'AI Content Writer',
        prompt: `[${contentType}] ${trimmedTopic}`,
        outputPreview: generatedContent.slice(0, 120) + '...',
        type: 'text',
      });
    } catch (err: any) {
      console.error('Content Writer error:', err);
      setErrorMessage(err?.message || 'Could not generate content from Gemini API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!contentResult) return;
    try {
      await navigator.clipboard.writeText(contentResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = contentResult;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const wordCount = contentResult ? contentResult.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="bg-[#090d20] rounded-2xl border border-purple-950/60 overflow-hidden text-slate-100 p-4 sm:p-6 shadow-2xl">
      {/* Top Status Bar */}
      <div className="bg-purple-950/40 border border-purple-900/40 rounded-xl p-3 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-emerald-300">Gemini API Live</span>
          <span className="text-slate-400">· Creator & Social Content Writer</span>
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
              htmlFor="content-topic-input"
              className="block text-xs font-semibold text-slate-200 mb-1.5"
            >
              Content Topic
            </label>
            <textarea
              id="content-topic-input"
              rows={4}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
              placeholder="Enter your video, article, or social media topic..."
              className="w-full bg-[#101636] border border-purple-900/50 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors"
            />
          </div>

          {/* Content Type Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Select Content Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {contentTypes.map((ct) => (
                <button
                  key={ct}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setContentType(ct)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-colors border ${
                    contentType === ct
                      ? 'bg-purple-900/60 border-purple-500 text-white font-semibold shadow-sm'
                      : 'bg-[#0f1533] border-purple-950/60 text-slate-300 hover:text-white hover:bg-[#151c44]'
                  }`}
                >
                  {ct}
                </button>
              ))}
            </div>
          </div>

          {/* Sample Topics */}
          <div>
            <div className="text-[11px] font-semibold text-purple-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-purple-400" />
              <span>Try a sample topic:</span>
            </div>
            <div className="space-y-1.5">
              {sampleTopics.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setTopic(sample)}
                  className="w-full px-3 py-1.5 rounded-lg text-xs text-left bg-[#0f1533] hover:bg-[#16204e] text-slate-300 hover:text-white border border-purple-950/60 transition-colors truncate"
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
                <span>Generating {contentType}...</span>
              </>
            ) : (
              <>
                <PenTool className="h-4 w-4" />
                <span>Generate {contentType}</span>
              </>
            )}
          </button>
        </div>

        {/* Right Result Area */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-purple-950/60">
            <div className="flex items-center gap-2 text-xs">
              <FileText className="h-3.5 w-3.5 text-purple-400" />
              <span className="font-semibold text-slate-200">Generated {contentType}</span>
              {wordCount > 0 && (
                <span className="text-slate-400 font-mono text-[11px]">· {wordCount} words</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!contentResult}
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
                  <span>Copy Content</span>
                </>
              )}
            </button>
          </div>

          <div className="relative rounded-xl border border-purple-900/40 bg-[#070a1a] flex-1 min-h-[360px] max-h-[520px] overflow-y-auto p-4 sm:p-5">
            {isLoading ? (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                <p className="text-xs sm:text-sm text-purple-300 font-medium">
                  Generating original {contentType} in English...
                </p>
                <p className="text-[11px] text-slate-500">Powered by Google Gemini API</p>
              </div>
            ) : errorMessage ? (
              <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/50 text-xs text-red-200 space-y-3">
                <div className="flex items-center gap-2 font-bold text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Unable to Generate Content</span>
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
            ) : contentResult ? (
              <div className="whitespace-pre-wrap text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                {contentResult}
              </div>
            ) : (
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
                <PenTool className="h-8 w-8 text-purple-400/60 mb-1" />
                <div className="text-sm font-semibold text-slate-200">
                  Ready to Generate Your Content
                </div>
                <p className="text-xs max-w-sm">
                  Enter your topic on the left, choose a content type (YouTube Title, Description,
                  Keywords, Hashtags, or Social Media Post), and click{' '}
                  <strong className="text-white">Generate {contentType}</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

