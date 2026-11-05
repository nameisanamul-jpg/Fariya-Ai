import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AI_TOOLS } from '../data/tools';
import {
  ShieldCheck,
  Zap,
  Bookmark,
  Clock,
  Sparkles,
  ArrowUpRight,
  LogOut,
  Image,
  FileText,
  Music,
  Copy,
  Check
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, isAuthLoading, logoutUser, navigateTo, openToolPlayground, openCheckout } = useApp();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading && !user.isLoggedIn) {
      navigateTo('login');
    }
  }, [isAuthLoading, user.isLoggedIn, navigateTo]);

  if (isAuthLoading || !user.isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#070913] text-slate-100 flex items-center justify-center">
        <div className="text-xs text-slate-400">Verifying session...</div>
      </div>
    );
  }

  const copyPromptText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const favoriteTools = AI_TOOLS.filter(t => user.favorites.includes(t.id));

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 py-10 sm:py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="rounded-3xl bg-gradient-to-r from-[#0d1338] via-[#090d24] to-[#070918] border border-purple-900/50 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-purple-600/30">
              {user.name ? user.name.charAt(0).toUpperCase() : 'F'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {user.name}
                </h1>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${
                  user.plan === 'pro'
                    ? 'bg-purple-900/80 text-purple-200 border-purple-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {user.plan === 'pro' ? 'PRO PLAN' : 'FREE TIER'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {user.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {user.plan === 'free' ? (
              <button
                onClick={() => openCheckout('pro')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-purple-950 transition-all min-h-[44px]"
              >
                <Sparkles className="h-4 w-4" />
                <span>Upgrade to Pro ($15/mo)</span>
              </button>
            ) : (
              <button
                onClick={() => openCheckout('pro')}
                className="px-3.5 py-2 rounded-xl bg-purple-950/70 border border-purple-800/50 text-purple-200 text-xs font-semibold flex items-center gap-1.5 min-h-[44px]"
              >
                <ShieldCheck className="h-4 w-4 text-purple-400" />
                <span>Pro Member Active</span>
              </button>
            )}

            <button
              onClick={logoutUser}
              className="p-2.5 rounded-xl bg-[#101636] hover:bg-red-950/40 text-slate-400 hover:text-red-300 border border-purple-900/30 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* 3 Metric Summary Cards with Tabular Numerals */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Credits Remaining */}
          <div className="p-5 rounded-2xl bg-[#090d24] border border-purple-950/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Credits Remaining</span>
              <Zap className="h-4 w-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white tabular-nums">
                {user.plan === 'pro' ? 'Unlimited' : user.creditsRemaining}
              </span>
              {user.plan !== 'pro' && (
                <span className="text-xs text-slate-400 font-mono tabular-nums">/ {user.creditsTotal} demo</span>
              )}
            </div>
            <div className="w-full bg-[#101636] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full"
                style={{
                  width: user.plan === 'pro' ? '100%' : `${(user.creditsRemaining / user.creditsTotal) * 100}%`
                }}
              />
            </div>
          </div>

          {/* Saved Outputs */}
          <div className="p-5 rounded-2xl bg-[#090d24] border border-purple-950/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Generations Logged</span>
              <Clock className="h-4 w-4 text-purple-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-white tabular-nums">
                {user.savedGenerations.length}
              </span>
              <span className="text-xs text-slate-400">in session history</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Saved across Image, Video, Writing & Speech
            </p>
          </div>

          {/* Server Security Status */}
          <div className="p-5 rounded-2xl bg-[#090d24] border border-purple-950/80 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Session Security</span>
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold text-white">
                HttpOnly Session
              </span>
            </div>
            <p className="text-[11px] text-purple-300/80">
              Server-side Gemini API · Zero browser key exposure
            </p>
          </div>
        </div>

        {/* Bookmarked Favorite Tools */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Bookmark className="h-4 w-4 text-purple-400" />
              <span>Bookmarked Quick Launch</span>
            </h2>
            <button
              onClick={() => navigateTo('all-tools')}
              className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
            >
              Browse All Tools →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {favoriteTools.map(tool => (
              <div
                key={tool.id}
                onClick={() => openToolPlayground(tool)}
                className="p-4 rounded-xl bg-[#090d24] border border-purple-950/80 hover:border-purple-700/60 transition-all cursor-pointer flex items-center justify-between group"
              >
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    {tool.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{tool.categoryLabel}</p>
                </div>
                <div className="p-2 rounded-lg bg-[#101636] text-purple-300 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Saved Activity & Generations Gallery */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-400" />
              <span>Session Generation History</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {user.savedGenerations.length} records
            </span>
          </div>

          <div className="rounded-2xl border border-purple-950/80 bg-[#090d24] overflow-hidden divide-y divide-purple-950/40">
            {user.savedGenerations.map(gen => (
              <div
                key={gen.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#0c1230]/40 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#101636] border border-purple-900/40 flex items-center justify-center shrink-0">
                    {gen.type === 'image' && <Image className="h-5 w-5 text-purple-400" />}
                    {gen.type === 'text' && <FileText className="h-5 w-5 text-purple-400" />}
                    {gen.type === 'audio' && <Music className="h-5 w-5 text-purple-400" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{gen.toolName}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{gen.createdAt}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 max-w-xl font-sans">
                      {gen.prompt}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => copyPromptText(gen.prompt, gen.id)}
                    className="p-2 rounded-lg bg-[#101636] hover:bg-[#18214d] text-slate-300 hover:text-white border border-purple-900/40 text-xs flex items-center gap-1.5 transition-colors"
                    title="Copy Prompt"
                  >
                    {copiedId === gen.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span className="text-[11px]">{copiedId === gen.id ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => openToolPlayground(gen.toolId)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600/90 hover:bg-purple-600 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Launch</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
