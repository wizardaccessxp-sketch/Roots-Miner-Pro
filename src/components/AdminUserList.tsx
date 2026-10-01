import React, { useState } from 'react';
import { User } from '../types';
import { StorageService } from '../services/storage';
import { Users, Search } from 'lucide-react';

const settings = {
  Delete: '*Delete*',
  dormant_settings: '',
};

interface AdminUserListProps {
  initialUsers?: User[];
  isAdmin?: boolean;
  onDataChanged?: () => void;
}

export const AdminUserList: React.FC<AdminUserListProps> = ({
  initialUsers,
  isAdmin = true,
  onDataChanged,
}) => {
  const [users, setUsers] = useState<User[]>(() => initialUsers || StorageService.getUsers());
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers((prev) => prev.filter((user) => user.id !== id));
      StorageService.deleteUser(id);
      if (onDataChanged) {
        onDataChanged();
      }
    }
  };

  const handleClearAllToZero = () => {
    if (window.confirm('Are you sure you want to clear all account balances to 0?')) {
      StorageService.clearAllAccountsToZero();
      setUsers(StorageService.getUsers());
      if (onDataChanged) {
        onDataChanged();
      }
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery)
  );

  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-[#08122c]/90 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
          <Users className="w-5 h-5 text-cyan-400" />
          Member Directory &amp; Balances
        </h2>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <button
              onClick={handleClearAllToZero}
              className="px-3 py-1.5 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/40 hover:bg-rose-600/30 text-xs font-bold cursor-pointer transition-colors"
              title="Reset all account balances to 0"
            >
              Clear All Accounts to 0
            </button>
          )}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search phone or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-slate-400 uppercase font-mono text-[10px]">
              <th className="py-2.5 px-3">User</th>
              <th className="py-2.5 px-3">Role</th>
              <th className="py-2.5 px-3">Deposit Wallet</th>
              <th className="py-2.5 px-3">Mining Balance</th>
              <th className="py-2.5 px-3">Total Deposited</th>
              <th className="py-2.5 px-3">Withdrawn</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredUsers.map((u) => (
              <tr key={u.id} className="hover:bg-white/[0.02]">
                <td className="py-3 px-3">
                  <div className="font-bold text-white">{u.username}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{u.phone}</div>
                </td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 text-slate-300">
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-3 font-mono text-cyan-300 font-bold">
                  UGX {u.depositWallet.toLocaleString()}
                </td>
                <td className="py-3 px-3 font-mono text-amber-300 font-bold">
                  UGX {u.miningBalance.toLocaleString()}
                </td>
                <td className="py-3 px-3 font-mono text-slate-300">
                  UGX {(u.totalDeposited || 0).toLocaleString()}
                </td>
                <td className="py-3 px-3 font-mono text-slate-400">
                  UGX {(u.totalWithdrawn || 0).toLocaleString()}
                </td>
                <td className="py-3 px-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      u.isBanned ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {u.isBanned ? 'BANNED' : 'ACTIVE'}
                  </span>
                </td>
                <td className="py-3 px-3 text-right">
                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/40 hover:bg-rose-600/30 font-bold text-xs cursor-pointer transition-colors"
                      title="Delete user"
                    >
                      {settings['Delete']}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUserList;
