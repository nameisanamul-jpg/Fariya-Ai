import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check, Sparkles, ShieldCheck, HelpCircle, ArrowRight, X } from 'lucide-react';

export const PricingPage: React.FC = () => {
  const { openCheckout, user } = useApp();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const plans = [
    {
      id: 'free',
      name: 'Free Demo Tier',
      tagline: 'Ideal for inspecting sandboxes and UI workflows',
      priceMonthly: '$0',
      priceYearly: '$0',
      period: 'forever',
      badge: 'Current Default',
      features: [
        'Interactive access to all 7 core AI tools',
        '50 demo generation credits per session',
        'Standard resolution visual downloads (JPEG/PNG)',
        'Client-side Web Speech and Web Audio demo engine',
        'Local browser session history saving',
        'Bring Your Own Key (BYOK) client connectivity'
      ],
      notIncluded: [
        'Priority concurrency queue',
        'High-resolution 4K video exports',
        'Team collaboration workspaces'
      ],
      ctaText: user.plan === 'free' ? 'Current Active Tier' : 'Downgrade to Free',
      ctaTier: 'free' as const,
      isCurrent: user.plan === 'free',
      isPopular: false
    },
    {
      id: 'pro',
      name: 'Fariya AI Pro',
      tagline: 'For creators, agencies, and full-stack builders',
      priceMonthly: '$19',
      priceYearly: '$15',
      period: billingCycle === 'yearly' ? 'per month, billed annually' : 'per month',
      badge: 'Most Popular',
      features: [
        'Unlimited interactive demo generations',
        'Full access to all 7 tools with zero rate limits',
        'High-resolution 4K visual and motion renders',
        'Advanced parameter tuning (aspect ratios, seed, tone)',
        'Full commercial license for all generated media',
        'Bring Your Own Key (BYOK) high-speed direct routing',
        'Export all project history as ZIP / Markdown',
        'Priority feature requests & sandbox updates'
      ],
      notIncluded: [],
      ctaText: user.plan === 'pro' ? 'Current Active Tier' : 'Upgrade to Pro Demo',
      ctaTier: 'pro' as const,
      isCurrent: user.plan === 'pro',
      isPopular: true
    }
  ];

  const comparisonFeatures = [
    { name: 'Core AI Tools (Chat, Image, Video, Voice, Writing, Music, BG Remover)', free: 'All 7 Tools', pro: 'All 7 Tools' },
    { name: 'Monthly Generations', free: '50 Credits', pro: 'Unlimited' },
    { name: 'Visual Resolution', free: '1080p Standard', pro: '4K Ultra HD' },
    { name: 'Video Motion Simulation', free: '3s HD Clips', pro: 'Up to 6s 4K Clips' },
    { name: 'Voice Synthesis Engine', free: 'Browser Native', pro: 'Neural HD Voices' },
    { name: 'Bring Your Own Key (BYOK)', free: 'Supported', pro: 'Supported' },
    { name: 'Commercial Rights', free: 'Personal/Demo Only', pro: 'Full Commercial License' },
    { name: 'History & Bookmarks', free: 'Local Browser Cache', pro: 'Persistent Cloud/Local' },
  ];

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-purple-300 bg-purple-950/60 border border-purple-800/40 rounded-lg px-3 py-1">
            <span>Transparent Pricing Structure</span>
            <span aria-hidden="true">·</span>
            <span>Monthly & Yearly Options</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Flexible Plans for Every Creator
          </h1>
          <p className="text-xs sm:text-base text-slate-300 leading-relaxed">
            Start free with full sandbox access or upgrade to Pro. Transparent demo billing allows testing all subscription flows without charges.
          </p>

          {/* Monthly / Yearly Toggle (Button-based segmented control) */}
          <div className="pt-4 flex items-center justify-center">
            <div className="p-1 bg-[#0c122c] border border-purple-900/50 rounded-xl inline-flex items-center gap-1 shadow-inner">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors min-h-[40px] ${
                  billingCycle === 'monthly'
                    ? 'bg-purple-900 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 min-h-[40px] ${
                  billingCycle === 'yearly'
                    ? 'bg-purple-900 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Annual Billing</span>
                <span className="text-[10px] text-purple-200 bg-purple-700/80 px-1.5 py-0.5 rounded font-mono font-bold">
                  SAVE 20%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {plans.map(plan => {
            const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all ${
                  plan.isPopular
                    ? 'bg-gradient-to-b from-[#121945] to-[#0a0e28] border-2 border-purple-600/80 shadow-2xl shadow-purple-950/80 scale-[1.02]'
                    : 'bg-[#090d24] border border-purple-950/80 shadow-xl'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-white uppercase tracking-wider">
                      {plan.name}
                    </span>
                    {plan.badge && (
                      <span className="text-[11px] font-semibold text-purple-200 bg-purple-900/60 border border-purple-700/50 px-2.5 py-0.5 rounded-md">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 min-h-[32px]">
                    {plan.tagline}
                  </p>

                  <div className="mt-6 mb-6 pb-6 border-b border-purple-950/60">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono tabular-nums">
                        {price}
                      </span>
                      <span className="text-xs text-slate-400">
                        {plan.period}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-xs font-semibold text-slate-200">Included capabilities:</div>
                    <ul className="space-y-2.5 text-xs text-slate-300">
                      {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <Check className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                      {plan.notIncluded.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-slate-500">
                          <X className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8 mt-6 border-t border-purple-950/60">
                  <button
                    onClick={() => openCheckout(plan.ctaTier)}
                    disabled={plan.isCurrent}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all min-h-[44px] ${
                      plan.isCurrent
                        ? 'bg-purple-950/60 text-purple-300 border border-purple-800/40 cursor-default'
                        : plan.isPopular
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-950'
                        : 'bg-[#101636] hover:bg-[#161f4d] text-white border border-purple-900/40'
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    {!plan.isCurrent && <ArrowRight className="h-4 w-4" />}
                  </button>
                  <p className="text-center text-[10px] text-slate-500 mt-2">
                    {plan.id === 'pro' ? 'Demo checkout · No real payment charged' : 'Free forever in sandbox'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="max-w-4xl mx-auto pt-6 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
            Detailed Plan Comparison
          </h2>

          <div className="rounded-2xl border border-purple-950/80 bg-[#090d24] overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0e1438] text-white font-semibold border-b border-purple-950/80">
                  <tr>
                    <th className="p-4 sm:px-6">Feature</th>
                    <th className="p-4 sm:px-6 w-36 text-center">Free Demo</th>
                    <th className="p-4 sm:px-6 w-36 text-center text-purple-300">Pro Plan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-950/40">
                  {comparisonFeatures.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#0c1230]/50 transition-colors">
                      <td className="p-4 sm:px-6 font-medium text-white">{row.name}</td>
                      <td className="p-4 sm:px-6 text-center font-mono text-slate-400">{row.free}</td>
                      <td className="p-4 sm:px-6 text-center font-mono text-purple-300 font-semibold">{row.pro}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto pt-6 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-[#090d24] border border-purple-950/80 space-y-1.5">
              <h3 className="text-sm font-bold text-white">How does demo mode work?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fariya AI currently operates in high-fidelity interactive demo mode. All tools simulate real workflows, allowing you to test UI sliders, prompt templates, and output formats before connecting real backend API keys.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-[#090d24] border border-purple-950/80 space-y-1.5">
              <h3 className="text-sm font-bold text-white">Will my credit card be billed when clicking upgrade?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                No. In accordance with platform guidelines, the checkout modal is fully transparent: clicking upgrade updates your local session tier to Pro for testing with zero payment processing or fake billing stubs.
              </p>
            </div>
            <div className="p-5 rounded-xl bg-[#090d24] border border-purple-950/80 space-y-1.5">
              <h3 className="text-sm font-bold text-white">Can I connect my own Gemini or ElevenLabs API key?</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Yes! Through our Bring Your Own Key (BYOK) manager in the Dashboard or Footer, you can save your personal API key directly into your browser's local storage for live model inference.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
