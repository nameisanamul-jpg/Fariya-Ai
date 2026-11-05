import React, { useState } from 'react';
import { Film, Sparkles, Copy, Check, RefreshCw, AlertCircle, Cpu } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const VideoPromptTool: React.FC = () => {
  const { addSavedGeneration } = useApp();
  const [videoIdea, setVideoIdea] = useState(
    'A lone astronaut walking through a glowing bioluminescent alien forest at twilight while ancient floating lanterns rise into the mist'
  );
  const [style, setStyle] = useState('Cinematic 4K Anamorphic');
  const [camera, setCamera] = useState('FPV Drone Glide & Slow Tilt');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [isLoading, setIsLoading] = useState(false);
  const [promptResult, setPromptResult] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [model, setModel] = useState<string>('gemini-3.1-flash-lite-preview');

  const styles = [
    'Cinematic 4K Anamorphic',
    'Photorealistic IMAX 70mm',
    'Cyberpunk Neon Anime',
    'Unreal Engine 5 3D Render',
    'Documentary Handheld',
    'Vintage 35mm Film Grain',
  ];

  const cameras = [
    'FPV Drone Glide & Slow Tilt',
    'Dolly Zoom Forward',
    '360 Orbit Around Subject',
    'Low-Angle Tracking Shot',
  ];

  const sampleIdeas = [
    'A futuristic high-speed maglev train racing through a snow-covered canyon at sunrise',
    'A young artisan crafting a glowing glass lantern inside a cozy rain-soaked workshop at night',
    'An eagle soaring above golden autumn mountain peaks breaking through morning clouds',
  ];

  const handleGenerate = async () => {
    const trimmedIdea = videoIdea.trim();
    if (!trimmedIdea || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    const messageContent = `Create a detailed, original AI video generation prompt based on the following video idea:
"${trimmedIdea}"

Preferred Visual Style: ${style}
Preferred Camera Motion: ${camera}
Target Aspect Ratio: ${aspectRatio}

Please structure the generated video prompt clearly with the following sections:
1. Master Copy-Ready Video Prompt (a cohesive, richly detailed paragraph ready for AI video generators)
2. Scene-by-Scene Instructions (clear breakdown of opening, middle action, and closing beats)
3. Camera Movements & Framing (lens choice, camera motion, angles, and transitions)
4. Lighting & Atmosphere (light sources, color palette, mood, and weather/atmospheric effects)
5. Characters & Subject Details (appearance, expressions, wardrobe, and movements)
6. Background & Environment (setting architecture, landscape textures, depth of field, and ambient motion)`;

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
        throw new Error('No video prompt content was returned from the Gemini API.');
      }

      if (data.model) {
        setModel(data.model);
      }

      setPromptResult(generatedPrompt);

      addSavedGeneration({
        toolId: 'ai-video-prompt',
        toolName: 'AI Video Prompt Generator',
        prompt: trimmedIdea,
        outputPreview: generatedPrompt.slice(0, 120) + '...',
        type: 'text',
      });
    } catch (err: any) {
      console.error('Video Prompt Generator error:', err);
      setErrorMessage(err?.message || 'Could not generate video prompt from Gemini API.');
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
      {/* Top Status Bar */}
      <div className="bg-purple-950/40 border border-purple-900/40 rounded-xl p-3 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-emerald-300">Gemini API Live</span>
          <span className="text-slate-400">· Director-Grade Text-to-Video Prompt Engine</span>
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
              htmlFor="video-idea-input"
              className="block text-xs font-semibold text-slate-200 mb-1.5"
            >
              Describe Your Video Idea
            </label>
            <textarea
              id="video-idea-input"
              rows={4}
              value={videoIdea}
              onChange={(e) => setVideoIdea(e.target.value)}
              disabled={isLoading}
              placeholder="Describe your video idea, characters, action, setting, and mood..."
              className="w-full bg-[#101636] border border-purple-900/50 rounded-xl p-3.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors"
            />
          </div>

          {/* Sample Video Ideas */}
          <div>
            <div className="text-[11px] font-semibold text-purple-300 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 text-purple-400" />
              <span>Try a sample video idea:</span>
            </div>
            <div className="space-y-1.5">
              {sampleIdeas.map((idea, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setVideoIdea(idea)}
                  className="w-full px-3 py-1.5 rounded-lg text-xs text-left bg-[#0f1533] hover:bg-[#16204e] text-slate-300 hover:text-white border border-purple-950/60 transition-colors truncate"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Style */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Cinematography Style</label>
            <div className="grid grid-cols-2 gap-1.5">
              {styles.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setStyle(s)}
                  className={`px-2.5 py-2 rounded-lg text-xs font-medium text-left truncate transition-colors border ${
                    style === s
                      ? 'bg-purple-900/60 border-purple-500 text-purple-100'
                      : 'bg-[#0f1533] border-purple-950/60 text-slate-400 hover:text-slate-200 hover:bg-[#151c44]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Camera Movement */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Camera Motion</label>
            <div className="grid grid-cols-2 gap-1.5">
              {cameras.map((c) => (
                <button
                  key={c}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setCamera(c)}
                  className={`px-2.5 py-2 rounded-lg text-xs font-medium text-left truncate transition-colors border ${
                    camera === c
                      ? 'bg-purple-900/60 border-purple-500 text-purple-100'
                      : 'bg-[#0f1533] border-purple-950/60 text-slate-400 hover:text-slate-200 hover:bg-[#151c44]'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Target Aspect Ratio</label>
            <div className="grid grid-cols-3 gap-2">
              {['16:9', '9:16', '21:9'].map((ar) => (
                <button
                  key={ar}
                  type="button"
                  disabled={isLoading}
                  onClick={() => setAspectRatio(ar)}
                  className={`py-2 rounded-lg text-xs font-medium text-center transition-colors border ${
                    aspectRatio === ar
                      ? 'bg-purple-900/60 border-purple-500 text-purple-100'
                      : 'bg-[#0f1533] border-purple-950/60 text-slate-400 hover:text-slate-200 hover:bg-[#151c44]'
                  }`}
                >
                  {ar}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !videoIdea.trim()}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950 transition-all min-h-[48px]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin text-purple-200" />
                <span>Generating Video Prompt...</span>
              </>
            ) : (
              <>
                <Film className="h-4 w-4" />
                <span>Generate Video Prompt</span>
              </>
            )}
          </button>
        </div>

        {/* Right Result Area */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-purple-950/60">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-200">Generated Video Prompt</span>
              {wordCount > 0 ? (
                <span className="text-slate-400 font-mono text-[11px]">· {wordCount} words</span>
              ) : (
                <span className="text-slate-400 text-[11px]">· Scene, Camera, Lighting & Background</span>
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
                  Directing scene-by-scene instructions, camera movements, lighting & background...
                </p>
                <p className="text-[11px] text-slate-500">Powered by Google Gemini API</p>
              </div>
            ) : errorMessage ? (
              <div className="p-4 rounded-xl bg-red-950/50 border border-red-800/50 text-xs text-red-200 space-y-3">
                <div className="flex items-center gap-2 font-bold text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Unable to Generate Video Prompt</span>
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
            ) : promptResult ? (
              <div className="whitespace-pre-wrap text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                {promptResult}
              </div>
            ) : (
              <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center p-6 space-y-2 text-slate-400">
                <Film className="h-8 w-8 text-purple-400/60 mb-1" />
                <div className="text-sm font-semibold text-slate-200">
                  Ready to Generate Your Video Prompt
                </div>
                <p className="text-xs max-w-sm">
                  Describe your video idea on the left and click{' '}
                  <strong className="text-white">Generate Video Prompt</strong> to create a
                  complete scene-by-scene breakdown with camera movements, lighting, characters,
                  and background details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

