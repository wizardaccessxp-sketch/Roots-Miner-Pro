import React, { useState, useEffect } from 'react';
import { User, MinerPackage, UserMiner, SystemSettings } from '../types';
import { StorageService } from '../services/storage';
import {
  Wallet,
  Coins,
  ArrowDownCircle,
  ArrowUpCircle,
  PhoneCall,
  Send,
  MessageCircle,
  Clock,
  Cpu,
  Flame,
  Zap,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Lock
} from 'lucide-react';

interface HomePageProps {
  currentUser: User | null;
  settings: SystemSettings;
  packages: MinerPackage[];
  userMiners: UserMiner[];
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onGoToMiners: () => void;
  onGoToTeam: () => void;
  onGoToProfile: () => void;
  onRequireLogin: () => void;
  onGoToAdmin?: () => void;
  onGoToSuperAdmin?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  currentUser,
  settings,
  packages,
  userMiners,
  onOpenDeposit,
  onOpenWithdraw,
  onGoToMiners,
  onGoToTeam,
  onGoToProfile,
  onRequireLogin,
  onGoToAdmin,
  onGoToSuperAdmin,
}) => {
  const [liveHashrate, setLiveHashrate] = useState(842.6);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveHashrate((prev) => +(prev + (Math.random() - 0.5) * 0.8).toFixed(2));
      setNow(new Date());
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = now.getHours();
  const isWithdrawTime = currentHour >= settings.withdrawStartHour && currentHour < settings.withdrawEndHour;
  const isWeekend = now.getDay() === 0 || now.getDay() === 6;

  // Active miners for current user
  const activeMiners = currentUser ? userMiners.filter((m) => m.userId === currentUser.id) : [];

  return (
    <div className="space-y-6 pb-20">
      {/* Hero / Announcement Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-[#0b132b]/80 to-cyan-950/40 p-5 sm:p-7 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>BITCOIN MINING PLATFORM</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight font-mono">
              Roots Miners <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-cyan-400">Pro</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Rent high-yield ASIC miners with automated daily Mobile Money payouts.
            </p>
          </div>
        </div>
      </div>

      {/* Admin Panel Quick Access Banner for Administrators */}
      {currentUser && (currentUser.role === 'admin' || currentUser.role === 'super-admin') && (
        <div className="p-4 sm:p-5 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 via-[#071728] to-[#08122c] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-white font-mono">
                  Administrator Panel
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Member directory, approve deposit orders, adjust mining rates &amp; view logs.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onGoToAdmin}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs cursor-pointer transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              Open Admin Panel
            </button>
            {currentUser.role === 'super-admin' && (
              <button
                onClick={onGoToSuperAdmin}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4" />
                Owner Console
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Balances Section: Wallet (Outside) vs Balance (Inside) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Deposit Wallet Card */}
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#07132a]/90 to-[#040817]/95 p-5 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-cyan-300 tracking-wider">
                  Deposit Wallet
                </span>
                <p className="text-[11px] text-slate-400">
                  Funds deposited from outside (MTN / Airtel Money) used to rent miners
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              Outside Money
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white">
              {currentUser ? currentUser.depositWallet.toLocaleString() : '0'}
            </span>
            <span className="text-sm font-bold text-cyan-400 font-mono">UGX</span>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 pt-4 border-t border-cyan-500/20">
            <div className="text-[11px] text-slate-400">
              Total Deposited: <span className="text-slate-200 font-semibold font-mono">UGX {currentUser ? (currentUser.totalDeposited || 0).toLocaleString() : '0'}</span>
            </div>
            <button
              onClick={currentUser ? onOpenDeposit : onRequireLogin}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowDownCircle className="w-4 h-4" />
              Deposit Funds
            </button>
          </div>
        </div>

        {/* Mining Balance Card */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-[#211403]/80 to-[#070b1c]/95 p-5 shadow-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase font-bold text-amber-300 tracking-wider">
                  Mining Balance (Withdrawable)
                </span>
                <p className="text-[11px] text-slate-400">
                  Money from inner system (Daily ASIC mined BTC yield &amp; 5% referral rewards)
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Withdrawable
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-300">
              {currentUser ? currentUser.miningBalance.toLocaleString() : '5,000'}
            </span>
            <span className="text-sm font-bold text-amber-400 font-mono">UGX</span>
          </div>

          <div className="mt-5 flex items-center justify-between gap-3 pt-4 border-t border-amber-500/20">
            <div className="text-[11px] text-slate-400">
              Disbursed in 30 mins (10% fee)
            </div>
            <button
              onClick={currentUser ? onOpenWithdraw : onRequireLogin}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowUpCircle className="w-4 h-4" />
              Withdraw Cash
            </button>
          </div>
        </div>
      </div>

      {/* Fast Action Buttons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 font-mono">
            <Zap className="w-4 h-4 text-amber-400" />
            Quick Actions
          </h2>
          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Depositing Button */}
          <button
            onClick={currentUser ? onOpenDeposit : onRequireLogin}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-emerald-950/60 to-[#081224] border border-emerald-500/30 hover:border-emerald-400 hover:scale-[1.02] transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 group-hover:bg-emerald-500 group-hover:text-black transition-colors">
              <ArrowDownCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-white">Deposit</span>
            <span className="text-[10px] text-emerald-400">MTN / Airtel</span>
          </button>

          {/* Withdrawal Button */}
          <button
            onClick={currentUser ? onOpenWithdraw : onRequireLogin}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-amber-950/60 to-[#081224] border border-amber-500/30 hover:border-amber-400 hover:scale-[1.02] transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2 group-hover:bg-amber-500 group-hover:text-black transition-colors">
              <ArrowUpCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-white">Withdraw 🔘</span>
            <span className="text-[10px] text-amber-400">Min 5,000 UGX</span>
          </button>

          {/* Customer Care */}
          <a
            href={`tel:${settings.supportPhone.replace(/\s/g, '')}`}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-blue-950/60 to-[#081224] border border-blue-500/30 hover:border-blue-400 hover:scale-[1.02] transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <PhoneCall className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white text-center">Call Support</span>
            <span className="text-[10px] text-blue-300 font-mono text-center truncate max-w-[130px]">
              {settings.supportPhone}
            </span>
          </a>

          {/* Telegram Group */}
          <a
            href={settings.telegramGroupLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-sky-950/60 to-[#081224] border border-sky-500/30 hover:border-sky-400 hover:scale-[1.02] transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center mb-2 group-hover:bg-sky-500 group-hover:text-white transition-colors">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white text-center">Telegram Group</span>
            <span className="text-[10px] text-sky-300 flex items-center gap-0.5">
              Community <ExternalLink className="w-2.5 h-2.5" />
            </span>
          </a>

          {/* WhatsApp Group */}
          <a
            href={settings.whatsappGroupLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-green-950/60 to-[#081224] border border-green-500/30 hover:border-green-400 hover:scale-[1.02] transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-2 group-hover:bg-green-500 group-hover:text-white transition-colors">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white text-center">WhatsApp Group</span>
            <span className="text-[10px] text-green-300 flex items-center gap-0.5">
              Community <ExternalLink className="w-2.5 h-2.5" />
            </span>
          </a>

          {/* Telegram Support */}
          <a
            href={settings.telegramSupportLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-indigo-950/60 to-[#081224] border border-indigo-500/30 hover:border-indigo-400 hover:scale-[1.02] transition-all cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-2 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <Send className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-white text-center">Telegram Support</span>
            <span className="text-[10px] text-indigo-300">Live Agent</span>
          </a>
        </div>
      </div>

      {/* Rules Notice Highlights Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-cyan-500/20 bg-cyan-950/20 flex items-center gap-3">
          <Clock className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-white">24h Machine Roll-Up:</span>
            <p className="text-slate-400 text-[11px]">
              Miners start daily count 24 hours after renting time.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-950/20 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-white">Withdrawal Window:</span>
            <p className="text-slate-400 text-[11px]">
              Daily 8:00 AM to 10:00 PM • Min 5,000 UGX • 10% fee.
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-950/20 flex items-center gap-3">
          <Zap className="w-5 h-5 text-purple-400 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-white">Weekend Policy:</span>
            <p className="text-slate-400 text-[11px]">
              Mining packages operate Mon–Fri (excludes weekends).
            </p>
          </div>
        </div>
      </div>

      {/* Active User Miners Live Status */}
      {currentUser && (
        <div className="rounded-2xl border border-white/10 bg-[#070d22]/90 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white font-mono">
                My Active Mining Fleet ({activeMiners.length})
              </h2>
            </div>
            <button
              onClick={onGoToMiners}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              Rent New Miner <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {activeMiners.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
              <Cpu className="w-10 h-10 text-slate-500 mx-auto mb-2 opacity-50" />
              <p className="text-sm text-slate-300 font-medium">No rented mining machines yet</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Rent an H-Series machine to start generating daily withdrawable income, or a W-Series machine for full cycle payouts.
              </p>
              <button
                onClick={onGoToMiners}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-black hover:bg-amber-400 transition-colors cursor-pointer"
              >
                Browse Mining Packages
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeMiners.map((miner) => {
                const activationTime = new Date(miner.activationAt).getTime();
                const diffMs = activationTime - now.getTime();
                const isWarmup = diffMs > 0;
                const hoursLeft = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
                const minsLeft = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));

                return (
                  <div
                    key={miner.id}
                    className="p-4 rounded-xl border border-cyan-500/20 bg-gradient-to-b from-[#0b1736] to-[#060c20] space-y-3 relative overflow-hidden"
                  >
                    {/* Warmup scanning line */}
                    {isWarmup && <div className="absolute inset-x-0 h-0.5 bg-amber-400 mining-laser opacity-75"></div>}

                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white text-sm font-mono">{miner.name}</span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 font-mono">
                            {miner.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">{miner.model}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isWarmup
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {isWarmup ? 'Warmup (24h roll-up)' : '⛏️ Actively Mining'}
                      </span>
                    </div>

                    {isWarmup ? (
                      <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200/90 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-medium">
                          <span>Warmup Countdown:</span>
                          <span className="font-mono font-bold text-amber-400">
                            {hoursLeft}h {minsLeft}m remaining
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Machine will begin counting yield after 24 hours from rental time.
                        </p>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-xs text-emerald-200/90 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span>Active Mining Days:</span>
                          <span className="font-mono font-bold text-emerald-400">
                            Day {miner.daysActive} / {miner.cycleDays}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span>Accumulated Yield:</span>
                          <span className="font-mono font-bold text-white">
                            UGX {miner.totalMinedUGX.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
                      <span className="text-slate-400">Hashrate:</span>
                      <span className="font-mono font-bold text-cyan-400">{miner.hashrate}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Featured Bitcoin Miners Showcase */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white font-mono flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-400" />
              Investment Series Fleet
            </h2>
            <p className="text-xs text-slate-400">
              Select between H-Series (Daily Cashflow) and W-Series (Full Cycle Expiry Payout)
            </p>
          </div>
          <button
            onClick={onGoToMiners}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-cyan-400 border border-cyan-500/30 cursor-pointer"
          >
            View All ({packages.length})
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.slice(0, 6).map((pkg) => (
            <div
              key={pkg.id}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#0d1636]/90 to-[#05091a]/95 overflow-hidden shadow-xl hover:border-amber-500/40 transition-all flex flex-col justify-between"
            >
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {pkg.code} • {pkg.series}-SERIES
                    </span>
                    <h3 className="font-bold text-white text-base mt-1">{pkg.name}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">{pkg.model}</p>
                  </div>
                  <span className="text-xs font-bold text-cyan-400 font-mono">{pkg.hashrate}</span>
                </div>

                {/* Price & Returns */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Rent Price:</span>
                    <span className="font-mono font-bold text-white text-sm">
                      UGX {pkg.priceUGX.toLocaleString()}
                    </span>
                  </div>
                  {pkg.series === 'H' ? (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-emerald-400 font-medium">Daily Income:</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        +UGX {pkg.dailyIncomeUGX.toLocaleString()} / day
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-amber-400 font-medium">Total Return:</span>
                      <span className="font-mono font-bold text-amber-400 text-sm">
                        UGX {(pkg.totalReturnUGX || 0).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2">
                  {pkg.description}
                </p>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={onGoToMiners}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Cpu className="w-4 h-4" />
                  Rent This Machine
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
