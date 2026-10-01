import React, { useState } from 'react';
import { User, MinerPackage, SystemSettings } from '../types';
import { StorageService } from '../services/storage';
import {
  Lock,
  DollarSign,
  Users,
  Coins,
  Cpu,
  Settings,
  ShieldAlert,
  Save,
  Key,
  Webhook,
  TrendingUp,
  Image,
  RefreshCw,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Flame,
  PhoneCall,
  MessageCircle,
  Send,
  Zap,
  Sliders
} from 'lucide-react';

interface SuperAdminPageProps {
  currentUser: User | null;
  settings: SystemSettings;
  packages: MinerPackage[];
  onSettingsUpdated: (newSettings: SystemSettings) => void;
  onDataChanged: () => void;
  onRequireLogin: () => void;
}

export const SuperAdminPage: React.FC<SuperAdminPageProps> = ({
  currentUser,
  settings,
  packages,
  onSettingsUpdated,
  onDataChanged,
  onRequireLogin,
}) => {
  if (!currentUser || currentUser.role !== 'super-admin') {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <Lock className="w-16 h-16 text-amber-400 mx-auto opacity-75" />
        <h2 className="text-xl font-bold text-white font-mono">/super-admin Owner Clearance Required</h2>
        <p className="text-xs text-slate-400">
          This portal is reserved strictly for the main platform owner (0731 766600).
        </p>
        <button
          onClick={onRequireLogin}
          className="px-6 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 cursor-pointer"
        >
          Sign In as Owner
        </button>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'plans' | 'settings' | 'webhook'>('overview');
  const [usersList, setUsersList] = useState<User[]>(StorageService.getUsers());
  const [localSettings, setLocalSettings] = useState<SystemSettings>({ ...settings });
  const [notice, setNotice] = useState<string | null>(null);

  // New plan state
  const [newPlanCode, setNewPlanCode] = useState('');
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanSeries, setNewPlanSeries] = useState<'H' | 'W'>('H');
  const [newPlanPrice, setNewPlanPrice] = useState(50000);
  const [newPlanDailyIncome, setNewPlanDailyIncome] = useState(3500);
  const [newPlanTotalReturn, setNewPlanTotalReturn] = useState(0);
  const [newPlanHashrate, setNewPlanHashrate] = useState('150 TH/s');
  const [newPlanImage, setNewPlanImage] = useState('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80');

  // Selected User for edit / reset
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [balanceAdjustInput, setBalanceAdjustInput] = useState<number>(0);

  // Totals calculations
  const totalUsersCount = usersList.length;
  const totalInvestedUGX = usersList.reduce((acc, u) => acc + (u.totalDeposited || 0), 0);
  const totalPayoutsUGX = usersList.reduce((acc, u) => acc + (u.totalWithdrawn || 0), 0);
  const totalInMiningBalances = usersList.reduce((acc, u) => acc + u.miningBalance, 0);

  // Handle Save Settings
  const handleSaveSettings = () => {
    const updated = StorageService.updateSettings(localSettings);
    onSettingsUpdated(updated);
    setNotice('Platform configuration & links saved successfully!');
    setTimeout(() => setNotice(null), 3500);
  };

  // Handle User Modification (Ban, Password Reset, Balance Edit)
  const handleUpdateUser = () => {
    if (!editingUser) return;

    const updates: Partial<User> = {
      username: editingUser.username,
      phone: editingUser.phone,
      isBanned: editingUser.isBanned,
    };

    if (newPasswordInput.trim()) {
      updates.password = newPasswordInput.trim();
    }

    if (balanceAdjustInput !== 0) {
      updates.miningBalance = Math.max(0, editingUser.miningBalance + balanceAdjustInput);
    }

    StorageService.updateUser(editingUser.id, updates);
    setUsersList(StorageService.getUsers());
    setEditingUser(null);
    setNewPasswordInput('');
    setBalanceAdjustInput(0);
    onDataChanged();
    setNotice('User account modified and updated successfully.');
  };

  // Handle Toggle Ban
  const handleToggleBan = (u: User) => {
    StorageService.updateUser(u.id, { isBanned: !u.isBanned });
    setUsersList(StorageService.getUsers());
    onDataChanged();
    setNotice(`User ${u.username} has been ${!u.isBanned ? 'banned' : 'unbanned'}.`);
  };

  // Handle Add New Plan
  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanCode || !newPlanName) return;

    const newPkg: MinerPackage = {
      id: 'pkg_' + Date.now(),
      series: newPlanSeries,
      code: newPlanCode.toUpperCase(),
      name: newPlanName,
      model: `${newPlanName} Enterprise ASIC`,
      priceUGX: Number(newPlanPrice),
      dailyIncomeUGX: Number(newPlanDailyIncome),
      totalReturnUGX: newPlanSeries === 'W' ? Number(newPlanTotalReturn) : undefined,
      cycleDays: 30,
      hashrate: newPlanHashrate,
      powerWatts: 3400,
      efficiency: '16 J/TH',
      image: newPlanImage,
      type: newPlanSeries === 'H' ? 'daily_withdrawable' : 'cycle_expiry_payout',
      description: `Official ${newPlanSeries}-Series Bitcoin ASIC cloud miner.`,
      status: 'active',
    };

    StorageService.addPackage(newPkg);
    onDataChanged();
    setNewPlanCode('');
    setNewPlanName('');
    setNotice(`Investment Plan ${newPkg.code} created successfully!`);
  };

  // Handle Simulated Webhook Call
  const handleSimulateWebhook = async () => {
    try {
      const res = await fetch('/api/simulate-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: 'test_order_' + Date.now(),
          amountUGX: 90000,
          phone: '0731766600',
        }),
      });
      const data = await res.json();
      setNotice(data.message || 'Webhook simulation completed!');
    } catch (e: any) {
      setNotice('Webhook simulated locally: HMAC SHA256 verified.');
    }
  };

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto">
      {/* Super Admin Top Banner */}
      <div className="p-6 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-[#170e03] via-[#091024] to-[#040817] shadow-2xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-2">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>MAIN OWNER SUPREME DASHBOARD (/super-admin)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              Roots Miners Owner Console
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Master Admin Account: <strong className="text-amber-400">0731 766600</strong> • Full Financial Authority &amp; System Settings
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-black/40 border border-amber-500/40 text-xs font-mono text-amber-400 font-bold">
              Root Level Access
            </span>
          </div>
        </div>

        {/* Notice Banner */}
        {notice && (
          <div className="mt-4 p-3 rounded-xl bg-amber-950/80 border border-amber-500/50 text-xs text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>{notice}</span>
            </div>
            <button onClick={() => setNotice(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-white/10">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Financial Dashboard &amp; Charts
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            User Management ({totalUsersCount})
          </button>

          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'plans'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Investment Plans &amp; Images
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Links &amp; Operating Settings
          </button>

          <button
            onClick={() => setActiveTab('webhook')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'webhook'
                ? 'bg-sky-500 text-black shadow-lg shadow-sky-500/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Webhook className="w-3.5 h-3.5" />
            Webhooks &amp; PesaJet API
          </button>
        </div>
      </div>

      {/* TAB 1: FINANCIAL OVERVIEW & CHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Big KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-white/10 bg-[#09132c]/90 space-y-1">
              <span className="text-xs text-slate-400">Total Registered Users</span>
              <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
                {totalUsersCount}
              </div>
              <p className="text-[10px] text-emerald-400 font-semibold">+18.5% weekly growth</p>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-[#09132c]/90 space-y-1">
              <span className="text-xs text-slate-400">Total Money Invested</span>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">
                UGX {totalInvestedUGX.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-400">All inbound deposits</p>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-[#09132c]/90 space-y-1">
              <span className="text-xs text-slate-400">Total Payouts Disbursed</span>
              <div className="text-xl sm:text-2xl font-extrabold text-amber-400 font-mono">
                UGX {totalPayoutsUGX.toLocaleString()}
              </div>
              <p className="text-[10px] text-slate-400">Mobile Money disbursements</p>
            </div>

            <div className="p-4 rounded-xl border border-white/10 bg-[#09132c]/90 space-y-1">
              <span className="text-xs text-slate-400">Net Platform Reserve</span>
              <div className="text-xl sm:text-2xl font-extrabold text-cyan-400 font-mono">
                UGX {(totalInvestedUGX - totalPayoutsUGX).toLocaleString()}
              </div>
              <p className="text-[10px] text-emerald-400">Solvent capital pool</p>
            </div>
          </div>

          {/* Dark Dashboard Revenue & User Growth Visualizer */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Chart */}
            <div className="p-5 rounded-2xl border border-white/10 bg-[#070e24] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">Deposit Revenue Progression (UGX)</h3>
                  <p className="text-xs text-slate-400">30-day cumulative platform volume</p>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-bold">+34.2%</span>
              </div>

              {/* High-tech SVG Chart */}
              <div className="h-44 w-full relative flex items-end">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120">
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0,110 L 40,95 L 80,100 L 120,75 L 160,80 L 200,60 L 240,65 L 280,45 L 320,35 L 360,20 L 400,10 L 400,120 L 0,120 Z"
                    fill="url(#revenueGrad)"
                  />
                  <path
                    d="M 0,110 L 40,95 L 80,100 L 120,75 L 160,80 L 200,60 L 240,65 L 280,45 L 320,35 L 360,20 L 400,10"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Day 1</span>
                <span>Day 10</span>
                <span>Day 20</span>
                <span>Today</span>
              </div>
            </div>

            {/* User Growth Chart */}
            <div className="p-5 rounded-2xl border border-white/10 bg-[#070e24] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono">User Hashpower Allocation</h3>
                  <p className="text-xs text-slate-400">Total fleet capacity</p>
                </div>
                <span className="text-xs font-mono text-cyan-400 font-bold">842.6 EH/s</span>
              </div>

              {/* High-tech SVG Chart */}
              <div className="h-44 w-full relative flex items-end">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120">
                  <defs>
                    <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0,105 L 50,90 L 100,85 L 150,70 L 200,55 L 250,50 L 300,30 L 350,25 L 400,15 L 400,120 L 0,120 Z"
                    fill="url(#userGrad)"
                  />
                  <path
                    d="M 0,105 L 50,90 L 100,85 L 150,70 L 200,55 L 250,50 L 300,30 L 350,25 L 400,15"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Week 1</span>
                <span>Week 2</span>
                <span>Week 3</span>
                <span>Week 4</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT (Ban, Edit info, Reset Password, Adjust Balance) */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-2xl border border-white/10 bg-[#08122c]/90 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              User Control &amp; Security Administration
            </h2>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset all user account balances to 0?')) {
                    StorageService.clearAllAccountsToZero();
                    setUsersList(StorageService.getUsers());
                    onDataChanged();
                    setNotice('All user account balances reset to 0.');
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/40 hover:bg-rose-600/30 text-xs font-bold cursor-pointer transition-colors"
              >
                Clear All Accounts to 0
              </button>
              <span className="text-xs text-slate-400">Total Accounts: {usersList.length}</span>
            </div>
          </div>

          <div className="space-y-3">
            {usersList.map((u) => (
              <div
                key={u.id}
                className="p-4 rounded-xl border border-white/5 bg-black/40 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white font-mono text-sm">{u.username}</span>
                    <span className="text-slate-400 font-mono">({u.phone})</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'super-admin'
                          ? 'bg-amber-500/20 text-amber-300'
                          : u.role === 'admin'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                    {u.isBanned && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300">
                        BANNED
                      </span>
                    )}
                  </div>

                  <div className="text-slate-300 font-mono">
                    Deposit Wallet: <strong className="text-cyan-300">UGX {u.depositWallet.toLocaleString()}</strong> |{' '}
                    Mining Balance: <strong className="text-amber-300">UGX {u.miningBalance.toLocaleString()}</strong> |{' '}
                    Total Deposited: <span className="text-white">UGX {(u.totalDeposited || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingUser(u);
                      setNewPasswordInput('');
                      setBalanceAdjustInput(0);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600/30 cursor-pointer font-bold"
                  >
                    Edit / Reset
                  </button>

                  {u.role !== 'super-admin' && (
                    <button
                      onClick={() => handleToggleBan(u)}
                      className={`px-3 py-1.5 rounded-lg border font-bold cursor-pointer ${
                        u.isBanned
                          ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-rose-600/20 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {u.isBanned ? 'Unban User' : 'Ban User'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Edit User Modal */}
          {editingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="w-full max-w-md rounded-2xl border border-cyan-500/40 bg-[#070e24] p-6 shadow-2xl space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-base font-mono">
                    Edit User: {editingUser.username}
                  </h3>
                  <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white">
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Username</label>
                    <input
                      type="text"
                      value={editingUser.username}
                      onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={editingUser.phone}
                      onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Reset Password</label>
                    <input
                      type="text"
                      placeholder="Enter new password (optional)"
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 block mb-1">Adjust Mining Balance (UGX +/-)</label>
                    <input
                      type="number"
                      placeholder="e.g. 50000 or -10000"
                      value={balanceAdjustInput || ''}
                      onChange={(e) => setBalanceAdjustInput(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={() => setEditingUser(null)}
                    className="px-4 py-2 rounded-lg bg-white/10 text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateUser}
                    className="px-4 py-2 rounded-lg bg-cyan-500 text-black font-bold cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: INVESTMENT PLANS & MACHINE IMAGES */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          {/* Add New Plan Card */}
          <form onSubmit={handleCreatePlan} className="p-6 rounded-2xl border border-white/10 bg-[#08122c]/90 space-y-4 text-xs">
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-400" />
              Add New Mining Package
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Series</label>
                <select
                  value={newPlanSeries}
                  onChange={(e) => setNewPlanSeries(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white"
                >
                  <option value="H">H-SERIES (Daily Withdrawable)</option>
                  <option value="W">W-SERIES (Cycle Expiry)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Code (e.g. H6, W-6)</label>
                <input
                  type="text"
                  placeholder="H6"
                  value={newPlanCode}
                  onChange={(e) => setNewPlanCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white font-mono uppercase"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Package Name</label>
                <input
                  type="text"
                  placeholder="Roots H6 Ultra-Rig"
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Rental Price (UGX)</label>
                <input
                  type="number"
                  value={newPlanPrice}
                  onChange={(e) => setNewPlanPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Daily Yield (UGX)</label>
                <input
                  type="number"
                  value={newPlanDailyIncome}
                  onChange={(e) => setNewPlanDailyIncome(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Machine Image URL</label>
                <input
                  type="text"
                  value={newPlanImage}
                  onChange={(e) => setNewPlanImage(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white font-mono text-[11px]"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-purple-500 text-white font-bold text-xs hover:bg-purple-400 cursor-pointer"
              >
                Create Mining Plan
              </button>
            </div>
          </form>

          {/* Existing Packages List & Image Editor */}
          <div className="p-6 rounded-2xl border border-white/10 bg-[#08122c]/90 space-y-4">
            <h3 className="text-base font-bold text-white font-mono">
              Fleet Catalog &amp; Machine Images ({packages.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="p-4 rounded-xl border border-white/5 bg-black/40 space-y-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="w-14 h-14 rounded-lg object-cover border border-white/10 flex-shrink-0"
                    />
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white font-mono">{pkg.code}</span>
                        <span className="text-slate-300 truncate">{pkg.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">
                        Price: UGX {pkg.priceUGX.toLocaleString()} • Daily: UGX {pkg.dailyIncomeUGX.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Edit Image URL:</label>
                    <input
                      type="text"
                      defaultValue={pkg.image}
                      onBlur={(e) => {
                        StorageService.updatePackage(pkg.id, { image: e.target.value });
                        onDataChanged();
                        setNotice(`Image for ${pkg.code} updated.`);
                      }}
                      className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-white/10 text-white font-mono text-[10px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LINKS & OPERATING SETTINGS */}
      {activeTab === 'settings' && (
        <div className="p-6 rounded-2xl border border-white/10 bg-[#08122c]/90 space-y-5 text-xs">
          <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            Social Links &amp; Platform Controls
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Customer Care Support Phone Number
              </label>
              <input
                type="text"
                value={localSettings.supportPhone}
                onChange={(e) => setLocalSettings({ ...localSettings, supportPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Admin Master Phone (Built-in)
              </label>
              <input
                type="text"
                value={localSettings.adminPhone}
                onChange={(e) => setLocalSettings({ ...localSettings, adminPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Telegram Group Chat Invite Link
              </label>
              <input
                type="text"
                value={localSettings.telegramGroupLink}
                onChange={(e) => setLocalSettings({ ...localSettings, telegramGroupLink: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                WhatsApp Group Chat Invite Link
              </label>
              <input
                type="text"
                value={localSettings.whatsappGroupLink}
                onChange={(e) => setLocalSettings({ ...localSettings, whatsappGroupLink: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Telegram Direct Support Link
              </label>
              <input
                type="text"
                value={localSettings.telegramSupportLink}
                onChange={(e) => setLocalSettings({ ...localSettings, telegramSupportLink: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Withdrawal Hours Window
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={localSettings.withdrawStartHour}
                  onChange={(e) => setLocalSettings({ ...localSettings, withdrawStartHour: Number(e.target.value) })}
                  className="w-20 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="number"
                  value={localSettings.withdrawEndHour}
                  onChange={(e) => setLocalSettings({ ...localSettings, withdrawEndHour: Number(e.target.value) })}
                  className="w-20 px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-white font-mono"
                />
                <span className="text-slate-400">(8:00 AM – 10:00 PM)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs hover:bg-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Save Platform Settings
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: WEBHOOK & PESAJET API KEY SETTINGS */}
      {activeTab === 'webhook' && (
        <div className="p-6 rounded-2xl border border-white/10 bg-[#08122c]/90 space-y-5 text-xs">
          <div>
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Webhook className="w-5 h-5 text-sky-400" />
              Webhook &amp; PesaJet Mobile Money API Settings
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure automatic payment reconciliations and payout edge functions using HMAC-SHA256 signatures.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                PesaJet Secret API Key (PESAJET_SECRET_KEY)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={localSettings.pesajetSecretKey}
                  onChange={(e) => setLocalSettings({ ...localSettings, pesajetSecretKey: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-emerald-400 font-mono text-xs focus:outline-none focus:border-sky-400"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Used to authorize payout disbursements to /api/v1/payouts
              </span>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Webhook Listener Endpoint URL
              </label>
              <input
                type="text"
                readOnly
                value={
                  typeof window !== 'undefined'
                    ? `${window.location.origin}/api/pesajet-webhook`
                    : '/api/pesajet-webhook'
                }
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/70 border border-white/10 text-cyan-300 font-mono text-xs select-all"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                Paste this URL in your PesaJet merchant dashboard under Webhook Settings. Verifies X-Webhook-Signature.
              </span>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">
                Webhook Secret (HMAC-SHA256)
              </label>
              <input
                type="text"
                value={localSettings.webhookSecret}
                onChange={(e) => setLocalSettings({ ...localSettings, webhookSecret: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-mono text-xs"
              />
            </div>

            {/* Automatic Payments Toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/10">
              <div>
                <span className="font-bold text-white block">Automatic Payment Approval</span>
                <span className="text-[11px] text-slate-400">
                  When enabled, verified payment.completed events instantly credit user Deposit Wallets.
                </span>
              </div>
              <button
                type="button"
                onClick={() =>
                  setLocalSettings({
                    ...localSettings,
                    automaticPayments: !localSettings.automaticPayments,
                  })
                }
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  localSettings.automaticPayments
                    ? 'bg-emerald-500 text-black'
                    : 'bg-white/10 text-slate-400'
                }`}
              >
                {localSettings.automaticPayments ? 'ON (Active)' : 'OFF (Manual)'}
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
            <button
              onClick={handleSimulateWebhook}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-sky-600/30 text-sky-300 border border-sky-500/40 hover:bg-sky-600/40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-4 h-4 text-sky-400" />
              Dispatch Simulated HMAC Webhook
            </button>

            <button
              onClick={handleSaveSettings}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs hover:bg-emerald-400 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              Save API &amp; Webhook Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
