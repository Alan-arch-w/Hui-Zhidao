import React from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  FolderKanban,
  Heart,
  TrendingUp,
  CalendarDays,
  Lock,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { ProfileSection } from '../../types';

interface NavItem {
  key: ProfileSection;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { key: 'matches', label: '我的匹配记录', icon: <ClipboardList className="h-4 w-4" /> },
  { key: 'credentials', label: '我的电子资质档案夹', icon: <FolderKanban className="h-4 w-4" /> },
  { key: 'favorites', label: '政策收藏与订阅', icon: <Heart className="h-4 w-4" /> },
  { key: 'growth', label: '我的成长规划台账', icon: <TrendingUp className="h-4 w-4" /> },
  { key: 'services', label: '线下服务与活动', icon: <CalendarDays className="h-4 w-4" /> },
  { key: 'privacy', label: '隐私与账号管理', icon: <Lock className="h-4 w-4" /> },
];

export const ProfileNav: React.FC = () => {
  const { state, setProfileSection } = useApp();
  const { profileSection } = state;

  return (
    <nav className="flex w-full gap-1 overflow-x-auto border-b border-slate-100 bg-white px-2 py-2 md:w-56 md:flex-col md:overflow-visible md:border-b-0 md:border-r md:border-slate-100 md:bg-transparent md:px-0 md:py-4">
      {navItems.map((item) => {
        const active = profileSection === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setProfileSection(item.key)}
            className={`group relative flex flex-shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition md:w-full md:px-4 ${
              active
                ? 'bg-[#0f3a32] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
            }`}
          >
            {active && (
              <motion.span
                layoutId="profile-nav-active"
                className="absolute inset-0 rounded-xl bg-[#0f3a32] md:bg-transparent"
              />
            )}
            <span className="relative z-10">{item.icon}</span>
            <span className="relative z-10 text-xs font-medium md:text-sm">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
