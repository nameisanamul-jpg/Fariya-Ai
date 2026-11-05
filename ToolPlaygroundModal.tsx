import React from 'react';
import { useApp } from '../../context/AppContext';
import { AI_TOOLS } from '../../data/tools';
import {
  X,
  MessageSquare,
  Image,
  Film,
  Mic,
  PenTool,
  Music,
  Scissors,
  ExternalLink,
  Bookmark,
  Share2
} from 'lucide-react';
import { ChatDemo } from './ChatDemo';
import { ImageGenDemo } from './ImageGenDemo';
import { VideoGenDemo } from './VideoGenDemo';
import { VoiceGenDemo } from './VoiceGenDemo';
import { WritingAssistantDemo } from './WritingAssistantDemo';
import { MusicGenDemo } from './MusicGenDemo';
import { BgRemoverDemo } from './BgRemoverDemo';

export const ToolPlaygroundModal: React.FC = () => {
  const { activeTool, closeToolPlayground, openToolPlayground, user, toggleFavorite } = useApp();

  if (!activeTool) return null;

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'MessageSquare':
        return <MessageSquare className="h-5 w-5" />;
      case 'Image':
        return <Image className="h-5 w-5" />;
      case 'Film':
        return <Film className="h-5 w-5" />;
      case 'Mic':
        return <Mic className="h-5 w-5" />;
      case 'PenTool':
        return <PenTool className="h-5 w-5" />;
      case 'Music':
        return <Music className="h-5 w-5" />;
      case 'Scissors':
        return <Scissors className="h-5 w-5" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  const isFavorite = user.favorites.includes(activeTool.id);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-5xl rounded-2xl bg-[#070914] border border-purple-900/50 shadow-2xl my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-purple-950/60 bg-[#090d22]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/20">
              {getToolIcon(activeTool.iconName)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {activeTool.name}
                </h3>
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                  activeTool.id === 'ai-chat'
                    ? 'text-emerald-300 bg-emerald-950/80 border-emerald-800/40'
                    : 'text-purple-300 bg-purple-950 border border-purple-800/40'
                }`}>
                  {activeTool.id === 'ai-chat' ? 'Live Gemini AI' : 'Demo Sandbox'}
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {activeTool.tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavorite(activeTool.id)}
              className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-colors ${
                isFavorite
                  ? 'bg-purple-950 text-purple-300 border-purple-700/60'
                  : 'bg-[#101636] text-slate-400 hover:text-white border-purple-900/30'
              }`}
              title={isFavorite ? 'Bookmarked' : 'Bookmark Tool'}
            >
              <Bookmark className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">{isFavorite ? 'Bookmarked' : 'Bookmark'}</span>
            </button>

            <button
              onClick={closeToolPlayground}
              className="p-2 rounded-lg bg-[#101636] hover:bg-[#18214d] text-slate-300 hover:text-white border border-purple-900/30 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Close Modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Quick Tool Switcher Strip */}
        <div className="px-4 sm:px-6 py-2 border-b border-purple-950/40 bg-[#060814] flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[11px] text-slate-400 shrink-0 font-medium">Switch Tool:</span>
          {AI_TOOLS.map(t => (
            <button
              key={t.id}
              onClick={() => openToolPlayground(t)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors flex items-center gap-1.5 border shrink-0 ${
                activeTool.id === t.id
                  ? 'bg-purple-900/70 border-purple-500 text-white font-medium'
                  : 'bg-[#0c122c] border-purple-950/60 text-slate-400 hover:text-slate-200 hover:bg-[#12193b]'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto">
          {activeTool.id === 'ai-chat' && <ChatDemo />}
          {activeTool.id === 'ai-image' && <ImageGenDemo />}
          {activeTool.id === 'ai-video' && <VideoGenDemo />}
          {activeTool.id === 'ai-voice' && <VoiceGenDemo />}
          {activeTool.id === 'ai-writing' && <WritingAssistantDemo />}
          {activeTool.id === 'ai-music' && <MusicGenDemo />}
          {activeTool.id === 'bg-remover' && <BgRemoverDemo />}
        </div>
      </div>
    </div>
  );
};
