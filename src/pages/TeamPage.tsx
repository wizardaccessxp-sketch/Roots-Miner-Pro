import React, { useState } from 'react';
import { User, SystemSettings } from '../types';
import { StorageService } from '../services/storage';
import {
  Users,
  Copy,
  Share2,
  Check,
  Coins,
  TrendingUp,
  Award,
  Sparkles,
  MessageCircle,
  Send,
  ShieldCheck
} from 'lucide-react';

interface TeamPageProps {
  currentUser: User | null;
  settings: SystemSettings;
  onRequireLogin: () => void;
}

export const TeamPage: React.FC<TeamPageProps> = ({ currentUser, settings, onRequireLogin }) => {
  const [copied, setCopied] = useState(false);

  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <Users className="w-16 h-16 text-emerald-400 mx-auto opacity-75" />
        <h2 className="text-xl font-bold text-white font-mono">Team &amp; Referral Program</h2>
        <p className="text-xs text-slate-400">
          Sign in or register an account to access your unique invitation link and earn 5% multi-level commissions!
        </p>
        <button
          onClick={onRequireLogin}
          className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 cursor-pointer"
        >
          Sign In to View Team Link
        </button>
      </div>
    );
  }

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rootsminers.pro';
  const inviteLink = `${origin}/login?tab=register&ref=${currentUser.inviteCode}`;
  const shareMessage = `Join Roots Miners Pro, Uganda's leading Bitcoin ASIC mining platform! Register with my link to get a 5,000 UGX Welcome Bonus and start earning daily mining income: ${inviteLink}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(inviteLink)}&text=${encodeURIComponent(shareMessage)}`;
    window.open(url, '_blank');
  };

  // Mock team members list for user's tree
  const teamMembers = [
    { name: 'Kigozi Ronald', phone: '078****341', level: 'Level 1', joined: 'Yesterday', earnedUGX: 4500 },
    { name: 'Namatovu Sarah', phone: '077****812', level: 'Level 1', joined: '3 days ago', earnedUGX: 9000 },
    { name: 'Ochen Brian', phone: '075****990', level: 'Level 2', joined: '5 days ago', earnedUGX: 6000 },
  ];

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-[#07132a] to-[#040817] shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>5% COMMISSION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              Team &amp; Referrals
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
              Earn 5% commission on deposits made by your invitees.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-black/40 border border-emerald-500/30 self-start sm:self-auto">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Referral Earnings</span>
            <div className="text-xl font-extrabold font-mono text-emerald-400">
              UGX {(currentUser.referralEarnings || 0).toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Invitation Link Card */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#08122c]/90 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Share2 className="w-4 h-4 text-cyan-400" />
            Your Invite Link
          </h2>
          <span className="text-xs font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Code: {currentUser.inviteCode}
          </span>
        </div>

        {/* Link Input & Copy */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            readOnly
            value={inviteLink}
            className="flex-1 px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-slate-200 font-mono text-xs select-all focus:outline-none focus:border-cyan-400"
          />
          <button
            onClick={handleCopy}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-black font-extrabold text-xs hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4 text-black" />}
            {copied ? 'Copied to Clipboard!' : 'Copy Link'}
          </button>
        </div>

        {/* Instant Share Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            onClick={handleWhatsAppShare}
            className="py-3 px-4 rounded-xl bg-green-600/20 border border-green-500/40 hover:bg-green-600/30 text-green-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 text-green-400" />
            Share via WhatsApp
          </button>
          <button
            onClick={handleTelegramShare}
            className="py-3 px-4 rounded-xl bg-sky-600/20 border border-sky-500/40 hover:bg-sky-600/30 text-sky-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Send className="w-4 h-4 text-sky-400" />
            Share via Telegram
          </button>
        </div>
      </div>

      {/* 5% Multi-level System Explanation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-white/10 bg-[#070e24] space-y-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold font-mono text-sm">
            1
          </div>
          <h3 className="text-sm font-bold text-white font-mono">5% Direct Commission</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            When your invitee rents any H or W-Series machine, 5% of their deposit amount is credited instantly to you.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-[#070e24] space-y-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold font-mono text-sm">
            2
          </div>
          <h3 className="text-sm font-bold text-white font-mono">Immediate Disbursal</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Commissions go into your Withdrawable Mining Balance. No waiting period—withdraw right away during operating hours.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-[#070e24] space-y-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono text-sm">
            3
          </div>
          <h3 className="text-sm font-bold text-white font-mono">5,000 UGX Invitee Gift</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your friends automatically receive a 5,000 UGX welcome gift in their account as soon as they sign up with your link.
          </p>
        </div>
      </div>

      {/* Team Member List */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#070e24] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Active Team Members ({teamMembers.length})
          </h2>
          <span className="text-xs text-emerald-400 font-semibold">5% Passive Flow</span>
        </div>

        <div className="space-y-2.5">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-black/30 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center font-mono">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-white">{member.name}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {member.phone} • {member.level} • {member.joined}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-emerald-400 font-mono font-bold">
                  +UGX {member.earnedUGX.toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-500">Commission Earned</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
