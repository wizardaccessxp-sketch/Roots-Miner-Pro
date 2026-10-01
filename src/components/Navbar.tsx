import React from 'react';
import { User, SystemSettings } from '../types';
import {
  Pickaxe,
  Wallet,
  Coins,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Cpu,
  Users,
  Lock,
  Headphones
} from 'lucide-react';

interface NavbarProps {
  currentUser: User | null;
  settings: SystemSettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  settings,
  activeTab,
  setActiveTab,
  onLogout,
  onOpenDeposit,
  onOpenWithdraw,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-cyan-500/20 bg-[#040714]/85 backdrop-blur-md">
      {/* Top micro ticker */}
      <div className="hidden sm:flex items-center justify-between px-4 py-1 text-xs bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-indigo-500/10 border-b border-white/5 text-slate-300">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            BTC: ~USh 362M
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-emerald-400 font-medium">Daily Withdrawals: 8:00 AM - 10:00 PM</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <a
            href={`tel:${settings.supportPhone.replace(/\s/g, '')}`}
            className="hover:text-amber-400 transition-colors flex items-center gap-1 text-slate-300"
          >
            <Headphones className="w-3 h-3 text-amber-400" />
            Support: {settings.supportPhone}
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#070c20] rounded-[10px] flex items-center justify-center">
                <Pickaxe className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-mono">
                  ROOTS<span className="text-amber-400">MINERS</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-gradient-to-r from-amber-500 to-cyan-500 text-black">
                  PRO
                </span>
              </div>
              <p className="text-[10px] text-cyan-400/80 tracking-wider uppercase font-semibold">
                Bitcoin Cloud Mining
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('miners')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'miners'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Cpu className="w-4 h-4 text-amber-400" />
              Miners Fleet
            </button>
            <button
              onClick={() => setActiveTab('team')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'team'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-400" />
              Team (5%)
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Headphones className="w-4 h-4 text-indigo-400" />
              Support
            </button>
          </nav>

          {/* Right Section: Balances & User Session */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Deposit Wallet (Outside Money) */}
                <div
                  onClick={onOpenDeposit}
                  title="Deposit Wallet (Money from outside to rent machines)"
                  className="cursor-pointer group flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 hover:border-cyan-400 transition-colors"
                >
                  <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-cyan-300/80 font-medium uppercase leading-none">
                      Wallet
                    </div>
                    <div className="text-xs sm:text-sm font-mono font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {currentUser.depositWallet.toLocaleString()} <span className="text-[10px] text-cyan-400">UGX</span>
                    </div>
                  </div>
                </div>

                {/* Withdrawable Mining Balance (Inner Money) */}
                <div
                  onClick={onOpenWithdraw}
                  title="Withdrawable Mining Balance (Yield & Referrals)"
                  className="cursor-pointer group flex items-center gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-amber-950/40 border border-amber-500/30 hover:border-amber-400 transition-colors"
                >
                  <div className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                    <Coins className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] text-amber-300/80 font-medium uppercase leading-none">
                      Balance
                    </div>
                    <div className="text-xs sm:text-sm font-mono font-bold text-amber-300 group-hover:text-amber-200 transition-colors">
                      {currentUser.miningBalance.toLocaleString()} <span className="text-[10px] text-amber-400">UGX</span>
                    </div>
                  </div>
                </div>

                {/* Admin Quick Link */}
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 cursor-pointer transition-colors shadow-sm"
                    title="Access Admin Panel"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Admin Panel</span>
                  </button>
                )}
                {currentUser.role === 'super-admin' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setActiveTab('admin')}
                      className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 cursor-pointer transition-colors"
                      title="Access Admin Panel"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Admin</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('super-admin')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30 cursor-pointer transition-colors shadow-sm"
                      title="Access Owner Admin Panel"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Owner Admin</span>
                    </button>
                  </div>
                )}

                {/* User Info / Logout */}
                <div className="flex items-center gap-1.5 pl-1 border-l border-white/10">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                    title={`Logged in as ${currentUser.username} (${currentUser.phone})`}
                  >
                    <UserIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onLogout}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('login')}
                  className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Lock className="w-4 h-4" />
                  Sign In / Register
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
