import React from 'react';
import { Pickaxe, Cpu, Users, UserCheck, ShieldCheck, Lock } from 'lucide-react';
import { User } from '../types';

interface BottomNavProps {
  currentUser?: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentUser, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Pickaxe },
    { id: 'miners', label: 'Miners', icon: Cpu },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'profile', label: 'Profile', icon: UserCheck },
  ];

  if (currentUser?.role === 'super-admin') {
    navItems.push({ id: 'super-admin', label: 'Admin', icon: Lock });
  } else if (currentUser?.role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin', icon: ShieldCheck });
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#070b1c]/95 border-t border-cyan-500/20 backdrop-blur-lg px-2 py-1.5 safe-area-inset-bottom">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'text-amber-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-transform ${
                  isActive ? 'bg-amber-500/20 scale-110' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
