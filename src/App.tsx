import React, { useState, useEffect } from 'react';
import { User, MinerPackage, UserMiner, SystemSettings } from './types';
import { StorageService } from './services/storage';
import { GalaxyBackground } from './components/GalaxyBackground';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './pages/HomePage';
import { MinersPage } from './pages/MinersPage';
import { DepositCheckoutPage } from './pages/DepositCheckoutPage';
import { WithdrawalPage } from './pages/WithdrawalPage';
import { TeamPage } from './pages/TeamPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { AdminPage } from './pages/AdminPage';
import { SuperAdminPage } from './pages/SuperAdminPage';
import { Headphones, PhoneCall, Send, MessageCircle, X } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageService.getCurrentUser());
  const [settings, setSettings] = useState<SystemSettings>(() => StorageService.getSettings());
  const [packages, setPackages] = useState<MinerPackage[]>(() => StorageService.getPackages());
  const [userMiners, setUserMiners] = useState<UserMiner[]>(() => StorageService.getUserMiners());

  // URL / Path synchronization
  const getTabFromPath = (): string => {
    if (typeof window === 'undefined') return 'home';
    const path = window.location.pathname;
    if (path === '/admin') return 'admin';
    if (path === '/super-admin') return 'super-admin';
    if (path === '/login') return 'login';
    if (path === '/miners') return 'miners';
    if (path === '/deposit' || path === '/checkout') return 'deposit';
    if (path === '/withdrawal') return 'withdrawal';
    if (path === '/team') return 'team';
    if (path === '/profile') return 'profile';
    return 'home';
  };

  const [activeTab, setActiveTabState] = useState<string>(getTabFromPath);
  const [supportDrawerOpen, setSupportDrawerOpen] = useState(false);

  const navigateTo = (tab: string) => {
    setActiveTabState(tab);
    let path = '/';
    if (tab === 'admin') path = '/admin';
    else if (tab === 'super-admin') path = '/super-admin';
    else if (tab === 'login') path = '/login';
    else if (tab === 'miners') path = '/miners';
    else if (tab === 'deposit') path = '/checkout';
    else if (tab === 'withdrawal') path = '/withdrawal';
    else if (tab === 'team') path = '/team';
    else if (tab === 'profile') path = '/profile';

    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sync back button
  useEffect(() => {
    const handlePopState = () => {
      setActiveTabState(getTabFromPath());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Periodic Yield calculation & 24h warmup roll up
  useEffect(() => {
    StorageService.processAllMinersYield();
    setUserMiners(StorageService.getUserMiners());
    if (currentUser) {
      const refreshedUser = StorageService.getUserById(currentUser.id);
      if (refreshedUser) setCurrentUser(refreshedUser);
    }

    const interval = setInterval(() => {
      StorageService.processAllMinersYield();
      setUserMiners(StorageService.getUserMiners());
      if (currentUser) {
        const refreshedUser = StorageService.getUserById(currentUser.id);
        if (refreshedUser) setCurrentUser(refreshedUser);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [currentUser?.id]);

  // Auth protection check for /admin and /super-admin
  useEffect(() => {
    if ((activeTab === 'admin' || activeTab === 'super-admin') && !currentUser) {
      navigateTo('login');
    }
  }, [activeTab, currentUser]);

  const handleRefreshData = () => {
    setPackages(StorageService.getPackages());
    setUserMiners(StorageService.getUserMiners());
    if (currentUser) {
      const u = StorageService.getUserById(currentUser.id);
      if (u) setCurrentUser(u);
    }
  };

  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    navigateTo('login');
  };

  // If not logged in, enforce login and account creation at first before seeing anything inner
  if (!currentUser) {
    const authTab = activeTab === 'register' ? 'register' : 'login';

    return (
      <div className="relative min-h-screen text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
        <GalaxyBackground />
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
          <LoginPage
            initialTab={authTab}
            settings={settings}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              navigateTo('home');
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Animated Moving Stars & Galaxy Canvas Background */}
      <GalaxyBackground />

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navigation Bar */}
        <Navbar
          currentUser={currentUser}
          settings={settings}
          activeTab={activeTab}
          setActiveTab={navigateTo}
          onLogout={handleLogout}
          onOpenDeposit={() => navigateTo('deposit')}
          onOpenWithdraw={() => navigateTo('withdrawal')}
        />

        {/* View Routing */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {activeTab === 'home' && (
            <HomePage
              currentUser={currentUser}
              settings={settings}
              packages={packages}
              userMiners={userMiners}
              onOpenDeposit={() => navigateTo('deposit')}
              onOpenWithdraw={() => navigateTo('withdrawal')}
              onGoToMiners={() => navigateTo('miners')}
              onGoToTeam={() => navigateTo('team')}
              onGoToProfile={() => navigateTo('profile')}
              onRequireLogin={() => navigateTo('login')}
              onGoToAdmin={() => navigateTo('admin')}
              onGoToSuperAdmin={() => navigateTo('super-admin')}
            />
          )}

          {activeTab === 'miners' && (
            <MinersPage
              currentUser={currentUser}
              packages={packages}
              userMiners={userMiners}
              onMinerRented={handleRefreshData}
              onOpenDeposit={() => navigateTo('deposit')}
              onRequireLogin={() => navigateTo('login')}
            />
          )}

          {activeTab === 'deposit' && (
            <DepositCheckoutPage
              currentUser={currentUser}
              settings={settings}
              onDepositComplete={handleRefreshData}
              onRequireLogin={() => navigateTo('login')}
            />
          )}

          {activeTab === 'withdrawal' && (
            <WithdrawalPage
              currentUser={currentUser}
              settings={settings}
              onWithdrawalRequested={handleRefreshData}
              onOpenDeposit={() => navigateTo('deposit')}
              onRequireLogin={() => navigateTo('login')}
            />
          )}

          {activeTab === 'team' && (
            <TeamPage
              currentUser={currentUser}
              settings={settings}
              onRequireLogin={() => navigateTo('login')}
            />
          )}

          {activeTab === 'profile' && (
            <ProfilePage
              currentUser={currentUser}
              settings={settings}
              onUserUpdated={(updated) => {
                setCurrentUser(updated);
                handleRefreshData();
              }}
              onRequireLogin={() => navigateTo('login')}
              onNavigateToTab={navigateTo}
            />
          )}

          {activeTab === 'login' && (
            <LoginPage
              settings={settings}
              onLoginSuccess={(user) => {
                setCurrentUser(user);
                navigateTo('home');
              }}
              onGoToHome={() => navigateTo('home')}
            />
          )}

          {activeTab === 'admin' && (
            <AdminPage
              currentUser={currentUser}
              settings={settings}
              packages={packages}
              onDataChanged={handleRefreshData}
              onRequireLogin={() => navigateTo('login')}
            />
          )}

          {activeTab === 'super-admin' && (
            <SuperAdminPage
              currentUser={currentUser}
              settings={settings}
              packages={packages}
              onSettingsUpdated={(newSettings) => setSettings(newSettings)}
              onDataChanged={handleRefreshData}
              onRequireLogin={() => navigateTo('login')}
            />
          )}
        </main>

        {/* Global Footer */}
        <footer className="relative z-10 border-t border-white/5 bg-[#030614]/90 py-8 px-4 text-center text-xs text-slate-500 mb-16 md:mb-0">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-left space-y-1">
              <span className="font-extrabold text-white font-mono text-sm">
                Roots Miners <span className="text-amber-400">Pro</span>
              </span>
              <p className="text-[11px] text-slate-400">
                Official Bitcoin Cloud Mining • Kampala, Uganda • 24h Automated Roll-Up
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400 text-xs">
              <a href={`tel:${settings.supportPhone.replace(/\s/g, '')}`} className="hover:text-amber-400 transition-colors">
                Support: {settings.supportPhone}
              </a>
              <span>•</span>
              <a href={settings.telegramGroupLink} target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">
                Telegram Group
              </a>
              <span>•</span>
              <a href={settings.whatsappGroupLink} target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors">
                WhatsApp Group
              </a>
            </div>

            <p className="text-[11px] text-slate-500 font-mono">
              Powered by PesaJet - Secure Mobile Money
            </p>
          </div>
        </footer>

        {/* Floating Quick Support Button */}
        <div className="fixed bottom-20 md:bottom-6 right-5 z-40">
          <button
            onClick={() => setSupportDrawerOpen(!supportDrawerOpen)}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-2xl shadow-amber-500/30 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-amber-300"
            title="Customer Support Hub"
          >
            {supportDrawerOpen ? <X className="w-5 h-5 text-black" /> : <Headphones className="w-5 h-5 text-black" />}
          </button>

          {/* Expanded Quick Support Menu */}
          {supportDrawerOpen && (
            <div className="absolute bottom-16 right-0 w-64 rounded-2xl border border-white/10 bg-[#08122c]/95 backdrop-blur-xl p-3 shadow-2xl space-y-2 text-xs">
              <div className="font-bold text-white px-2 py-1 border-b border-white/10 font-mono text-[11px]">
                ROOTS HELP CENTER
              </div>

              <a
                href={`tel:${settings.supportPhone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 text-slate-200 transition-colors"
              >
                <PhoneCall className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="font-bold">Call Center</div>
                  <div className="text-[10px] text-slate-400">{settings.supportPhone}</div>
                </div>
              </a>

              <a
                href={settings.telegramGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 text-slate-200 transition-colors"
              >
                <Send className="w-4 h-4 text-sky-400" />
                <div>
                  <div className="font-bold">Telegram Community</div>
                  <div className="text-[10px] text-slate-400">Join Official Group</div>
                </div>
              </a>

              <a
                href={settings.whatsappGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl hover:bg-white/5 text-slate-200 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="font-bold">WhatsApp Group</div>
                  <div className="text-[10px] text-slate-400">Chat with Members</div>
                </div>
              </a>

              <button
                onClick={() => {
                  setSupportDrawerOpen(false);
                  navigateTo('profile');
                }}
                className="w-full text-center py-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/30 text-[11px] cursor-pointer"
              >
                Open Live Support Chat
              </button>
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation */}
        <BottomNav currentUser={currentUser} activeTab={activeTab} setActiveTab={navigateTo} />
      </div>
    </div>
  );
}
