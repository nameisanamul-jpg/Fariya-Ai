import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AI_TOOLS } from '../data/tools';
import {
  Sparkles,
  Search,
  ArrowRight,
  MessageSquare,
  Image,
  BookOpen,
  Film,
  Mic,
  PenTool,
  Languages,
  Music,
  Scissors,
  Check,
  Shield,
  Layers,
  Zap,
  Play,
  ArrowUpRight
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigateTo, openToolPlayground, openCheckout, searchQuery, setSearchQuery } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const heroImage = '/src/assets/images/hero_ai_suite_abstract_1793808238736.jpg';

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare':
        return <MessageSquare className="h-5 w-5" />;
      case 'Image':
        return <Image className="h-5 w-5" />;
      case 'BookOpen':
        return <BookOpen className="h-5 w-5" />;
      case 'Film':
        return <Film className="h-5 w-5" />;
      case 'Mic':
        return <Mic className="h-5 w-5" />;
      case 'PenTool':
        return <PenTool className="h-5 w-5" />;
      case 'Languages':
        return <Languages className="h-5 w-5" />;
      case 'Music':
        return <Music className="h-5 w-5" />;
      case 'Scissors':
        return <Scissors className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  const filteredTools = AI_TOOLS.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32">
        {/* Background Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-purple-600/15 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Quiet text kicker with typographic separator */}
              <div className="inline-flex items-center gap-2 text-xs font-medium text-purple-300/90 bg-purple-950/50 border border-purple-800/40 rounded-lg px-3 py-1.5 mx-auto lg:mx-0">
                <span>Unified Multimodal Suite</span>
                <span aria-hidden="true" className="text-purple-500">·</span>
                <span>Interactive Sandboxes</span>
                <span aria-hidden="true" className="text-purple-500">·</span>
                <span>API Ready</span>
              </div>

              {/* Exact Requested Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12] text-balance">
                One Platform.{' '}
                <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-purple-200 bg-clip-text text-transparent">
                  Endless AI Possibilities.
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Fariya AI integrates generative intelligence across text, high-resolution imagery, video motion, voice narration, and background extraction into one unified, mobile-first workspace.
              </p>

              {/* Interactive Search Bar in Hero */}
              <div className="pt-2 max-w-xl mx-auto lg:mx-0">
                <div className="relative flex items-center">
                  <Search className="absolute left-3.5 h-4 w-4 text-purple-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search tools: image, voice, video, remove background..."
                    className="w-full bg-[#0d122e]/90 border border-purple-800/40 rounded-xl pl-10 pr-24 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500 shadow-xl shadow-purple-950/50 transition-colors"
                  />
                  {searchQuery ? (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                    >
                      Clear
                    </button>
                  ) : (
                    <span className="absolute right-3 text-[11px] font-mono text-purple-400/80 bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/40 hidden sm:inline">
                      7 Demo Tools
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => openToolPlayground('ai-image')}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-900/40 transition-all min-h-[44px]"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Launch Tool Playground</span>
                </button>
                <button
                  onClick={() => navigateTo('all-tools')}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#0f1538] hover:bg-[#161f4d] border border-purple-800/40 text-slate-200 hover:text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors min-h-[44px]"
                >
                  <span>Explore All 7 Tools</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-purple-400" />
                  <span>Zero Fake Claims</span>
                </div>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-purple-400" />
                  <span>Transparent Demo Mode</span>
                </div>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <div className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-purple-400" />
                  <span>BYOK API Ready</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Showcase */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl border border-purple-800/40 bg-gradient-to-b from-[#10173d] to-[#080b1e] p-2 shadow-2xl shadow-purple-950/80 group">
                <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-[#050711]">
                  <img
                    src={heroImage}
                    alt="Fariya AI Multimodal Studio"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#070914] via-transparent to-transparent opacity-80" />

                  {/* Floating interactive badge */}
                  <div className="absolute bottom-3 left-3 right-3 p-3 rounded-lg bg-[#0a0f28]/90 backdrop-blur-md border border-purple-800/40 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                        <span>Unified Multimodal Canvas</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Chat · Vision · Video · Speech · Studio
                      </div>
                    </div>
                    <button
                      onClick={() => openToolPlayground('ai-image')}
                      className="px-3 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Test Demo</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quantitative Strip - Tabular Numerals Discipline */}
      <section className="border-y border-purple-950/50 bg-[#060814] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">7</div>
            <div className="text-xs text-slate-400 mt-1">Core AI Modalities</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 font-mono tabular-nums">100%</div>
            <div className="text-xs text-slate-400 mt-1">Transparent Demo Sandbox</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono tabular-nums">&lt;200ms</div>
            <div className="text-xs text-slate-400 mt-1">Client Feedback Latency</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-300 font-mono tabular-nums">Zero</div>
            <div className="text-xs text-slate-400 mt-1">Fake Generation Claims</div>
          </div>
        </div>
      </section>

      {/* 7 AI Tools Showcase Section */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            {/* No code comment prefixes; clean title */}
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Featured AI Tool Sandboxes
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Inspect parameters, prompt pipelines, and interactive simulations across all seven supported multimodal engines.
            </p>
          </div>

          {/* Interactive Filter Tabs (Buttons with click handlers) */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0b1029] rounded-xl border border-purple-950 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Tools' },
              { id: 'media', label: 'Media & Video' },
              { id: 'audio', label: 'Voice & Music' },
              { id: 'writing', label: 'Writing & Chat' },
              { id: 'utilities', label: 'Studio Utilities' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterCategory(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors min-h-[36px] ${
                  filterCategory === tab.id
                    ? 'bg-purple-900/80 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTools.map(tool => (
            <div
              key={tool.id}
              className="group relative rounded-2xl bg-[#0a0e26] border border-purple-950/80 hover:border-purple-700/60 transition-all duration-200 p-5 flex flex-col justify-between shadow-lg hover:shadow-purple-950/40"
            >
              <div>
                {/* Header row: Icon + Category + Demo status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#12193e] border border-purple-800/40 text-purple-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {getToolIcon(tool.iconName)}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{tool.categoryLabel}</span>
                    <span aria-hidden="true">·</span>
                    <span className={`font-medium px-2 py-0.5 rounded border ${
                      tool.isLiveGemini
                        ? 'text-emerald-300 bg-emerald-950/80 border-emerald-800/40'
                        : 'text-purple-300 bg-purple-950/80 border border-purple-800/40'
                    }`}>
                      {tool.isLiveGemini ? 'Live Gemini AI' : 'Free Tier Studio'}
                    </span>
                  </div>
                </div>

                {/* Primary Card Title */}
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight group-hover:text-purple-200 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-xs text-purple-300/80 font-medium mt-0.5">
                  {tool.tagline}
                </p>
                <p className="text-xs text-slate-400 leading-relaxed mt-2.5">
                  {tool.description}
                </p>

                {/* Unboxed features list with typographic separator */}
                <div className="mt-4 pt-3 border-t border-purple-950/60 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
                  {tool.features.map((feat, i) => (
                    <React.Fragment key={i}>
                      <span>{feat}</span>
                      {i < tool.features.length - 1 && <span aria-hidden="true" className="text-purple-800">·</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="mt-6 pt-3 border-t border-purple-950/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">
                  {tool.apiProvider.split('/')[0]}
                </span>
                <button
                  onClick={() => openToolPlayground(tool)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors min-h-[38px] ${
                    tool.isLiveGemini
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-sm shadow-purple-950'
                      : 'bg-purple-900/40 hover:bg-purple-800/60 text-purple-200 hover:text-white border border-purple-800/50'
                  }`}
                >
                  <span>Open Tool Page</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mechanism-to-Outcome Workflow Strip */}
      <section className="py-16 bg-[#060814] border-y border-purple-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              From Idea to Finished Media in Seconds
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              How creators streamline production across all modalities inside Fariya AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-[#0a0e26] border border-purple-950/80 space-y-3">
              <div className="text-xs font-semibold text-purple-400 tracking-wider">01. Strategy & Scripting</div>
              <h3 className="text-base font-bold text-white">Draft & Brainstorm</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Use AI Chat and Writing Assistant to generate narrative outlines, marketing copy, and script dialogue in your target brand tone.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0a0e26] border border-purple-950/80 space-y-3">
              <div className="text-xs font-semibold text-purple-400 tracking-wider">02. Media Generation</div>
              <h3 className="text-base font-bold text-white">Synthesize Visuals & Audio</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Render ultra-high-resolution imagery, direct camera vectors for motion clips, and speak voiceovers with lifelike human intonation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#0a0e26] border border-purple-950/80 space-y-3">
              <div className="text-xs font-semibold text-purple-400 tracking-wider">03. Studio Refinement</div>
              <h3 className="text-base font-bold text-white">Extract & Export</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Isolate foreground products with Background Remover, compose custom royalty-free music loops, and export broadcast assets.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Attributable Proof & Testimonials */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Built for Modern Creators & Fast Teams
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Real workflows benchmarked across design, content production, and marketing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-[#090d24] border border-purple-950/80 flex flex-col justify-between space-y-4">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
              "Switching between three tabs for text, Midjourney, and ElevenLabs killed our creative momentum. Having all 7 modalities in one dark UI cuts our weekly concept turnaround by half."
            </p>
            <div className="pt-3 border-t border-purple-950/60 text-xs">
              <div className="font-semibold text-white">Soren Vance</div>
              <div className="text-slate-400 text-[11px]">Creative Director · Horizon Media Labs</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#090d24] border border-purple-950/80 flex flex-col justify-between space-y-4">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
              "The Background Remover and parametric Image Generator work flawlessly on mobile. I can review assets on an Android phone right before client presentations."
            </p>
            <div className="pt-3 border-t border-purple-950/60 text-xs">
              <div className="font-semibold text-white">Amara Chen</div>
              <div className="text-slate-400 text-[11px]">E-Commerce Brand Strategist · Studio Veloce</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#090d24] border border-purple-950/80 flex flex-col justify-between space-y-4">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
              "Fariya AI's honesty regarding demo mode and BYOK developer integration is refreshing. The Web Audio synthesizer and camera motion sliders are remarkably intuitive."
            </p>
            <div className="pt-3 border-t border-purple-950/60 text-xs">
              <div className="font-semibold text-white">Julian Ramos</div>
              <div className="text-slate-400 text-[11px]">Frontend Architect · NextWave Systems</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-r from-purple-950/90 via-[#101438] to-[#070918] border border-purple-800/40 p-8 sm:p-12 overflow-hidden text-center space-y-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to explore Fariya AI?
          </h2>
          <p className="text-xs sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Test all seven AI tool sandboxes with zero setup, or upgrade to Pro to unlock unlimited local generations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => openCheckout('free')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-semibold text-xs sm:text-sm transition-colors min-h-[44px]"
            >
              Start Free Demo
            </button>
            <button
              onClick={() => openCheckout('pro')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-purple-950 min-h-[44px]"
            >
              Get Fariya AI Pro ($15/mo)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
