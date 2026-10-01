import React, { useState } from 'react';
import { User, SystemSettings } from '../types';
import { StorageService } from '../services/storage';
import {
  Pickaxe,
  Lock,
  Phone,
  User as UserIcon,
  AlertCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface LoginPageProps {
  initialTab?: 'login' | 'register';
  initialRef?: string;
  settings: SystemSettings;
  onLoginSuccess: (user: User) => void;
  onGoToHome?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  initialTab = 'login',
  initialRef = '',
  settings,
  onLoginSuccess,
  onGoToHome,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>(
    initialTab === 'register' ? 'register' : 'login'
  );

  // Form states
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [inviteCode, setInviteCode] = useState(initialRef);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Normal Universal Login Handler (For all users, admins, and owner)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const user = StorageService.getUserByPhone(phone);
      if (!user) {
        setErrorMessage('No account found with this phone number. Please check or create an account.');
        return;
      }

      if (user.password && user.password !== password) {
        setErrorMessage('Incorrect password. Please try again.');
        return;
      }

      if (user.isBanned) {
        setErrorMessage('This account has been suspended by the administrator.');
        return;
      }

      StorageService.setCurrentUser(user);
      onLoginSuccess(user);
    }, 350);
  };

  // User Register Handler
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      const existing = StorageService.getUserByPhone(phone);
      if (existing) {
        setErrorMessage('An account with this phone number already exists. Please sign in.');
        return;
      }

      const cleanPhone = phone.trim();
      const code = 'ROO' + Math.random().toString(36).substring(2, 6).toUpperCase();

      const newUser: User = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        username: username.trim() || 'Miner_' + cleanPhone.slice(-4),
        phone: cleanPhone,
        password,
        role: 'user',
        depositWallet: 0,
        miningBalance: 0,
        totalDeposited: 0,
        totalWithdrawn: 0,
        inviteCode: code,
        referredBy: inviteCode.trim() || undefined,
        referralEarnings: 0,
        isBanned: false,
        createdAt: new Date().toISOString(),
      };

      const users = StorageService.getUsers();
      users.push(newUser);
      StorageService.saveUsers(users);

      StorageService.setCurrentUser(newUser);
      setSuccessMessage('Account created successfully! Loading your console...');
      setTimeout(() => {
        onLoginSuccess(newUser);
      }, 700);
    }, 450);
  };

  return (
    <div className="max-w-md w-full mx-auto py-8 px-4 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div
          onClick={onGoToHome || undefined}
          className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-xl shadow-amber-500/20 transition-transform ${
            onGoToHome ? 'cursor-pointer hover:scale-105' : ''
          }`}
        >
          <div className="w-full h-full bg-[#070c20] rounded-[14px] flex items-center justify-center">
            <Pickaxe className="w-7 h-7 text-amber-400" />
          </div>
        </div>
        <h1 className="text-2xl font-black text-white font-mono tracking-tight">
          ROOTS<span className="text-amber-400">MINERS</span> PRO
        </h1>
        <p className="text-xs text-cyan-400 font-semibold tracking-wider uppercase">
          Uganda Bitcoin Cloud Hashrate Fleet
        </p>
      </div>

      {/* Navigation Tabs (Only Sign In and Create Account) */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-black/60 rounded-xl border border-white/10 text-xs font-bold">
        <button
          onClick={() => {
            setTab('login');
            setErrorMessage('');
            setSuccessMessage('');
          }}
          className={`py-2.5 rounded-lg transition-colors cursor-pointer ${
            tab === 'login' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => {
            setTab('register');
            setErrorMessage('');
            setSuccessMessage('');
          }}
          className={`py-2.5 rounded-lg transition-colors cursor-pointer ${
            tab === 'register' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
          }`}
        >
          Create Account
        </button>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl border border-rose-500/40 bg-rose-950/60 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* SIGN IN TAB */}
      {tab === 'login' && (
        <form onSubmit={handleLogin} className="p-6 rounded-2xl border border-white/10 bg-[#08122c]/90 space-y-4 shadow-xl">
          <div className="text-center pb-2">
            <h2 className="text-base font-bold text-white font-mono">Sign In with Phone Number</h2>
            <p className="text-xs text-slate-400">Enter your registered mobile number and password</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Phone Number
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="e.g. 0772 123456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In to Account'}
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </form>
      )}

      {/* CREATE ACCOUNT (REGISTER) TAB */}
      {tab === 'register' && (
        <form onSubmit={handleRegister} className="p-6 rounded-2xl border border-white/10 bg-[#08122c]/90 space-y-4 shadow-xl">
          <div className="text-center pb-2">
            <h2 className="text-base font-bold text-white font-mono">Create Roots Miners Account</h2>
            <p className="text-xs text-slate-400">Register with your Uganda phone number</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Username
            </label>
            <input
              type="text"
              placeholder="e.g. MinerKing"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Phone Number (MTN / Airtel)
            </label>
            <input
              type="text"
              placeholder="e.g. 0787 493168"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Min 6 chars"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Confirm
              </label>
              <input
                type="password"
                placeholder="Re-type"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Invitation Code <span className="text-slate-500 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. ADMINPRO"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs font-mono uppercase focus:outline-none focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs hover:brightness-110 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </form>
      )}
    </div>
  );
};
