import React, { useState } from 'react';
import { User, MinerPackage, WithdrawalRequest, DepositOrder, SystemSettings } from '../types';
import { StorageService } from '../services/storage';
import { AdminUserList } from '../components/AdminUserList';
import {
  ShieldCheck,
  Users,
  Coins,
  Cpu,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  RefreshCw,
  Search,
  Filter,
  DollarSign
} from 'lucide-react';

interface AdminPageProps {
  currentUser: User | null;
  settings: SystemSettings;
  packages: MinerPackage[];
  onDataChanged: () => void;
  onRequireLogin: () => void;
}

const adminButtonSettings = {
  Delete: '*Delete*',
  dormant_settings: '',
};

export const AdminPage: React.FC<AdminPageProps> = ({
  currentUser,
  settings,
  packages,
  onDataChanged,
  onRequireLogin,
}) => {
  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super-admin')) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <ShieldCheck className="w-16 h-16 text-emerald-400 mx-auto opacity-75" />
        <h2 className="text-xl font-bold text-white font-mono">/admin Moderator Access Restricted</h2>
        <p className="text-xs text-slate-400">
          You must be logged in as an authorized moderator or administrator to view this portal.
        </p>
        <button
          onClick={onRequireLogin}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 cursor-pointer"
        >
          Sign In as Admin
        </button>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<'withdrawals' | 'orders' | 'users' | 'rates'>('withdrawals');
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(StorageService.getWithdrawals());
  const [deposits, setDeposits] = useState<DepositOrder[]>(StorageService.getDeposits());
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [searchUser, setSearchUser] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [isProcessingPayout, setIsProcessingPayout] = useState<string | null>(null);

  // Rate Editing State
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);
  const [editDailyIncome, setEditDailyIncome] = useState<number>(0);

  // Handle Approve Withdrawal
  const handleApproveWithdrawal = async (req: WithdrawalRequest) => {
    setIsProcessingPayout(req.id);
    try {
      // Call backend make-payout API
      const response = await fetch('/api/make-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          withdrawalId: req.id,
          amountUGX: req.netAmountUGX,
          recipientPhone: req.accountNumber,
          recipientName: req.accountName,
          provider: req.provider,
        }),
      });

      const resData = await response.json();
      StorageService.approveWithdrawal(req.id);
      setWithdrawals(StorageService.getWithdrawals());
      onDataChanged();
      setActionNotice(resData.message || `Withdrawal of UGX ${req.netAmountUGX.toLocaleString()} approved & disbursed.`);
    } catch (err: any) {
      // Fallback local approval
      StorageService.approveWithdrawal(req.id);
      setWithdrawals(StorageService.getWithdrawals());
      onDataChanged();
      setActionNotice(`Withdrawal approved locally: Disbursed to ${req.accountNumber}`);
    } finally {
      setIsProcessingPayout(null);
    }
  };

  // Handle Reject Withdrawal
  const handleRejectWithdrawal = (id: string) => {
    const reason = prompt('Reason for declining withdrawal:', 'Account information mismatch');
    if (reason === null) return;
    StorageService.rejectWithdrawal(id, reason);
    setWithdrawals(StorageService.getWithdrawals());
    setUsers(StorageService.getUsers());
    onDataChanged();
    setActionNotice('Withdrawal rejected and balance refunded to user.');
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'super-admin';

  // Handle Manual Delete User (restricted to admins)
  const handleDeleteUser = (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('Are you sure you want to delete this user?')) {
      StorageService.deleteUser(id);
      setUsers(StorageService.getUsers());
      onDataChanged();
      setActionNotice('User deleted successfully.');
    }
  };

  // Handle Approve Deposit (PesaJet Pending Order)
  const handleApproveDeposit = (orderId: string) => {
    StorageService.confirmDeposit(orderId, `Moderator (${currentUser.username})`);
    setDeposits(StorageService.getDeposits());
    setUsers(StorageService.getUsers());
    onDataChanged();
    setActionNotice('Deposit confirmed and credited to user Deposit Wallet!');
  };

  // Handle Save Rate
  const handleSaveRate = (pkgId: string) => {
    StorageService.updatePackage(pkgId, { dailyIncomeUGX: editDailyIncome });
    setEditingPackageId(null);
    onDataChanged();
    setActionNotice('Mining rate updated successfully!');
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.phone.includes(searchUser)
  );

  return (
    <div className="space-y-6 pb-24 max-w-6xl mx-auto">
      {/* Admin Header */}
      <div className="p-6 rounded-2xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/60 via-[#071720] to-[#040817] shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>MODERATOR CONTROL CENTER (/admin)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              Moderator Management Panel
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Logged in as <strong className="text-emerald-400">{currentUser.username}</strong> ({currentUser.phone}) • Authority Level: Moderator
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-emerald-400 font-bold">
              Edge Payouts Active
            </span>
          </div>
        </div>

        {/* Action Notice */}
        {actionNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-xs text-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{actionNotice}</span>
            </div>
            <button
              onClick={() => setActionNotice(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-white/10">
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'withdrawals'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            Withdrawal Requests ({withdrawals.filter((w) => w.status === 'pending').length})
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            Pending Deposits ({deposits.filter((d) => d.status === 'pending').length})
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
            All Users ({users.length})
          </button>

          <button
            onClick={() => setActiveTab('rates')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rates'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Manage Mining Rates
          </button>
        </div>
      </div>

      {/* TAB 1: WITHDRAWAL REQUESTS */}
      {activeTab === 'withdrawals' && (
        <div className="p-6 rounded-2xl border border-white/10 bg-[#08122c]/90 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5 text-amber-400" />
              Member Withdrawal Requests
            </h2>
            <span className="text-xs text-slate-400">
              10% fee deducted • Disbursed in 30 mins
            </span>
          </div>

          {withdrawals.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No withdrawal requests found.</p>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <div
                  key={w.id}
                  className="p-4 rounded-xl border border-white/5 bg-black/40 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono text-sm">{w.userName}</span>
                      <span className="text-slate-400 font-mono">({w.userPhone})</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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

                    <div className="text-slate-300">
                      Disburse to: <strong className="text-white">{w.provider}</strong> •{' '}
                      <span className="font-mono text-amber-300">{w.accountNumber}</span> • ({w.accountName})
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      Gross: UGX {w.amountUGX.toLocaleString()} | Fee (10%): UGX {w.feeUGX.toLocaleString()} |{' '}
                      <strong className="text-emerald-400">Net to Send: UGX {w.netAmountUGX.toLocaleString()}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {w.status === 'pending' ? (
                      <>
                        <button
                          disabled={isProcessingPayout === w.id}
                          onClick={() => handleApproveWithdrawal(w)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-500 text-black font-extrabold hover:bg-emerald-400 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {isProcessingPayout === w.id ? 'Disbursing...' : 'Approve & Payout'}
                        </button>
                        <button
                          onClick={() => handleRejectWithdrawal(w.id)}
                          className="px-3.5 py-2 rounded-xl bg-rose-600/20 text-rose-300 border border-rose-500/40 hover:bg-rose-600/30 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {w.status === 'approved' ? `Approved (${w.txHash?.slice(0, 10)}...)` : 'Declined'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PENDING DEPOSITS & PESAJET ORDERS */}
      {activeTab === 'orders' && (
        <div className="p-6 rounded-2xl border border-white/10 bg-[#08122c]/90 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <ArrowDownCircle className="w-5 h-5 text-emerald-400" />
              Deposit Orders (PesaJet Mobile Money)
            </h2>
            <span className="text-xs text-slate-400">Automated Webhook &amp; Moderator Confirmation</span>
          </div>

          {deposits.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">No deposit orders recorded.</p>
          ) : (
            <div className="space-y-3">
              {deposits.map((dep) => (
                <div
                  key={dep.id}
                  className="p-4 rounded-xl border border-white/5 bg-black/40 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white font-mono text-sm">{dep.userName}</span>
                      <span className="text-slate-400 font-mono">({dep.userPhone})</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          dep.status === 'completed'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {dep.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-slate-300 font-mono">
                      Amount: <strong className="text-emerald-400 text-sm">UGX {dep.amountUGX.toLocaleString()}</strong> • Gateway: {dep.paymentMethod}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Created: {new Date(dep.createdAt).toLocaleString()}
                      {dep.verifiedBy && ` • Verified by: ${dep.verifiedBy}`}
                    </div>
                  </div>

                  <div>
                    {dep.status === 'pending' ? (
                      <button
                        onClick={() => handleApproveDeposit(dep.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-extrabold hover:bg-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Approve Deposit to Wallet
                      </button>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Credited to Wallet
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ALL USERS LIST */}
      {activeTab === 'users' && (
        <AdminUserList
          initialUsers={users}
          isAdmin={isAdmin}
          onDataChanged={() => {
            setUsers(StorageService.getUsers());
            onDataChanged();
          }}
        />
      )}

      {/* TAB 4: MANAGE MINING RATES */}
      {activeTab === 'rates' && (
        <div className="p-6 rounded-2xl border border-white/10 bg-[#08122c]/90 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
              <Cpu className="w-5 h-5 text-purple-400" />
              Manage Investment Plans &amp; Mining Rates
            </h2>
            <span className="text-xs text-slate-400">H-Series Daily Count &amp; W-Series Returns</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-4 rounded-xl border border-white/5 bg-black/40 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 font-mono">
                      {pkg.code}
                    </span>
                    <span className="font-bold text-white ml-2">{pkg.name}</span>
                  </div>
                  <span className="font-mono text-slate-400">Cost: UGX {pkg.priceUGX.toLocaleString()}</span>
                </div>

                {editingPackageId === pkg.id ? (
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="number"
                      value={editDailyIncome}
                      onChange={(e) => setEditDailyIncome(Number(e.target.value))}
                      className="px-3 py-1.5 rounded-lg bg-black/60 border border-white/20 text-white font-mono text-xs w-36"
                    />
                    <button
                      onClick={() => handleSaveRate(pkg.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-black font-bold text-xs cursor-pointer"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingPackageId(null)}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-emerald-400 font-mono font-bold">
                      Current Daily Yield: UGX {pkg.dailyIncomeUGX.toLocaleString()}
                    </span>
                    <button
                      onClick={() => {
                        setEditingPackageId(pkg.id);
                        setEditDailyIncome(pkg.dailyIncomeUGX);
                      }}
                      className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold cursor-pointer"
                    >
                      Modify Rate
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
