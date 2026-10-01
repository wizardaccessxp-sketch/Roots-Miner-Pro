import React, { useState } from 'react';
import { User, DepositOrder, SystemSettings } from '../types';
import { StorageService } from '../services/storage';
import {
  Wallet,
  ArrowDownCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  PhoneCall,
  Lock
} from 'lucide-react';

interface DepositCheckoutPageProps {
  currentUser: User | null;
  settings: SystemSettings;
  onDepositComplete: () => void;
  onRequireLogin: () => void;
}

export const DepositCheckoutPage: React.FC<DepositCheckoutPageProps> = ({
  currentUser,
  settings,
  onDepositComplete,
  onRequireLogin,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(90000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isPaidConfirmed, setIsPaidConfirmed] = useState<boolean>(false);
  const [activeOrder, setActiveOrder] = useState<DepositOrder | null>(null);
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [iframeLoaded, setIframeLoaded] = useState<boolean>(false);

  const presetAmounts = [
    { label: 'H1 (30K)', amount: 30000 },
    { label: 'H2 (90K)', amount: 90000 },
    { label: 'H3 (120K)', amount: 120000 },
    { label: 'H4 (180K)', amount: 180000 },
    { label: 'H4-Pro (250K)', amount: 250000 },
    { label: 'H5 (300K)', amount: 300000 },
    { label: 'W-1 (430K)', amount: 430000 },
    { label: 'W-2 (600K)', amount: 600000 },
    { label: 'W-4 (1.0M)', amount: 1000000 },
  ];

  const payUrl = settings.pesajetPayUrl || 'https://pay.pesajet.com/pay/9fd83dddd7';

  const handleSelectPreset = (val: number) => {
    setSelectedAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomAmount(val);
    if (val) {
      setSelectedAmount(parseInt(val, 10));
    }
  };

  const handleBigGreenPayClick = () => {
    if (!currentUser) {
      onRequireLogin();
      return;
    }

    const effectiveAmount = customAmount ? parseInt(customAmount, 10) : selectedAmount;
    if (!effectiveAmount || effectiveAmount < 10000) {
      alert('Please select or enter an amount of at least UGX 10,000');
      return;
    }

    // Create pending deposit order in system
    const order = StorageService.createDepositOrder(currentUser.id, effectiveAmount, 'PesaJet Mobile Money');
    setActiveOrder(order);

    // Open PesaJet in new tab as specified
    window.open(payUrl, '_blank', 'noopener,noreferrer');
  };

  const handleConfirmPaid = () => {
    if (!currentUser) return;
    setIsPaidConfirmed(true);

    if (activeOrder) {
      // Record confirmation in storage (can be approved by admin or auto-confirmed)
      StorageService.confirmDeposit(activeOrder.id, 'User Payment Verification');
      onDepositComplete();
    } else {
      const order = StorageService.createDepositOrder(
        currentUser.id,
        selectedAmount,
        'PesaJet Mobile Money'
      );
      StorageService.confirmDeposit(order.id, 'User Payment Verification');
      onDepositComplete();
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-[#07132a] to-[#040817] shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>MOBILE MONEY DEPOSIT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              Deposit to Wallet
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
              Deposit via MTN or Airtel Mobile Money to rent miners.
            </p>
          </div>

          {currentUser && (
            <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-500/30 self-start sm:self-auto">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Deposit Wallet</span>
              <div className="text-xl font-extrabold font-mono text-cyan-300">
                UGX {currentUser.depositWallet.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Amount Selector */}
      <div className="p-5 rounded-2xl border border-white/10 bg-[#08122d]/80 space-y-4">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
          Select Deposit Amount (UGX)
        </label>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {presetAmounts.map((item) => {
            const isSelected = selectedAmount === item.amount && !customAmount;
            return (
              <button
                key={`${item.label}-${item.amount}`}
                onClick={() => handleSelectPreset(item.amount)}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all text-center cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-black font-extrabold shadow-lg shadow-emerald-500/20 scale-102'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/5'
                }`}
              >
                <div>{item.label}</div>
                <div className="text-[10px] opacity-75 font-mono">UGX {item.amount.toLocaleString()}</div>
              </button>
            );
          })}
        </div>

        {/* Custom Amount */}
        <div className="pt-2">
          <label className="text-[11px] text-slate-400 block mb-1">Or enter custom amount (UGX):</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">
              UGX
            </span>
            <input
              type="text"
              placeholder="e.g. 500,000"
              value={customAmount}
              onChange={handleCustomChange}
              className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* The Big Green Button specified by user prompt:
          "Build a checkout page with a big green button 'Pay  - MTN / Airtel Money'. When clicked, open https://pay.pesajet.com/pay/9fd83dddd7 in a new tab." */}
      <div className="space-y-3">
        <button
          onClick={handleBigGreenPayClick}
          className="w-full py-4 px-6 rounded-2xl text-base sm:text-lg font-black bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-500 text-black hover:brightness-110 shadow-2xl shadow-emerald-500/30 transition-all transform active:scale-[0.99] cursor-pointer flex items-center justify-center gap-3 border border-emerald-300/40"
        >
          <ArrowDownCircle className="w-6 h-6 text-black" />
          <span>Pay - MTN / Airtel Money</span>
          <span className="text-xs font-mono font-bold bg-black/20 px-2 py-0.5 rounded-md text-black">
            UGX {selectedAmount.toLocaleString()}
          </span>
          <ExternalLink className="w-5 h-5 text-black" />
        </button>

        <p className="text-center text-xs text-slate-400">
          Clicking above opens the secure PesaJet Mobile Money portal in a new tab. You can also complete your payment in the embedded portal below.
        </p>
      </div>

      {/* Success Message Banner (Triggered after payment) */}
      {isPaidConfirmed && (
        <div className="p-4 rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950/80 to-[#071912] shadow-xl text-center space-y-1 animate-pulse-glow">
          <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm sm:text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>Payment received, we will confirm your MTN transaction shortly</span>
          </div>
          <p className="text-xs text-slate-300">
            Funds will be reflected in your Deposit Wallet immediately upon network verification.
          </p>
        </div>
      )}

      {/* "I Have Completed Payment" Button for User Confirmation */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-black/40">
        <div className="text-xs">
          <span className="font-bold text-white">Finished paying on your phone?</span>
          <p className="text-[11px] text-slate-400">
            Click to notify our automated reconciliation system.
          </p>
        </div>
        <button
          onClick={handleConfirmPaid}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          I Have Paid
        </button>
      </div>

      {/* Embedded Iframe as specified by user prompt:
          "Also embed the same link below the button in an iframe with height 700px, rounded corners and shadow." */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            Direct Mobile Money Gateway Frame
          </span>
          <a
            href={payUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:underline flex items-center gap-1"
          >
            Open in Full Window <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="relative w-full rounded-2xl overflow-hidden shadow-2xl border border-emerald-500/20 bg-slate-950">
          <iframe
            src={payUrl}
            title="PesaJet Secure Payment Portal"
            className="w-full rounded-2xl border-0"
            style={{ height: '700px' }}
            allow="payment"
            onLoad={() => setIframeLoaded(true)}
          />
        </div>
      </div>

      {/* Footer Note specified by user prompt:
          "Add a footer note 'Powered by PesaJet - Secure Mobile Money'." */}
      <div className="pt-4 pb-2 text-center border-t border-white/10 space-y-1">
        <p className="text-xs sm:text-sm font-semibold text-emerald-400 tracking-wide font-mono">
          Powered by PesaJet - Secure Mobile Money
        </p>
        <p className="text-[11px] text-slate-500">
          Supported across MTN Mobile Money &amp; Airtel Money Uganda • 256-bit TLS Encrypted
        </p>
      </div>
    </div>
  );
};
