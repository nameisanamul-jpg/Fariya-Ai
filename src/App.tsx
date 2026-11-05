/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AllToolsPage } from './pages/AllToolsPage';
import { PricingPage } from './pages/PricingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ToolPage } from './pages/ToolPage';
import { CheckoutModal } from './components/CheckoutModal';

const MainLayout: React.FC = () => {
  const { currentPage, user } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#070913] text-slate-100">
      {/* Responsive Desktop & Mobile Top Bar */}
      <Navbar />

      {/* Main Viewport */}
      <main className="flex-1 pb-16 md:pb-0">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'all-tools' && <AllToolsPage />}
        {currentPage === 'pricing' && <PricingPage />}
        {currentPage === 'login' && <AuthPage initialMode="login" />}
        {currentPage === 'signup' && <AuthPage initialMode="signup" />}
        {currentPage === 'dashboard' &&
          (user.isLoggedIn ? <DashboardPage /> : <AuthPage initialMode="login" />)}
        {currentPage === 'tool' && <ToolPage />}
      </main>

      {/* Modals */}
      <CheckoutModal />

      {/* Footer */}
      <Footer />

      {/* Mobile-first bottom thumb bar for Android & smartphones */}
      <MobileBottomNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
