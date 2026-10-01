import React, { useState } from 'react';
import { User, MinerPackage, UserMiner } from '../types';
import { StorageService } from '../services/storage';
import {
  Cpu,
  Zap,
  Clock,
  ShieldCheck,
  Flame,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Wallet
} from 'lucide-react';

interface MinersPageProps {
  currentUser: User | null;
  packages: MinerPackage[];
  userMiners: UserMiner[];
  onMinerRented: () => void;
  onOpenDeposit: () => void;
  onRequireLogin: () => void;
}

export const MinersPage: React.FC<MinersPageProps> = ({
  currentUser,
  packages,
  userMiners,
  onMinerRented,
  onOpenDeposit,
  onRequireLogin,
}) => {
  const [selectedSeries, setSelectedSeries] = useState<'ALL' | 'H' | 'W'>('ALL');
  const [confirmModalPkg, setConfirmModalPkg] = useState<MinerPackage | null>(null);
  const [alertMessage, setAlertMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isRenting, setIsRenting] = useState(false);

  const activeUserMiners = currentUser ? userMiners.filter((m) => m.userId === currentUser.id) : [];

  const filteredPackages = packages.filter((pkg) => {
    if (selectedSeries === 'ALL') return true;
    return pkg.series === selectedSeries;
  });

  const handleInitiateRent = (pkg: MinerPackage) => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    if (currentUser.depositWallet < pkg.priceUGX) {
      setAlertMessage({
        type: 'error',
        text: `Insufficient Wallet Balance! You need UGX ${pkg.priceUGX.toLocaleString()}, but currently have UGX ${currentUser.depositWallet.toLocaleString()} in your deposit wallet. Please deposit via MTN/Airtel first.`,
      });
      return;
    }

    setConfirmModalPkg(pkg);
  };

  const handleConfirmRent = () => {
    if (!currentUser || !confirmModalPkg) return;
    setIsRenting(true);

    setTimeout(() => {
      const res = StorageService.rentMiner(currentUser.id, confirmModalPkg);
      setIsRenting(false);
      setConfirmModalPkg(null);

      if (res.success) {
        setAlertMessage({
          type: 'success',
          text: res.message,
        });
        onMinerRented();
      } else {
        setAlertMessage({
          type: 'error',
          text: res.message,
        });
      }
    }, 600);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Alert Banner */}
      {alertMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-medium ${
            alertMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            )}
            <span>{alertMessage.text}</span>
          </div>
          {alertMessage.type === 'error' && (
            <button
              onClick={() => {
                setAlertMessage(null);
                onOpenDeposit();
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 flex-shrink-0 cursor-pointer"
            >
              Deposit Now
            </button>
          )}
        </div>
      )}

      {/* Header & Series Info Banner */}
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-[#071026] to-cyan-950/30 shadow-xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>MINERS FLEET</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              Miners Fleet
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Earnings accrue Mon–Fri starting 24h after activation.
            </p>
          </div>

          {/* Quick Wallet pill */}
          {currentUser && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10 self-start md:self-auto">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Deposit Wallet</span>
                <div className="text-base font-bold font-mono text-cyan-300">
                  UGX {currentUser.depositWallet.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Series Filter Tabs */}
        <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-white/10">
          <button
            onClick={() => setSelectedSeries('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedSeries === 'ALL'
                ? 'bg-white text-black shadow-lg'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            All ({packages.length})
          </button>
          <button
            onClick={() => setSelectedSeries('H')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedSeries === 'H'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            H-Series (Daily)
          </button>
          <button
            onClick={() => setSelectedSeries('W')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedSeries === 'W'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                : 'bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 border border-cyan-500/30'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            W-Series (Cycle)
          </button>
        </div>
      </div>

      {/* Notice info on H vs W Series */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/20 space-y-1.5">
          <div className="flex items-center gap-2 text-amber-300 font-bold text-xs uppercase font-mono">
            <Flame className="w-4 h-4 text-amber-400" />
            H-Series Rule: Daily Payouts
          </div>
          <p className="text-xs text-slate-300">
            H-Series machines generate daily income that is credited directly into your <strong className="text-amber-300">Withdrawable Mining Balance</strong>. You can withdraw daily before the cycle completes!
          </p>
        </div>

        <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/20 space-y-1.5">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase font-mono">
            <Zap className="w-4 h-4 text-cyan-400" />
            W-Series Rule: Cycle Expiry Payout
          </div>
          <p className="text-xs text-slate-300">
            W-Series earnings are counted daily in the machine monitor, but the entire guaranteed sum (up to <strong className="text-cyan-300">45,000,000 UGX</strong>) is disbursed upon machine days expiry.
          </p>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => {
          const isH = pkg.series === 'H';

          return (
            <div
              key={pkg.id}
              className={`rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-2xl relative group ${
                isH
                  ? 'border-amber-500/30 bg-gradient-to-b from-[#141b36] to-[#070b1c] hover:border-amber-400'
                  : 'border-cyan-500/30 bg-gradient-to-b from-[#0c1e3d] to-[#070b1c] hover:border-cyan-400'
              }`}
            >
              {/* Top Image Preview & Badges */}
              <div className="relative h-44 w-full overflow-hidden bg-black/60">
                <img
                  src={pkg.image}
                  alt={pkg.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b1c] via-transparent to-transparent"></div>

                {/* Badge Top Left */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono shadow-md ${
                      isH ? 'bg-amber-500 text-black' : 'bg-cyan-500 text-black'
                    }`}
                  >
                    {pkg.code}
                  </span>
                  {pkg.badge && (
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-black/80 text-white border border-white/20 backdrop-blur-sm">
                      {pkg.badge}
                    </span>
                  )}
                </div>

                {/* Hashrate Top Right */}
                <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/80 border border-white/20 text-cyan-300 text-xs font-bold font-mono">
                  {pkg.hashrate}
                </div>
              </div>

              {/* Machine Specs & Yield Details */}
              <div className="p-5 space-y-4 flex-1">
                <div>
                  <h3 className="text-lg font-bold text-white font-mono group-hover:text-amber-300 transition-colors">
                    {pkg.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">{pkg.model}</p>
                </div>

                {/* Income / Return Box */}
                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Rent Cost:</span>
                    <span className="font-mono font-extrabold text-white text-base">
                      UGX {pkg.priceUGX.toLocaleString()}
                    </span>
                  </div>

                  {isH ? (
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-emerald-400" />
                        Daily Yield:
                      </span>
                      <span className="font-mono font-extrabold text-emerald-400 text-base">
                        +UGX {pkg.dailyIncomeUGX.toLocaleString()} / day
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-white/5">
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        Total Cycle Return:
                      </span>
                      <span className="font-mono font-extrabold text-amber-400 text-base">
                        UGX {(pkg.totalReturnUGX || 0).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-white/5">
                    <span>Operational Period:</span>
                    <span className="font-mono font-medium text-slate-200">
                      {pkg.cycleDays} Days (Mon–Fri)
                    </span>
                  </div>
                </div>

                {/* Rules / Specs Tags */}
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" /> 24h Warmup
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-400" /> Weekends Off
                  </span>
                  <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                    {pkg.efficiency}
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {pkg.description}
                </p>
              </div>

              {/* Action Button */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => handleInitiateRent(pkg)}
                  className={`w-full py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                    isH
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110 shadow-amber-500/20'
                      : 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-black hover:brightness-110 shadow-cyan-500/20'
                  }`}
                >
                  <Cpu className="w-4 h-4" />
                  Rent {pkg.code} for UGX {pkg.priceUGX.toLocaleString()}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {confirmModalPkg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-[#070e24] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-mono">
                  Confirm Machine Rental
                </h3>
              </div>
              <button
                onClick={() => setConfirmModalPkg(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Machine:</span>
                <span className="font-bold text-white">{confirmModalPkg.name} ({confirmModalPkg.code})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Rental Price:</span>
                <span className="font-mono font-bold text-white">UGX {confirmModalPkg.priceUGX.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Yield Type:</span>
                <span className="font-bold text-amber-400">
                  {confirmModalPkg.series === 'H'
                    ? `Daily UGX ${confirmModalPkg.dailyIncomeUGX.toLocaleString()}`
                    : `Full Return UGX ${(confirmModalPkg.totalReturnUGX || 0).toLocaleString()}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Your Deposit Wallet:</span>
                <span className="font-mono font-bold text-cyan-400">
                  UGX {currentUser?.depositWallet.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-200/90 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> 24-Hour Roll-up Rule:
              </p>
              <p className="text-[11px] text-slate-300">
                Your machine starts counting yield 24 hours after this rental timestamp. Packages do not count weekend days.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setConfirmModalPkg(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isRenting}
                onClick={handleConfirmRent}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                {isRenting ? 'Allocating ASIC...' : 'Confirm & Rent'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
