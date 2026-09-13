import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Landmark, Shield, ArrowRight, AlertCircle } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { AdminRole, ADMIN_ROLE_LABELS } from '../../types';

const roleConfig: { role: AdminRole; desc: string; account: string }[] = [
  { role: 'super_admin', desc: '全量数据权限，管理政策规则与人才库', account: 'admin' },
  { role: 'reviewer', desc: '审核入库申请，管理人才档案与匹配', account: 'reviewer' },
  { role: 'specialist', desc: '处理工单与预约，跟进人才服务', account: 'specialist' },
];

export const AdminLogin: React.FC = () => {
  const { adminLogin, goHome } = useApp();
  const [selectedRole, setSelectedRole] = useState<AdminRole>('super_admin');
  const [account, setAccount] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRoleSelect = (role: AdminRole) => {
    setSelectedRole(role);
    const cfg = roleConfig.find((r) => r.role === role)!;
    setAccount(cfg.account);
    setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cfg = roleConfig.find((r) => r.role === selectedRole)!;
    if (account.trim() !== cfg.account || !password.trim()) {
      setError('账号或密码不正确，请检查后重试');
      return;
    }
    adminLogin({
      role: selectedRole,
      name: ADMIN_ROLE_LABELS[selectedRole],
      department: selectedRole === 'super_admin' ? '区人才局综合管理科' : selectedRole === 'reviewer' ? '人才服务科' : '科创园区服务点',
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#0f3a32]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 md:px-10">
        <div className="flex items-center gap-2 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
            <Landmark className="h-5 w-5 text-[#c8a96e]" />
          </div>
          <div>
            <span className="text-sm font-bold">汇知道</span>
            <span className="ml-2 text-xs text-white/60">管理后台</span>
          </div>
        </div>
        <button
          onClick={goHome}
          className="text-xs font-medium text-white/70 underline-offset-4 transition hover:text-white hover:underline"
        >
          返回首页
        </button>
      </div>

      {/* Login card */}
      <div className="flex flex-1 items-center justify-center px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl md:p-8"
        >
          <div className="mb-6 flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#2e7066]" />
            <h2 className="text-lg font-semibold text-slate-800">管理后台登录</h2>
          </div>

          {/* Role selection */}
          <div className="mb-5 space-y-2">
            <label className="block text-xs font-medium text-slate-500">选择角色</label>
            {roleConfig.map((r) => (
              <button
                key={r.role}
                onClick={() => handleRoleSelect(r.role)}
                className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${
                  selectedRole === r.role
                    ? 'border-[#2e7066] bg-[#0f3a32]/5'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div
                  className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                    selectedRole === r.role ? 'bg-[#0f3a32] text-white' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-800">{ADMIN_ROLE_LABELS[r.role]}</div>
                  <div className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{r.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">管理员账号</label>
              <input
                type="text"
                value={account}
                onChange={(e) => {
                  setAccount(e.target.value);
                  setError('');
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2e7066] focus:bg-white focus:ring-2 focus:ring-[#2e7066]/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="演示模式：任意密码即可登录"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2e7066] focus:bg-white focus:ring-2 focus:ring-[#2e7066]/10"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f3a32] py-3 text-sm font-medium text-white transition hover:bg-[#0d2e27]"
            >
              登录管理后台
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-center text-[10px] text-slate-400">
            演示环境，选择角色后输入任意密码即可登录
          </div>
        </motion.div>
      </div>

      <footer className="px-6 py-4 text-center text-xs text-white/40">
        徐汇区人才服务管理后台 · 政务数据安全受控访问
      </footer>
    </div>
  );
};
