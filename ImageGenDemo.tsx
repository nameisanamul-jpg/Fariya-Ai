import React, { useState } from 'react';
import { Image, Sparkles, Copy, Check, RefreshCw, AlertCircle, Cpu, Info } from 'lucide-react';
import { useApp } from '../../context/AppContext';

type ImageStyleOption =
  | '3D Cartoon'
  | 'Realistic'
  | 'Anime'
  | 'Nursery Rhymes'
  | 'Cinematic';

export const ImageGenDemo: React.FC = () => {
  const { addSavedGeneration } = useApp();
  const [imageIdea, setImageIdea] = useState(
    'A cheerful little elephant wearing a red scarf flying a colorful kite on a sunny hilltop'
  );
  const [style, setStyle] = useState<ImageStyleOption>('3D Cartoon');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('16:9');
  const [isLoading, setIsLoading] = useState(false);
  const [promptResult, setPromptResult] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [model, setModel] = useState<string>('gemini-3.1-flash-lite-preview');

  const styles: ImageStyleOption[] = [
    '3D Cartoon',
    'Realistic',
    'Anime',
    'Nursery Rhymes',
    'Cinematic',
  ];

  const aspectRatios = [
    { label: '16:9 Wide', value: '16:9' as const },
    { label: '1:1 Square', value: '1:1' as const },
    { label: '9:16 Vertical', value: '9:16' as const },
    { label: '4:3 Standard', value: '4:3' as const },
  ];

  const sampleIdeas = [
    'A friendly baby panda baking cupcakes in a colorful woodland kitchen',
    'A futuristic crystal castle floating above golden sunset clouds',
    'Two curious kittens exploring a magical glowing garden at twilight',
  ];

  const handleGeneratePrompt = async () => {
    const trimmedIdea = imageIdea.trim();
    if (!trimmedIdea || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    const messageContent = `Create a detailed, original AI image generation prompt based on the following image idea:
"${trimmedIdea}"

Selected Style: ${style}
Target Aspect Ratio: ${aspectRatio}

Please provide a comprehensive, studio-quality image prompt in clear English including all of the following sections:
1. Master Copy-Ready Image Prompt (a single cohesive paragraph combining style, subject, background, lighting, camera angle, colors, and --ar ${aspectRatio})
2. Subject Details (appearance, expressions, clothing/textures, and pose)
3. Background & Environment (setting, scenery, depth, and surrounding elements)
4. Lighting & Atmosphere (light sources, shadows, glow, and mood)
5. Camera Angle & Framing (shot type, perspective, lens feel, and focus)
6. Color Palette (primary, accent, and ambient colors)
7. Aspect Ratio & Composition Notes (${aspectRatio} framing guidance)`;

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

      const generatedPrompt = data.reply || data.result || '';
      if (!generatedPrompt) {
        throw new Error('No image prompt was returned from the Gemini API.');
      }

      if (data.model) {
        setModel(data.model);
      }

      setPromptResult(generatedPrompt);

      addSavedGeneration({
        toolId: 'ai-image',
        toolName: 'AI Image Prompt Generator',
        prompt: `[${style} · ${aspectRatio}] ${trimmedIdea}`,
        outputPreview: generatedPrompt.slice(0, 120) + '...',
        type: 'text',
      });
    } catch (err: any) {
      console.error('Image Prompt Generator error:', err);
      setErrorMessage(err?.message || 'Could not generate image prompt from Gemini API.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!promptResult) return;
    try {
      await navigator.clipboard.writeText(promptResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = promptResult;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const wordCount = promptResult ? promptResult.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="bg-[#090d20] rounded-2xl border border-purple-950/60 overflow-hidden text-slate-100 p-4 sm:p-6 shadow-2xl">
      {/* Clear Transparency Notice */}
      <div className="bg-purple-950/40 border border-purple-800/50 rounded-xl p-3.5 mb-4 flex items-start gap-3 text-xs">
        <Info className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-purple-200">
            AI Image Prompt Generator Mode (Free-Tier Gemini API)
          </div>
          <p className="text-slate-300 leading-relaxed">
            This tool generates detailed, ready-to-use <strong className="text-white">image prompts</strong>—not actual rendered images—until a free image-generation service is available (current Gemini image models have zero free-tier quota and paid APIs/billing are disabled).
          </p>
        </div>
      </div>

      {/* Top Status Bar */}
      <div className="bg-[#0d1330] border border-purple-900/40 rounded-xl p-3 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-emerald-300">Gemini API Live</span>
          <span className="text-slate-400">· Detailed Visual Prompt Architect</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-purple-200 bg-[#101636] border border-purple-900/40 px-2.5 py-1 rounded-lg font-mono">
          <Cpu className="h-3 w-3 text-purple-400" />
          <span>{model}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Controls Column */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label
              htmlFor="image-idea-input"
              className="block text-xs font-semibold text-slate-200 mb-1.5"
            >
              Describe Your Image Idea
            </label>
            <textarea
              id="image-idea-input"
              rows={4}
              value={imageIdea}
              onChange={(e) => setImageIdea(e.target.value)}
              disabled={isLoading}
              placeholder="Describe the subject, scene, or concept for your image prompt..."
              className="w-full bg-[#101636] border border-purple-900/50 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors"
            />
          </div>

          {/* Style Options */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Select Visual Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {styles.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setStyle(s)}
                  className={`px-3 py-2.5 rounded-xl text-xs font-medium text-center transition-colors border ${
                    style === s
                      ? 'bg-purple-900/60 border-purple-500 text-white font-semibold shadow-sm'
                      : 'bg-[#0f1533] border-purple-950/60 text-slate-300 hover:text-white hover:bg-[#151c44]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {aspectRatios.map((ar) => (
                <button
                  key={ar.value}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setAspectRatio(ar.value)}
                  className={`px-2 py-2 rounded-lg text-xs font-medium text-center transition-colors border ${
                    aspectRatio === ar.value
                      ? 'bg-purple-900/60 border-purple-500 text-white font-semibold'
                      : 'bg-[#0f1533] border-purple-950/60 text-slate-400 hover:text-slate-200 hover:bg-[#151c44]'
                  }`}
                >
                  {ar.value}
                </button>
              ))}
            </div>
          </div>

          {/* Sample Ideas */}
          <div>
            <div className="text-[11px] font-semibold text-purple-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-purple-400" />
              <span>Try a sample image idea:</span>
            </div>
            <div className="space-y-1.5">
              {sampleIdeas.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setImageIdea(sample)}
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
            onClick={handleGeneratePrompt}
            disabled={isLoading || !imageIdea.trim()}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950 transition-all min-h-[48px]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-purple-200" />
                <span>Generating Image Prompt...</span>
              </>
            ) : (
              <>
                <Image className="h-4 w-4" />
                <span>Generate Image Prompt</span>
              </>
            )}
          </button>
        </div>

        {/* Right Result Area Column */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-purple-950/60">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <span>Generated Image Prompt ({style} · {aspectRatio})</span>
              {wordCount > 0 && (
                <span className="text-slate-400 font-mono text-[11px]">· {wordCount} words</span>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopy}
              disabled={!promptResult}
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
                  <span>Copy Prompt</span>
                </>
              )}
            </button>
          </div>

          <div className="relative rounded-xl border border-purple-900/40 bg-[#070a1a] flex-1 min-h-[380px] max-h-[540px] overflow-y-auto p-4 sm:p-5">
            {isLoading ? (
              <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                <p className="text-xs sm:text-sm text-purple-300 font-medium">
                  Crafting {style} image prompt with subject, lighting, camera angle &amp; colors...
                </p>
                <p className="text-[11px] text-slate-500">Powered by Google Gemini API</p>
              </div>
            ) : errorMessage ? (
              <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/50 text-xs text-red-200 space-y-3">
                <div className="flex items-center gap-2 font-bold text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Unable to Generate Image Prompt</span>
                </div>
                <p>{errorMessage}</p>
                <button
                  type="button"
                  onClick={handleGeneratePrompt}
                  className="px-3 py-1.5 rounded-lg bg-red-900/60 hover:bg-red-800 text-white font-medium text-xs flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Try Again</span>
                </button>
              </div>
            ) : promptResult ? (
              <div className="whitespace-pre-wrap text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                {promptResult}
              </div>
            ) : (
              <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
                <Image className="h-8 w-8 text-purple-400/60 mb-1" />
                <div className="text-sm font-semibold text-slate-200">
                  Ready to Generate Your Detailed Image Prompt
                </div>
                <p className="text-xs max-w-sm">
                  Enter your image idea on the left, pick a style (3D Cartoon, Realistic, Anime,
                  Nursery Rhymes, or Cinematic), and click{' '}
                  <strong className="text-white">Generate Image Prompt</strong> to create a
                  complete prompt with subject, background, lighting, camera angle, colors, and
                  aspect ratio.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


