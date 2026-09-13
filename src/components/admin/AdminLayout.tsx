import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Landmark,
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { ADMIN_ROLE_LABELS } from '../../types';

export type AdminSection = 'dashboard' | 'talents' | 'policies' | 'orders' | 'databoard' | 'audit';

interface AdminLayoutProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  children: React.ReactNode;
}

const navItems: { key: AdminSection; label: string; icon: React.ElementType }[] = [
  { key: 'dashboard', label: '待办工作台', icon: LayoutDashboard },
  { key: 'talents', label: '人才库管理', icon: Users },
  { key: 'policies', label: '政策规则管理', icon: FileText },
  { key: 'orders', label: '服务工单管理', icon: ClipboardList },
  { key: 'databoard', label: '数据看板', icon: BarChart3 },
  { key: 'audit', label: '权限与审计', icon: ShieldCheck },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ activeSection, onSectionChange, children }) => {
  const { state, adminLogout, goHome } = useApp();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(false);

  const currentLabel = navItems.find((n) => n.key === activeSection)?.label || '';
  const adminUser = state.adminUser;

  const handleNavClick = (section: AdminSection) => {
    onSectionChange(section);
    setMobileNavOpen(false);
  };

  const SidebarContent = () => (
    <>
      {/* Logo area */}
      <div className={`flex items-center gap-2 border-b border-white/10 px-4 py-4 ${navCollapsed ? 'justify-center' : ''}`}>
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10">
          <Landmark className="h-4 w-4 text-[#c8a96e]" />
        </div>
        {!navCollapsed && (
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-white">汇知道</div>
            <div className="text-[10px] text-white/50">管理后台</div>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3">
        {navItems.map((item) => {
          const active = activeSection === item.key;
          return (
            <button
              key={item.key}
              onClick={() => handleNavClick(item.key)}
              className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition ${
                navCollapsed ? 'justify-center' : ''
              } ${
                active
                  ? 'bg-white/10 font-medium text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white/90'
              }`}
              title={navCollapsed ? item.label : undefined}
            >
              <item.icon className={`h-4 w-4 flex-shrink-0 ${active ? 'text-[#c8a96e]' : ''}`} />
              {!navCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom: user info + logout */}
      <div className="border-t border-white/10 p-3">
        {!navCollapsed && adminUser && (
          <div className="mb-2 rounded-lg bg-white/5 px-3 py-2">
            <div className="text-xs font-medium text-white">{adminUser.name}</div>
            <div className="text-[10px] text-white/50">{adminUser.department}</div>
          </div>
        )}
        <div className={`flex gap-2 ${navCollapsed ? 'flex-col' : ''}`}>
          <button
            onClick={goHome}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/60 transition hover:bg-white/5 hover:text-white ${
              navCollapsed ? 'justify-center' : 'flex-1'
            }`}
            title="返回首页"
          >
            <ChevronLeft className="h-3.5 w-3.5 flex-shrink-0" />
            {!navCollapsed && '返回首页'}
          </button>
          <button
            onClick={adminLogout}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-white/60 transition hover:bg-white/5 hover:text-white ${
              navCollapsed ? 'justify-center' : 'flex-1'
            }`}
            title="退出登录"
          >
            <LogOut className="h-3.5 w-3.5 flex-shrink-0" />
            {!navCollapsed && '退出登录'}
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f6f2]">
      {/* Desktop sidebar */}
      <aside
        className={`hidden flex-col bg-[#0f3a32] transition-all duration-300 md:flex ${
          navCollapsed ? 'w-16' : 'w-56'
        }`}
      >
        <SidebarContent />
        <button
          onClick={() => setNavCollapsed(!navCollapsed)}
          className="flex items-center justify-center border-t border-white/10 py-2 text-xs text-white/40 transition hover:text-white/70"
        >
          {navCollapsed ? <Menu className="h-3.5 w-3.5" /> : '收起菜单'}
        </button>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileNavOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col bg-[#0f3a32] md:hidden"
            >
              <button
                onClick={() => setMobileNavOpen(false)}
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-white/60 hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileNavOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-semibold text-slate-800 md:text-lg">{currentLabel}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 md:flex">
              <ShieldCheck className="h-3.5 w-3.5 text-[#2e7066]" />
              <span className="text-xs font-medium text-slate-600">
                {adminUser ? ADMIN_ROLE_LABELS[adminUser.role] : ''}
              </span>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f3a32]/10">
              <span className="text-xs font-medium text-[#0f3a32]">
                {adminUser?.name.charAt(0) || '管'}
              </span>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
