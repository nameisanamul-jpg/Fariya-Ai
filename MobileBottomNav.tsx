import React from 'react';
import { useApp } from '../context/AppContext';
import { Home, Grid, CreditCard, LayoutDashboard, User } from 'lucide-react';
import { PageView } from '../types';

export const MobileBottomNav: React.FC = () => {
  const { currentPage, navigateTo, user } = useApp();

  const navItems: { id: PageView; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'all-tools', label: 'Tools', icon: Grid },
    { id: 'pricing', label: 'Pricing', icon: CreditCard },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: user.isLoggedIn ? 'dashboard' : 'login', label: user.isLoggedIn ? 'Account' : 'Sign In', icon: User }
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070913]/95 backdrop-blur-lg border-t border-purple-950/60 pb-safe shadow-2xl shadow-purple-950/80"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || (item.id === 'login' && currentPage === 'signup');

          return (
            <button
              key={`${item.id}-${idx}`}
              onClick={() => navigateTo(item.id)}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 transition-all ${
                isActive ? 'text-purple-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-md transition-colors ${isActive ? 'bg-purple-950/60' : ''}`}>
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
              </div>
              <span className="text-[10px] tracking-tight mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
