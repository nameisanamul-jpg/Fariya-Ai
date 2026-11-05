import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Shield, Mail, Lock, User, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface AuthPageProps {
  initialMode?: 'login' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const { navigateTo, loginUser, signupUser } = useApp();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim() || name.trim().length < 2) {
        setError('Please enter your full name (at least 2 characters).');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
    } else if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result =
        mode === 'signup'
          ? await signupUser(name.trim(), trimmedEmail, password)
          : await loginUser(trimmedEmail, password);

      if (!result.ok) {
        setError(result.error || 'Authentication failed. Please check your credentials.');
        return;
      }

      navigateTo('dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Lockup */}
        <div className="text-center space-y-2">
          <button
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-2.5 text-left transition-opacity hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-600/30">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">Fariya AI</span>
          </button>
          <p className="text-xs text-slate-400">
            {mode === 'login'
              ? 'Sign in to access your saved generations & protected dashboard'
              : 'Create your account to unlock interactive multimodal workflows'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-[#090d24] border border-purple-950/80 shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Mode Tabs */}
          <div className="flex items-center p-1 bg-[#050714] rounded-xl border border-purple-950">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'login'
                  ? 'bg-purple-900/80 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                mode === 'signup'
                  ? 'bg-purple-900/80 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/60 text-xs text-red-200 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Alex Rivera"
                    required
                    minLength={2}
                    maxLength={80}
                    className="w-full bg-[#101636] border border-purple-900/40 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="creator@fariya.ai"
                  required
                  autoComplete="email"
                  className="w-full bg-[#101636] border border-purple-900/40 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                {mode === 'signup' && (
                  <span className="text-[11px] text-slate-400">Min. 8 characters</span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={mode === 'signup' ? 8 : 1}
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  className="w-full bg-[#101636] border border-purple-900/40 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950 transition-all min-h-[44px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{mode === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Fariya AI' : 'Complete Account Setup'}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Server-Side Security Notice */}
          <div className="pt-3 border-t border-purple-950/60 text-center text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-purple-300">
              <Shield className="h-3.5 w-3.5" />
              <span>Server-Verified Authentication</span>
            </div>
            <p>
              Passwords are salted and hashed with Node.js <code className="text-purple-200">crypto.scrypt</code>. Sessions are protected via signed <code className="text-purple-200">HttpOnly</code> cookies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
