import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, User, ShieldCheck } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentPage, navigateTo, user, openCheckout } = useApp();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-purple-950/40 bg-[#070913]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark (Single Text Element) */}
        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2.5 text-left text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0 transition-opacity hover:opacity-90"
          aria-label="Fariya AI Home"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-sm shadow-purple-500/20">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent font-extrabold text-lg">
            Fariya AI
          </span>
        </button>

        {/* Zone 2: 4 Clean Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <button
            onClick={() => navigateTo('home')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentPage === 'home' ? 'text-purple-400 font-semibold' : 'text-slate-300'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => navigateTo('all-tools')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentPage === 'all-tools' ? 'text-purple-400 font-semibold' : 'text-slate-300'
            }`}
          >
            All Tools
          </button>
          <button
            onClick={() => navigateTo('pricing')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentPage === 'pricing' ? 'text-purple-400 font-semibold' : 'text-slate-300'
            }`}
          >
            Pricing
          </button>
          <button
            onClick={() => navigateTo('dashboard')}
            className={`whitespace-nowrap transition-colors hover:text-white ${
              currentPage === 'dashboard' ? 'text-purple-400 font-semibold' : 'text-slate-300'
            }`}
          >
            Dashboard
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Single line control) */}
        <div className="flex items-center gap-3 shrink-0">
          {user.isLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('dashboard')}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-200 bg-purple-950/60 border border-purple-800/40 rounded-lg hover:bg-purple-900/40 transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                <span>{user.plan === 'pro' ? 'Pro Plan' : 'Free Demo'}</span>
              </button>
              <button
                onClick={() => navigateTo('dashboard')}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-500 hover:to-indigo-500 shadow-sm shadow-purple-600/25 transition-all whitespace-nowrap shrink-0 min-h-[44px]"
              >
                <User className="h-3.5 w-3.5" />
                <span>{user.name.split(' ')[0] || 'Dashboard'}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateTo('login')}
                className="hidden sm:inline-flex px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white transition-colors whitespace-nowrap min-h-[44px] items-center"
              >
                Log In
              </button>
              <button
                onClick={() => navigateTo('signup')}
                className="flex items-center px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-500 hover:to-indigo-500 shadow-sm shadow-purple-600/25 transition-all whitespace-nowrap shrink-0 min-h-[44px]"
              >
                Get Started Free
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
