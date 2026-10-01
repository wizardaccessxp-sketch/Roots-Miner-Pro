import React, { useState } from 'react';
import { User, WithdrawalRequest, SystemSettings } from '../types';
import { StorageService } from '../services/storage';
import {
  ArrowUpCircle,
  Coins,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Info,
  ArrowRight,
  Wallet,
  Check,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  Radio,
  ExternalLink,
  X
} from 'lucide-react';

interface WithdrawalPageProps {
  currentUser: User | null;
  settings: SystemSettings;
  onWithdrawalRequested: () => void;
  onOpenDeposit: () => void;
  onRequireLogin: () => void;
}

export const WithdrawalPage: React.FC<WithdrawalPageProps> = ({
  currentUser,
  settings,
  onWithdrawalRequested,
  onOpenDeposit,
  onRequireLogin,
}) => {
  const [amountStr, setAmountStr] = useState<string>('5000');
  const [provider, setProvider] = useState<'MTN Mobile Money' | 'Airtel Money'>('MTN Mobile Money');
  const [accountNumber, setAccountNumber] = useState<string>(
    currentUser?.withdrawalAccount?.accountNumber || currentUser?.phone || ''
  );
  const [accountName, setAccountName] = useState<string>(
    currentUser?.withdrawalAccount?.accountName || currentUser?.username || ''
  );
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalData, setSuccessModalData] = useState<WithdrawalRequest | null>(null);

  const amount = parseInt(amountStr, 10) || 0;
  const fee = Math.round(amount * (settings.withdrawalFeePercent / 100));
  const netAmount = Math.max(0, amount - fee);

  const now = new Date();
  const currentHour = now.getHours();
  const isWithinHours = currentHour >= settings.withdrawStartHour && currentHour < settings.withdrawEndHour;
  const hasDeposited = currentUser ? (currentUser.totalDeposited || 0) > 0 : false;

  const userWithdrawals = currentUser
    ? StorageService.getWithdrawals().filter((w) => w.userId === currentUser.id)
    : [];

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    if (!accountNumber || !accountName) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter your Mobile Money recipient number and registered account name.',
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const res = StorageService.requestWithdrawal(currentUser.id, amount, {
        provider,
        accountNumber,
        accountName,
      });

      setIsSubmitting(false);

      if (res.success && res.withdrawal) {
        setStatusMessage({
          type: 'success',
          text: res.message,
        });
        setSuccessModalData(res.withdrawal);
        onWithdrawalRequested();
      } else {
        setStatusMessage({
          type: 'error',
          text: res.message,
        });
      }
    }, 500);
  };

  return (
    <div className="space-y-6 pb-24 max-w-3xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-[#0a0f24] to-[#040817] shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>DISBURSEMENTS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              Withdraw Funds 🔘
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
              Withdraw directly to MTN or Airtel Mobile Money within 30 minutes.
            </p>
          </div>

          {currentUser && (
            <div className="p-3.5 rounded-xl bg-black/40 border border-amber-500/30 self-start sm:self-auto">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Withdrawable Balance</span>
              <div className="text-xl font-extrabold font-mono text-amber-300">
                UGX {currentUser.miningBalance.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Message */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-medium ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        </div>
      )}

      {/* Critical Rule Warning: "no account should withdraw before depositing hence the word *please join use*" */}
      {currentUser && !hasDeposited && (
        <div className="p-5 rounded-2xl border border-amber-500/50 bg-gradient-to-r from-amber-950/60 to-black/80 shadow-xl space-y-3">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-extrabold text-amber-300 text-sm sm:text-base font-mono">
                *Please join us!* Account Activation Required
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                As per Roots Miners Pro platform security rules, <strong>no account can withdraw before depositing</strong>. Please complete at least one deposit (minimum 30,000 UGX for H1 miner) to activate your automated withdrawal gateway.
              </p>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onOpenDeposit}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-extrabold text-xs hover:brightness-110 shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              Make First Deposit to Activate Withdrawals
            </button>
          </div>
        </div>
      )}

      {/* Rules & Time Badge */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl border border-white/10 bg-[#070e24] flex items-center gap-2.5">
          <Clock className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <div>
            <span className="text-slate-400">Withdrawal Hours:</span>
            <p className="text-white font-mono font-bold">8:00 AM – 10:00 PM</p>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-white/10 bg-[#070e24] flex items-center gap-2.5">
          <Coins className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <div>
            <span className="text-slate-400">Minimum Amount:</span>
            <p className="text-amber-300 font-mono font-bold">UGX 5,000</p>
          </div>
        </div>

        <div className="p-3 rounded-xl border border-white/10 bg-[#070e24] flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <div>
            <span className="text-slate-400">Disbursement Time:</span>
            <p className="text-emerald-400 font-mono font-bold">Within 30 Minutes</p>
          </div>
        </div>
      </div>

      {/* Main Withdrawal Form */}
      <form onSubmit={handleWithdrawSubmit} className="p-6 rounded-2xl border border-white/10 bg-[#070e24]/90 space-y-5">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
          Withdrawal Request Form
        </h2>

        {/* Amount Input */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Withdrawal Amount (UGX) <span className="text-amber-400">*Minimum 5,000 UGX</span>
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
              UGX
            </span>
            <input
              type="number"
              min="5000"
              step="1000"
              value={amountStr}
              onChange={(e) => setAmountStr(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full pl-14 pr-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          {/* Quick preset buttons */}
          <div className="flex flex-wrap gap-2 mt-2">
            {[5000, 15000, 30000, 50000, 100000, 250000].map((val) => (
              <button
                type="button"
                key={val}
                onClick={() => setAmountStr(val.toString())}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-mono text-slate-300 border border-white/5 cursor-pointer"
              >
                UGX {val.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* 10% Fee Breakdown Card */}
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-2 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Requested Amount:</span>
            <span className="font-mono text-white">UGX {amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Platform Charge (10%):</span>
            <span className="font-mono text-rose-400">-UGX {fee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10">
            <span className="text-emerald-400">You Receive (Net 90%):</span>
            <span className="font-mono text-base text-emerald-400">
              UGX {netAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Mobile Money Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Select Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
            >
              <option value="MTN Mobile Money">MTN Mobile Money (Uganda)</option>
              <option value="Airtel Money">Airtel Money (Uganda)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Mobile Money Number
            </label>
            <input
              type="text"
              placeholder="e.g. 0787 493168"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Registered Account Holder Name
            </label>
            <input
              type="text"
              placeholder="Exact name on your SIM card / National ID"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              required
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !hasDeposited || (currentUser ? currentUser.miningBalance < amount : true)}
          className="w-full py-3.5 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowUpCircle className="w-5 h-5 text-black" />
          {isSubmitting ? 'Processing Request...' : `Submit Withdrawal (Net UGX ${netAmount.toLocaleString()})`}
        </button>

        {currentUser && currentUser.miningBalance < amount && (
          <p className="text-center text-[11px] text-rose-400">
            Insufficient Withdrawable Balance. You have UGX {currentUser.miningBalance.toLocaleString()} available.
          </p>
        )}
      </form>

      {/* Withdrawal History */}
      {currentUser && (
        <div className="p-5 rounded-2xl border border-white/10 bg-[#070e24] space-y-3">
          <h3 className="text-xs font-bold uppercase text-slate-400 font-mono">
            My Withdrawal Requests ({userWithdrawals.length})
          </h3>

          {userWithdrawals.length === 0 ? (
            <p className="text-xs text-slate-500 py-3 text-center">No withdrawal requests yet.</p>
          ) : (
            <div className="space-y-2">
              {userWithdrawals.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-black/30 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono">
                        UGX {w.amountUGX.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        (Net: UGX {w.netAmountUGX.toLocaleString()})
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          w.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : w.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {w.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      To: {w.provider} ({w.accountNumber}) • {w.accountName}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {new Date(w.requestedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUCCESS CONFIRMATION MODAL WITH ANIMATION & 30-MINUTE REASSURANCE */}
      {successModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-all">
          <div className="relative w-full max-w-lg rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-[#0b1c2e] via-[#071120] to-[#040814] p-6 sm:p-8 shadow-2xl shadow-emerald-500/20 text-center space-y-6 overflow-hidden">
            {/* Top ambient glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-32 bg-emerald-500/15 blur-3xl pointer-events-none"></div>

            {/* Close X button */}
            <button
              onClick={() => setSuccessModalData(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Animated Confirmation Icon with Concentric Ripple Rings */}
            <div className="relative flex items-center justify-center pt-2">
              {/* Outer Ripple 1 */}
              <div className="absolute w-24 h-24 rounded-full bg-emerald-500/20 animate-ripple pointer-events-none"></div>
              {/* Outer Ripple 2 */}
              <div className="absolute w-20 h-20 rounded-full bg-emerald-400/25 animate-ripple delay-300 pointer-events-none"></div>

              {/* Glowing Icon Base */}
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-500 to-green-400 p-1 shadow-2xl shadow-emerald-500/50">
                <div className="w-full h-full rounded-full bg-[#050e1c] flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 animate-checkmark">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Heading */}
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold font-mono uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Request Queued &amp; Verified
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight pt-1">
                Withdrawal Dispatched!
              </h2>
              <p className="text-xs text-slate-300 max-w-sm mx-auto">
                Your withdrawal has been validated and sent to our high-speed Mobile Money disbursement gateway.
              </p>
            </div>

            {/* Prominent 30-Minute Processing Time Reassurance Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-cyan-950/50 to-emerald-950/70 border border-emerald-500/40 space-y-2 relative overflow-hidden">
              <div className="flex items-center justify-center gap-2.5 text-emerald-300 font-extrabold text-sm sm:text-base font-mono">
                <div className="relative">
                  <Clock className="w-5 h-5 text-emerald-400 animate-pulse" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
                <span>Disbursement Within 30 Minutes</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto">
                Roots Miners Pro automated liquidity protocol disburses directly to your SIM card. You will receive an official carrier SMS alert from{' '}
                <strong className="text-white">{successModalData.provider}</strong> shortly.
              </p>
            </div>

            {/* 3-Step Live Processing Progression */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2 text-left">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider block">
                Disbursement Pipeline:
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2.5 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="font-medium text-slate-200">
                    Mining Balance Deducted &amp; Audited
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono ml-auto">DONE</span>
                </div>

                <div className="flex items-center gap-2.5 text-cyan-300">
                  <div className="relative flex-shrink-0">
                    <Radio className="w-4 h-4 text-cyan-400 animate-spin" />
                  </div>
                  <span className="font-medium text-slate-200">
                    Carrier Payment Gateway Dispatch (MTN / Airtel)
                  </span>
                  <span className="text-[10px] text-cyan-400 font-mono ml-auto">IN ROUTE</span>
                </div>

                <div className="flex items-center gap-2.5 text-slate-400">
                  <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="font-medium text-slate-300">
                    Final Mobile Money Credit &amp; SMS Receipt
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono ml-auto">&lt; 30 MINS</span>
                </div>
              </div>
            </div>

            {/* Transaction Receipt Card */}
            <div className="p-4 rounded-xl bg-black/50 border border-white/10 space-y-2 text-xs text-left">
              <div className="flex justify-between text-slate-400">
                <span>Reference ID:</span>
                <span className="font-mono text-slate-200 font-bold">{successModalData.id}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Gross Amount:</span>
                <span className="font-mono text-white">UGX {successModalData.amountUGX.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Platform Processing Fee (10%):</span>
                <span className="font-mono text-rose-400">-UGX {successModalData.feeUGX.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Recipient:</span>
                <span className="font-mono text-white font-semibold">
                  {successModalData.provider} ({successModalData.accountNumber})
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Account Name:</span>
                <span className="text-slate-200">{successModalData.accountName}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm pt-2 border-t border-white/10">
                <span className="text-emerald-400">Net Amount to Receive:</span>
                <span className="font-mono text-base text-emerald-400">
                  UGX {successModalData.netAmountUGX.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Assistance Notice */}
            <div className="text-[11px] text-slate-400 flex items-center justify-center gap-3">
              <a
                href={`tel:${settings.supportPhone.replace(/\s/g, '')}`}
                className="hover:text-amber-400 transition-colors flex items-center gap-1 font-semibold"
              >
                <PhoneCall className="w-3 h-3 text-amber-400" />
                Support: {settings.supportPhone}
              </a>
              <span>•</span>
              <a
                href={settings.telegramGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-400 transition-colors flex items-center gap-1"
              >
                Telegram Group <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <button
                onClick={() => setSuccessModalData(null)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-extrabold text-xs hover:brightness-110 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 text-black stroke-[3]" />
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
