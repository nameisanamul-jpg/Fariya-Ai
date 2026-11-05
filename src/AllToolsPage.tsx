import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { AI_TOOLS, TOOL_CATEGORIES } from '../data/tools';
import {
  Search,
  MessageSquare,
  Image,
  BookOpen,
  Film,
  Mic,
  PenTool,
  Languages,
  Music,
  Scissors,
  ArrowUpRight,
  Bookmark,
  LayoutGrid,
  List,
  Sparkles,
  Zap,
  SlidersHorizontal
} from 'lucide-react';
import { ToolCategory } from '../types';

export const AllToolsPage: React.FC = () => {
  const { openToolPlayground, user, toggleFavorite, searchQuery, setSearchQuery } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<ToolCategory>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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

  const filteredTools = AI_TOOLS.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.apiProvider.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Title & Intro */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-purple-300 bg-purple-950/60 border border-purple-800/40 rounded-lg px-3 py-1">
            <span>Multimodal Directory</span>
            <span aria-hidden="true">·</span>
            <span>7 Core Sandboxes</span>
            <span aria-hidden="true">·</span>
            <span>Interactive Demos</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            All AI Creation Tools
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Browse our full suite of multimodal AI tools. Each tool includes an interactive client-side sandbox to preview prompt pipelines and parameter tuning before connecting backend API credentials.
          </p>
        </div>

        {/* Toolbar & Filter Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0a0e26] border border-purple-950/80">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword (e.g. video, voice, background)..."
              className="w-full bg-[#101636] border border-purple-900/40 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-purple-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Categories Segmented Control */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {TOOL_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors min-h-[40px] ${
                  selectedCategory === cat.id
                    ? 'bg-purple-900/80 text-white font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-[#12193b]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-[#101636] rounded-lg border border-purple-900/40 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-purple-900 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-purple-900 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Tools Display */}
        {filteredTools.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-2xl bg-[#0a0e26] border border-purple-950/80 space-y-3">
            <Search className="h-10 w-10 text-purple-400 mx-auto" />
            <h3 className="text-base font-semibold text-white">No AI tools found matching "{searchQuery}"</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try searching for "chat", "voice", "image", or click "All Tools" to view all 7 available engines.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white transition-colors"
            >
              Reset Search & Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map(tool => {
              const isFav = user.favorites.includes(tool.id);
              return (
                <div
                  key={tool.id}
                  className="rounded-2xl bg-[#090d24] border border-purple-950/80 hover:border-purple-700/60 transition-all p-6 flex flex-col justify-between group shadow-xl hover:shadow-purple-950/50"
                >
                  <div>
                    {/* Top row */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-[#12193e] border border-purple-800/40 text-purple-300 flex items-center justify-center group-hover:scale-105 transition-transform">
                        {getToolIcon(tool.iconName)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                          tool.isLiveGemini
                            ? 'text-emerald-300 bg-emerald-950/90 border-emerald-800/50'
                            : 'text-purple-300 bg-purple-950/90 border border-purple-800/50'
                        }`}>
                          {tool.isLiveGemini ? 'Live Gemini AI' : 'Free Tier Studio'}
                        </span>
                        <button
                          onClick={() => toggleFavorite(tool.id)}
                          className={`p-1.5 rounded-md transition-colors ${
                            isFav ? 'text-purple-400' : 'text-slate-500 hover:text-slate-300'
                          }`}
                          title="Bookmark tool"
                        >
                          <Bookmark className={`h-4 w-4 ${isFav ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-white tracking-tight group-hover:text-purple-200 transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-purple-300 font-medium mt-0.5">
                      {tool.tagline}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed mt-2.5">
                      {tool.description}
                    </p>

                    {/* Unboxed features */}
                    <div className="mt-4 pt-3 border-t border-purple-950/60 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400">
                      {tool.features.map((f, idx) => (
                        <React.Fragment key={idx}>
                          <span>{f}</span>
                          {idx < tool.features.length - 1 && <span className="text-purple-900">·</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-purple-950/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {tool.apiProvider}
                    </span>
                    <button
                      onClick={() => openToolPlayground(tool)}
                      className={`px-4 py-2 rounded-lg text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-purple-950 transition-all min-h-[40px] ${
                        tool.isLiveGemini
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500'
                          : 'bg-purple-900/50 hover:bg-purple-800/70 border border-purple-700/40'
                      }`}
                    >
                      <span>Open Tool Page</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredTools.map(tool => (
              <div
                key={tool.id}
                className="rounded-xl bg-[#090d24] border border-purple-950/80 hover:border-purple-700/60 transition-all p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#12193e] border border-purple-800/40 text-purple-300 flex items-center justify-center shrink-0">
                    {getToolIcon(tool.iconName)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white group-hover:text-purple-200 transition-colors">
                        {tool.name}
                      </h3>
                      <span className={`text-[10px] border px-1.5 py-0.5 rounded ${
                        tool.isLiveGemini
                          ? 'text-emerald-300 bg-emerald-950/80 border-emerald-800/40'
                          : 'text-purple-300 bg-purple-950 border-purple-800/40'
                      }`}>
                        {tool.isLiveGemini ? 'Live Gemini' : 'Free Tier'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl">
                      {tool.description}
                    </p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                      <span className="text-purple-300 font-mono">{tool.apiProvider}</span>
                      <span>·</span>
                      <span>{tool.categoryLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => openToolPlayground(tool)}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors min-h-[40px]"
                  >
                    <span>Open Tool Page</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
