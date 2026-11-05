import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, ShieldCheck, CreditCard, Sparkles, AlertCircle } from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const { isCheckoutOpen, closeCheckout, checkoutTier, user, navigateTo } = useApp();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isCheckoutOpen) return null;

  const price = checkoutTier === 'free' ? '$0' : billingCycle === 'yearly' ? '$15' : '$19';
  const period = checkoutTier === 'free' ? 'forever' : billingCycle === 'yearly' ? '/month (billed annually)' : '/month';

  const handleConfirmAction = () => {
    if (checkoutTier === 'free') {
      closeCheckout();
      if (!user.isLoggedIn) {
        navigateTo('signup');
      } else {
        navigateTo('dashboard');
      }
      return;
    }

    setStatusMessage(
      'Pro plan upgrades are verified on the server via payment webhook once billing is enabled. Browser-side plan overrides are disabled for security.'
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-[#090d22] border border-purple-900/50 shadow-2xl overflow-hidden p-6 text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-purple-950/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-900/60 text-purple-300">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {checkoutTier === 'free' ? 'Free Tier Access' : 'Fariya AI Pro Subscription'}
              </h3>
              <p className="text-xs text-slate-400">Server-Verified Subscription Plan</p>
            </div>
          </div>
          <button
            onClick={() => {
              setStatusMessage(null);
              closeCheckout();
            }}
            className="p-2 rounded-lg bg-[#101636] text-slate-400 hover:text-white border border-purple-900/30 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Clear Transparency Banner */}
        <div className="mt-4 p-3 bg-purple-950/40 border border-purple-800/40 rounded-xl text-xs flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
          <div className="text-purple-200/90 leading-relaxed">
            <span className="font-semibold text-white">Security Notice:</span> Subscription plans are strictly verified on the server via <code className="text-purple-200">HttpOnly</code> session cookies and cannot be modified in browser storage.
          </div>
        </div>

        {checkoutTier === 'pro' && (
          <div className="mt-4 flex items-center justify-center gap-2 p-1 bg-[#070914] rounded-lg border border-purple-950">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-purple-900/80 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing ($19/mo)
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                billingCycle === 'yearly'
                  ? 'bg-purple-900/80 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Annual Billing ($15/mo · Save 20%)
            </button>
          </div>
        )}

        <div className="mt-5 p-4 rounded-xl bg-[#0e1435] border border-purple-900/40">
          <div className="flex items-baseline justify-between mb-3">
            <span className="text-xs text-slate-400">Total Due Today</span>
            <div>
              <span className="text-2xl font-bold font-mono text-white">{price}</span>
              <span className="text-xs text-slate-400 ml-1">{period}</span>
            </div>
          </div>

          <ul className="text-xs text-slate-300 space-y-2 pt-3 border-t border-purple-900/30">
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-purple-400" />
              <span>Access to all core AI tools</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-purple-400" />
              <span>Commercial licensing & high-resolution prompt exports</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-purple-400" />
              <span>Protected server-side Gemini API execution</span>
            </li>
          </ul>
        </div>

        {statusMessage && (
          <div className="mt-4 p-3 rounded-xl bg-amber-950/50 border border-amber-700/50 text-xs text-amber-200 leading-relaxed">
            {statusMessage}
          </div>
        )}

        <button
          onClick={handleConfirmAction}
          className="mt-6 w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-950 transition-all min-h-[48px]"
        >
          <Sparkles className="h-4 w-4" />
          <span>
            {checkoutTier === 'free'
              ? user.isLoggedIn
                ? 'Go to Dashboard'
                : 'Create Free Account'
              : `Continue (${price})`}
          </span>
        </button>

        <div className="mt-4 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
          <span>Server-Enforced Plan Tier · Paid Billing Currently Disabled</span>
        </div>
      </div>
    </div>
  );
};
