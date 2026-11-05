import React, { useState } from 'react';
import { PenTool, Copy, Check, Sparkles, FileText, Download, RotateCcw } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WritingAssistantDemo: React.FC = () => {
  const { addSavedGeneration } = useApp();
  const [topic, setTopic] = useState('Announcing Fariya AI: The Next-Gen Multimodal AI Studio for Creators & Teams');
  const [format, setFormat] = useState<'blog' | 'email' | 'ad' | 'script'>('blog');
  const [tone, setTone] = useState('Professional');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const [documentContent, setDocumentContent] = useState<string>(`# Announcing Fariya AI: The Unified Creation Suite

Today marks a defining milestone in our mission to democratize state-of-the-art artificial intelligence. As multimodal capabilities rapidly accelerate, creators and product teams have found themselves juggling disjointed subscriptions for text, image synthesis, voiceovers, and motion graphics.

### The All-in-One Paradigm
Fariya AI consolidates the highest-fidelity foundation models into a unified, dark-mode native canvas:
- **Instant Generative Chat**: Deep reasoning with contextual prompt chaining.
- **Parametric Visual Studio**: Aspect-ratio native diffusion generation.
- **Neural Voice & Music**: Professional narrative speech synthesis and tempo-calibrated soundscapes.
- **Precision Studio Utilities**: One-click edge detection and background removal.

### Built For Velocity
Whether you are drafting an executive brief, creating ad concepts, or producing video voice tracks, Fariya AI ensures frictionless workflow iteration without switching context.

*Explore the platform today and accelerate your creative horizon.*`);

  const formats = [
    { id: 'blog', label: 'Blog Article' },
    { id: 'email', label: 'Executive Email' },
    { id: 'ad', label: 'Ad Copy' },
    { id: 'script', label: 'Video Script' },
  ] as const;

  const tones = ['Professional', 'Persuasive', 'Conversational', 'Technical'];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);

      let text = '';
      if (format === 'email') {
        text = `Subject: Strategic Overview: Introducing Unified AI Workflows with Fariya AI

Hi Team,

I wanted to share a brief update regarding our creative tooling pipeline. Moving forward, we are evaluating Fariya AI to centralize our generative assets across copy, imagery, and audio synthesis.

Key Advantages:
1. Unified Workspace: Eliminates multiple redundant SaaS subscriptions.
2. Production Consistency: Shared style tokens and brand-voice calibration.
3. Rapid Prototyping: 5x acceleration from concept draft to production assets.

Please review the attached project sandbox and let me know your thoughts before Friday's executive sync.

Best regards,
Creative Operations Team`;
      } else if (format === 'ad') {
        text = `🔥 Hook 1 (High Energy):
Stop switching between 6 different AI apps. Fariya AI puts Chat, Image Gen, Cinematic Video, Voice Narration, and Background Removal under ONE lightning-fast roof.

💡 Hook 2 (Value Focus):
High-end AI shouldn't require complex prompt engineering or expensive subscriptions. Create stunning visuals, voices, and copy in seconds with Fariya AI.

👉 Call to Action:
Try Fariya AI free — One Platform. Endless AI Possibilities. Click to explore the live demo today!`;
      } else if (format === 'script') {
        text = `[SCENE START]
[VISUAL: Fast-paced montage of modern creative workspaces, dual screens glowing with design software and code editors]

VOICEOVER (WARM, ENERGETIC):
"Every creator knows the struggle: five tabs open, three separate AI subscriptions, and zero workflow harmony."

[VISUAL: Screen cuts to sleek Fariya AI interface with glowing purple gradients]

VOICEOVER:
"Meet Fariya AI. One unified platform uniting conversational reasoning, studio-grade image synthesis, video motion, voiceovers, and background extraction."

[VISUAL: Quick demonstration of generating an image, speaking narration, and extracting product background]

VOICEOVER:
"One Platform. Endless AI Possibilities. Start building your next masterpiece today."
[SCENE END]`;
      } else {
        text = `# ${topic}

### Executive Summary
The creative and technological landscape is shifting toward consolidated multimodal intelligence. Rather than managing fragmented toolchains, creators and modern enterprises need cohesive pipelines that bridge ideation, visual rendering, and multimedia production.

### Core Capabilities
1. **Contextual Text Intelligence**: Adaptive tone calibration and structured drafting.
2. **Generative Imagery & Motion**: High-resolution image diffusion paired with camera motion simulation.
3. **Audio Architecture**: Lifelike speech synthesis and tempo-controlled music tracks.

### Next Steps
Deploying unified AI reduces context-switching penalties by an estimated 40%, enabling creators to focus on high-impact strategic differentiation.`;
      }

      setDocumentContent(text);

      addSavedGeneration({
        toolId: 'ai-writing',
        toolName: 'AI Writing Assistant',
        prompt: topic,
        outputPreview: text.slice(0, 120) + '...',
        type: 'text'
      });
    }, 600);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(documentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const wordCount = documentContent.trim().split(/\s+/).filter(Boolean).length;
  const charCount = documentContent.length;

  return (
    <div className="bg-[#090d20] rounded-xl border border-purple-950/50 overflow-hidden text-slate-100 p-4 sm:p-6">
      {/* Top Banner Notice */}
      <div className="bg-purple-950/40 border border-purple-900/40 rounded-lg p-3 mb-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400"></span>
          <span className="font-medium text-purple-200">Interactive Writing Studio</span>
          <span className="text-slate-400">· Gemini 2.5 Pro Writing API Ready</span>
        </div>
        <span className="text-[11px] text-purple-300 bg-purple-900/40 px-2 py-0.5 rounded border border-purple-800/40">
          Structured Document Engine
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings Column */}
        <div className="lg:col-span-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Topic or Creative Brief</span>
              <button
                onClick={() => setTopic('How Multimodal AI Is Transforming Product Design Workflows in 2026')}
                className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3" /> Sample Topic
              </button>
            </label>
            <textarea
              rows={3}
              value={topic}
              onChange={e => setTopic(e.target.value)}
              className="w-full bg-[#101636] border border-purple-900/40 rounded-lg p-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Document Format</label>
            <div className="grid grid-cols-2 gap-1.5">
              {formats.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFormat(f.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left truncate transition-colors border ${
                    format === f.id
                      ? 'bg-purple-900/60 border-purple-500 text-purple-100'
                      : 'bg-[#0f1533] border-purple-950/60 text-slate-400 hover:text-slate-200 hover:bg-[#151c44]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tone of Voice</label>
            <div className="grid grid-cols-2 gap-1.5">
              {tones.map(t => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left truncate transition-colors border ${
                    tone === t
                      ? 'bg-purple-900/60 border-purple-500 text-purple-100'
                      : 'bg-[#0f1533] border-purple-950/60 text-slate-400 hover:text-slate-200 hover:bg-[#151c44]'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full h-11 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950 transition-all min-h-[44px]"
          >
            {isGenerating ? (
              <>
                <FileText className="h-4 w-4 animate-pulse text-purple-200" />
                <span>Composing Draft...</span>
              </>
            ) : (
              <>
                <PenTool className="h-4 w-4" />
                <span>Generate Structured Draft</span>
              </>
            )}
          </button>
        </div>

        {/* Document Editor Output Column */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="flex items-center justify-between pb-2 border-b border-purple-900/30 text-xs text-slate-400">
            <div className="flex items-center gap-3">
              <span className="font-medium text-slate-200 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-purple-400" />
                <span>Editable Output</span>
              </span>
              <span>·</span>
              <span className="font-mono text-[11px]">{wordCount} words</span>
              <span>·</span>
              <span className="font-mono text-[11px]">{charCount} chars</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyToClipboard}
                className="px-2.5 py-1 rounded bg-[#101636] border border-purple-900/40 text-slate-300 hover:text-white flex items-center gap-1 text-[11px] transition-colors"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <textarea
            value={documentContent}
            onChange={e => setDocumentContent(e.target.value)}
            rows={12}
            className="mt-3 w-full flex-1 bg-[#070a1a] border border-purple-900/40 rounded-xl p-4 text-xs sm:text-sm text-slate-100 font-sans leading-relaxed resize-none focus:outline-none focus:border-purple-500"
          />

          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>Model: Gemini 2.5 Pro Content Engine</span>
            <span>Est. Reading: {Math.max(1, Math.ceil(wordCount / 200))} min</span>
            <span>Format: Markdown Native</span>
          </div>
        </div>
      </div>
    </div>
  );
};
