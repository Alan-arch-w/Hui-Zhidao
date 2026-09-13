import React from 'react';
import {
  MessageSquare,
  ClipboardCheck,
  User,
  Library,
  RotateCcw,
  LogOut,
  Landmark,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`group relative flex flex-col items-center justify-center gap-1 transition-colors ${
        active ? 'text-white' : 'text-teal-100/60 hover:text-white'
      }`}
      title={label}
    >
      {active && (
        <span className="absolute left-0 top-1/2 hidden h-8 w-[3px] -translate-y-1/2 rounded-r-full bg-[#c8a96e] md:block" />
      )}
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8 ${
          active ? 'bg-white/10' : 'group-hover:bg-white/10'
        }`}
      >
        {icon}
      </div>
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </button>
  );
};

const MobileNavItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 transition-colors ${
        active ? 'text-[#c8a96e]' : 'text-slate-400 hover:text-slate-600'
      }`}
      title={label}
    >
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
          active ? 'bg-[#0f3a32]/10' : ''
        }`}
      >
        {icon}
      </div>
      <span className="text-[10px] font-medium leading-none">{label}</span>
    </button>
  );
};

export const Sidebar: React.FC = () => {
  const { nav, navigateTo, state, dispatch, goHome, logout } = useApp();

  const handleReset = () => {
    dispatch({ type: 'RESET_ALL' });
    navigateTo('chat');
  };

  const hasResults = state.matchResults.length > 0;

  const navItems = (
    <>
      <SidebarItem
        icon={<MessageSquare className="h-5 w-5" />}
        label="对话"
        active={nav.currentModule === 'chat'}
        onClick={() => navigateTo('chat')}
      />
      <SidebarItem
        icon={<ClipboardCheck className="h-5 w-5" />}
        label="结果"
        active={nav.currentModule === 'results'}
        onClick={() => hasResults && navigateTo('results')}
      />
      <SidebarItem
        icon={<User className="h-5 w-5" />}
        label="个人"
        active={nav.currentModule === 'profile'}
        onClick={() => navigateTo('profile')}
      />
      <SidebarItem
        icon={<Library className="h-5 w-5" />}
        label="政策"
        active={nav.currentModule === 'policies'}
        onClick={() => navigateTo('policies')}
      />
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-full w-16 flex-col items-center bg-[#0f3a32] py-4 md:flex">
        {/* Logo — click to return home */}
        <button
          onClick={goHome}
          className="mb-6 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 shadow-lg transition-colors hover:bg-white/20"
          title="返回首页"
        >
          <Landmark className="h-5 w-5 text-[#c8a96e]" />
        </button>

        {/* Nav items */}
        <nav className="flex flex-1 flex-col gap-1">{navItems}</nav>

        {/* Reset + logout */}
        <div className="flex flex-col items-center gap-2 border-t border-white/10 pt-3">
          <button
            onClick={handleReset}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-teal-100/60 transition-colors hover:bg-white/10 hover:text-white"
            title="重置咨询"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            onClick={logout}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-teal-100/60 transition-colors hover:bg-white/10 hover:text-white"
            title="退出登录"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-14 items-center border-t border-slate-200 bg-white px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:hidden">
        <MobileNavItem
          icon={<Landmark className="h-5 w-5" />}
          label="首页"
          active={false}
          onClick={goHome}
        />
        <MobileNavItem
          icon={<MessageSquare className="h-5 w-5" />}
          label="对话"
          active={nav.currentModule === 'chat'}
          onClick={() => navigateTo('chat')}
        />
        <MobileNavItem
          icon={<ClipboardCheck className="h-5 w-5" />}
          label="结果"
          active={nav.currentModule === 'results'}
          onClick={() => hasResults && navigateTo('results')}
        />
        <MobileNavItem
          icon={<User className="h-5 w-5" />}
          label="个人"
          active={nav.currentModule === 'profile'}
          onClick={() => navigateTo('profile')}
        />
        <MobileNavItem
          icon={<Library className="h-5 w-5" />}
          label="政策"
          active={nav.currentModule === 'policies'}
          onClick={() => navigateTo('policies')}
        />
      </nav>
    </>
  );
};
