import React from 'react';
import { useApp } from '../context/AppContext';
import { AI_TOOLS } from '../data/tools';
import {
  ArrowLeft,
  MessageSquare,
  Image,
  BookOpen,
  Film,
  PenTool,
  Languages,
  Mic,
  Music,
  Scissors,
  Bookmark,
  Sparkles,
  Home
} from 'lucide-react';
import { ChatDemo } from '../components/tools/ChatDemo';
import { ImageGenDemo } from '../components/tools/ImageGenDemo';
import { StoryWriterTool } from '../components/tools/StoryWriterTool';
import { VideoPromptTool } from '../components/tools/VideoPromptTool';
import { ContentWriterTool } from '../components/tools/ContentWriterTool';
import { TranslatorTool } from '../components/tools/TranslatorTool';
import { VoiceGenDemo } from '../components/tools/VoiceGenDemo';
import { MusicGenDemo } from '../components/tools/MusicGenDemo';
import { BgRemoverDemo } from '../components/tools/BgRemoverDemo';

export const ToolPage: React.FC = () => {
  const { activeTool, openToolPlayground, navigateTo, user, toggleFavorite } = useApp();

  // Default to AI Chat if no activeTool is set
  const currentTool = activeTool || AI_TOOLS[0];
  const isFavorite = user.favorites.includes(currentTool.id);

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
      case 'PenTool':
        return <PenTool className="h-5 w-5" />;
      case 'Languages':
        return <Languages className="h-5 w-5" />;
      case 'Mic':
        return <Mic className="h-5 w-5" />;
      case 'Music':
        return <Music className="h-5 w-5" />;
      case 'Scissors':
        return <Scissors className="h-5 w-5" />;
      default:
        return <Sparkles className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Navigation & Breadcrumb Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="px-3 py-2 rounded-xl bg-[#0c122e] hover:bg-[#141d46] border border-purple-900/40 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors min-h-[40px]"
            >
              <Home className="h-3.5 w-3.5 text-purple-400" />
              <span>Home</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo('all-tools')}
              className="px-3 py-2 rounded-xl bg-[#0c122e] hover:bg-[#141d46] border border-purple-900/40 text-xs font-medium text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors min-h-[40px]"
            >
              <ArrowLeft className="h-3.5 w-3.5 text-purple-400" />
              <span>All Tools Directory</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => toggleFavorite(currentTool.id)}
            className={`px-3.5 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors min-h-[40px] ${
              isFavorite
                ? 'bg-purple-950 text-purple-200 border-purple-600/60'
                : 'bg-[#0c122e] text-slate-300 hover:text-white border-purple-900/40'
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isFavorite ? 'fill-current text-purple-400' : ''}`} />
            <span>{isFavorite ? 'Saved in Bookmarks' : 'Bookmark Tool'}</span>
          </button>
        </div>

        {/* Dedicated Tool Page Header */}
        <div className="rounded-2xl bg-gradient-to-r from-[#0d1338] via-[#090d24] to-[#070918] border border-purple-900/50 p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30 shrink-0">
              {getToolIcon(currentTool.iconName)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {currentTool.name}
                </h1>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-md border ${
                    currentTool.isLiveGemini
                      ? 'text-emerald-300 bg-emerald-950/80 border-emerald-800/50'
                      : 'text-purple-300 bg-purple-950/80 border-purple-800/50'
                  }`}
                >
                  {currentTool.isLiveGemini ? 'Live Gemini API' : currentTool.apiProvider}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {currentTool.description}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Tool Switcher Navigation */}
        <div className="p-2 rounded-2xl bg-[#090d22] border border-purple-950/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-semibold text-slate-400 px-2 shrink-0">
            Tools:
          </span>
          {AI_TOOLS.map((tool) => {
            const isSelected = currentTool.id === tool.id;
            return (
              <button
                key={tool.id}
                type="button"
                onClick={() => openToolPlayground(tool)}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 min-h-[38px] ${
                  isSelected
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold shadow-md shadow-purple-950'
                    : 'bg-[#0d1330] text-slate-400 hover:text-white hover:bg-[#141d46] border border-purple-950/60'
                }`}
              >
                <span>{tool.name}</span>
                {tool.isLiveGemini && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Live Gemini API" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tool Workspace Area */}
        <div>
          {currentTool.id === 'ai-chat' && <ChatDemo />}
          {currentTool.id === 'ai-image' && <ImageGenDemo />}
          {currentTool.id === 'ai-story' && <StoryWriterTool />}
          {currentTool.id === 'ai-video-prompt' && <VideoPromptTool />}
          {currentTool.id === 'ai-content' && <ContentWriterTool />}
          {currentTool.id === 'ai-translator' && <TranslatorTool />}
          {currentTool.id === 'ai-voice' && <VoiceGenDemo />}
          {currentTool.id === 'ai-music' && <MusicGenDemo />}
          {currentTool.id === 'bg-remover' && <BgRemoverDemo />}
        </div>
      </div>
    </div>
  );
};
