import React, { useState } from 'react';
import { User, ChatMessage, SystemSettings } from '../types';
import { StorageService } from '../services/storage';
import {
  User as UserIcon,
  Lock,
  Phone,
  CreditCard,
  MessageSquare,
  Send,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Headphones
} from 'lucide-react';

interface ProfilePageProps {
  currentUser: User | null;
  settings: SystemSettings;
  onUserUpdated: (user: User) => void;
  onRequireLogin: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  settings,
  onUserUpdated,
  onRequireLogin,
  onNavigateToTab,
}) => {
  if (!currentUser) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <UserIcon className="w-16 h-16 text-cyan-400 mx-auto opacity-75" />
        <h2 className="text-xl font-bold text-white font-mono">Profile &amp; Customer Support</h2>
        <p className="text-xs text-slate-400">
          Sign in or create an account to edit your credentials, add withdrawal accounts, and access live chat support.
        </p>
        <button
          onClick={onRequireLogin}
          className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Account editing form state
  const [username, setUsername] = useState(currentUser.username);
  const [phone, setPhone] = useState(currentUser.phone);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Withdrawal Account State
  const [provider, setProvider] = useState<'MTN Mobile Money' | 'Airtel Money' | 'Stanbic Bank' | 'Centenary Bank'>(
    currentUser.withdrawalAccount?.provider || 'MTN Mobile Money'
  );
  const [accountNumber, setAccountNumber] = useState(
    currentUser.withdrawalAccount?.accountNumber || currentUser.phone
  );
  const [accountName, setAccountName] = useState(
    currentUser.withdrawalAccount?.accountName || currentUser.username
  );

  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Live Chat System State
  const [messages, setMessages] = useState<ChatMessage[]>(
    StorageService.getChatMessages(currentUser.id)
  );
  const [inputText, setInputText] = useState('');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !phone.trim()) {
      setFeedback({ type: 'error', text: 'Username and phone number cannot be empty.' });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setFeedback({ type: 'error', text: 'New passwords do not match!' });
      return;
    }

    const updates: Partial<User> = {
      username,
      phone,
      withdrawalAccount: {
        provider,
        accountNumber,
        accountName,
      },
    };

    if (newPassword) {
      updates.password = newPassword;
    }

    const updated = StorageService.updateUser(currentUser.id, updates);
    if (updated) {
      onUserUpdated(updated);
      setFeedback({ type: 'success', text: 'Profile & withdrawal details updated successfully!' });
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setFeedback({ type: 'error', text: 'Failed to update profile.' });
    }
  };

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg = StorageService.sendChatMessage(
      currentUser.id,
      currentUser.username,
      text,
      'user'
    );
    setMessages(StorageService.getChatMessages(currentUser.id));
    setInputText('');

    // Automated smart customer service reply
    setTimeout(() => {
      let reply = 'Thank you for reaching out! A customer service officer (+256787 493168) has received your inquiry and will assist you shortly.';
      const lower = text.toLowerCase();

      if (lower.includes('deposit') || lower.includes('mtn') || lower.includes('pesajet')) {
        reply = 'To deposit: Navigate to the Deposit Wallet section and click "Pay - MTN / Airtel Money". Enter your mobile money PIN on your phone to approve. Deposits reflect immediately!';
      } else if (lower.includes('withdraw') || lower.includes('fee')) {
        reply = 'Withdrawals are open daily from 8:00 AM to 10:00 PM with a minimum of 5,000 UGX and a 10% charge. Remember: at least one deposit is required before making a withdrawal (*please join us*).';
      } else if (lower.includes('warmup') || lower.includes('24') || lower.includes('machine')) {
        reply = 'If you rent a machine, it counts after a 24-hour roll up from your rental timestamp. Note that packages do not count weekend days (Mon–Fri only).';
      } else if (lower.includes('referral') || lower.includes('team')) {
        reply = 'You earn a 5% referral bonus on all deposits from members who register with your invitation link. Check your Team page for your link!';
      }

      StorageService.sendChatMessage(
        currentUser.id,
        'Roots Customer Desk (+256787 493168)',
        reply,
        'support'
      );
      setMessages(StorageService.getChatMessages(currentUser.id));
    }, 800);
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-[#07132a] to-[#040817] shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
              <Headphones className="w-3.5 h-3.5 text-cyan-400" />
              <span>ACCOUNT &amp; SUPPORT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              Account &amp; Support
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-lg">
              Manage your profile, withdrawal details, or chat with support.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${settings.supportPhone.replace(/\s/g, '')}`}
              className="px-4 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
              Call {settings.supportPhone}
            </a>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs sm:text-sm font-medium ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        </div>
      )}

      {/* Admin Panel Quick Access (for Admin & Super-Admin accounts) */}
      {(currentUser.role === 'admin' || currentUser.role === 'super-admin') && (
        <div className="p-6 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 via-[#071728] to-[#08122c] space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-white font-mono">Administrator Control Center</h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {currentUser.role}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Your account has administrative clearance. Access member controls, approvals, and system tools below:
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => onNavigateToTab?.('admin')}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs cursor-pointer transition-colors shadow-lg shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                Open Admin Panel
              </button>
              {currentUser.role === 'super-admin' && (
                <button
                  type="button"
                  onClick={() => onNavigateToTab?.('super-admin')}
                  className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer transition-colors shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
                >
                  <Lock className="w-4 h-4" />
                  Owner Master Console
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Form: Edit Username, Password, Phone Number & Add Withdraw Account Details */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#08122c]/90 space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-amber-400" />
            Personal &amp; Withdrawal Information
          </h2>
          <span className="text-xs text-slate-400 font-mono">Role: {currentUser.role}</span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Change Password (leave blank to keep current)
              </label>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Withdraw Account Details Section */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-400" />
              Withdrawal Account Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Provider</label>
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="MTN Mobile Money">MTN Mobile Money</option>
                  <option value="Airtel Money">Airtel Money</option>
                  <option value="Stanbic Bank">Stanbic Bank Uganda</option>
                  <option value="Centenary Bank">Centenary Bank Uganda</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Account Number / Phone</label>
                <input
                  type="text"
                  placeholder="e.g. 0787 493168"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Account Holder Name</label>
                <input
                  type="text"
                  placeholder="Exact Registered SIM Name"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-black font-extrabold text-xs hover:brightness-110 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
            >
              Save Profile &amp; Withdrawal Details
            </button>
          </div>
        </form>
      </div>

      {/* Customer Service Live Chat System (In the same page as requested) */}
      <div className="p-6 rounded-2xl border border-white/10 bg-[#070e24] space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Headphones className="w-5 h-5 text-emerald-400" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Customer Care Centre &amp; Live Chat
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Direct hotline: <a href="tel:+256787493168" className="text-amber-400 hover:underline">+256787 493168</a>
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Agents Online
          </span>
        </div>

        {/* Quick Question Buttons */}
        <div className="flex flex-wrap gap-2 text-[11px]">
          <button
            onClick={() => handleSendMessage('How do I deposit with MTN Mobile Money?')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
          >
            How do I deposit with MTN?
          </button>
          <button
            onClick={() => handleSendMessage('When do machine earnings start counting?')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
          >
            When do machine earnings start?
          </button>
          <button
            onClick={() => handleSendMessage('What are the withdrawal rules and fees?')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
          >
            Withdrawal rules &amp; fees
          </button>
          <button
            onClick={() => handleSendMessage('How does the 5% referral bonus work?')}
            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors cursor-pointer"
          >
            5% Referral bonus info
          </button>
        </div>

        {/* Chat History Box */}
        <div className="h-64 overflow-y-auto space-y-3 p-4 rounded-xl bg-black/40 border border-white/10 text-xs">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                <span className="text-[10px] text-slate-400 mb-0.5">
                  {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div
                  className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
                    isUser
                      ? 'bg-amber-500 text-black font-medium rounded-tr-none'
                      : 'bg-[#121c3b] text-slate-200 border border-cyan-500/30 rounded-tl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Bar */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Type your message to customer service..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={() => handleSendMessage()}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer flex-shrink-0"
          >
            <Send className="w-3.5 h-3.5 text-black" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
