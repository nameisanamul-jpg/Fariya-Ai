import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo, openToolPlayground } = useApp();

  return (
    <footer className="w-full border-t border-purple-950/40 bg-[#05060d] text-slate-400 py-12 px-4 sm:px-6 lg:px-8 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Fariya AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              One platform unifying next-generation multimodal AI: chat, story writing, video prompt directing, content writing, and multi-language translation.
            </p>
            <div className="inline-flex items-center gap-2 text-[11px] text-emerald-300/90 bg-emerald-950/40 border border-emerald-900/40 rounded-md px-2.5 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Live Free-Tier Gemini API Connected</span>
            </div>
          </div>

          {/* AI Tools Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 tracking-wider uppercase">AI Tools</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => openToolPlayground('ai-chat')} className="hover:text-purple-300 transition-colors">
                  1. AI Chat
                </button>
              </li>
              <li>
                <button onClick={() => openToolPlayground('ai-image')} className="hover:text-purple-300 transition-colors">
                  2. AI Image Generator
                </button>
              </li>
              <li>
                <button onClick={() => openToolPlayground('ai-story')} className="hover:text-purple-300 transition-colors">
                  3. AI Story Writer
                </button>
              </li>
              <li>
                <button onClick={() => openToolPlayground('ai-video-prompt')} className="hover:text-purple-300 transition-colors">
                  4. AI Video Prompt Generator
                </button>
              </li>
              <li>
                <button onClick={() => openToolPlayground('ai-content')} className="hover:text-purple-300 transition-colors">
                  5. AI Content Writer
                </button>
              </li>
              <li>
                <button onClick={() => openToolPlayground('ai-translator')} className="hover:text-purple-300 transition-colors">
                  6. AI Translator
                </button>
              </li>
            </ul>
          </div>

          {/* Platform Col */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 tracking-wider uppercase">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => navigateTo('pricing')} className="hover:text-purple-300 transition-colors">
                  Pricing Plans (Free & Pro)
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('dashboard')} className="hover:text-purple-300 transition-colors">
                  Creator Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('all-tools')} className="hover:text-purple-300 transition-colors">
                  All 7 Demo Sandboxes
                </button>
              </li>
            </ul>
          </div>

          {/* Trust & Transparency */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 tracking-wider uppercase">Security & Privacy</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gemini API keys remain strictly on the server. User passwords are salted and hashed with Node.js crypto.scrypt, and sessions are verified via HttpOnly cookies.
            </p>
            <div className="flex items-center gap-3 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-purple-400" />
                <span>HttpOnly Sessions</span>
              </span>
              <span>·</span>
              <span>Server-Only API Keys</span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} Fariya AI Platform. Crafted for mobile, tablet, and desktop.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => navigateTo('pricing')} className="hover:text-slate-300 transition-colors">
              Terms & Billing Demo
            </button>
            <span>·</span>
            <button onClick={() => navigateTo('all-tools')} className="hover:text-slate-300 transition-colors">
              Interactive Tools Directory
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
