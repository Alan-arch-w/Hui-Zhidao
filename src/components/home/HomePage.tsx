import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Briefcase, ArrowRight, FileText, Landmark, Settings } from 'lucide-react';
import { POLICIES } from '../../data/policies';
import { useApp } from '../../store/AppContext';

const stats = [
  { label: '已收录政策', value: '10+', icon: FileText, suffix: '条' },
  { label: '累计服务人才', value: '1,280', icon: Users, suffix: '人' },
  { label: '成功对接项目', value: '86', icon: Briefcase, suffix: '项' },
];

export const HomePage: React.FC = () => {
  const { enterApp, adminLogin } = useApp();
  const [account, setAccount] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!account.trim() || !code.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      enterApp();
    }, 600);
  };

  const handleAdminEntry = () => {
    adminLogin({
      role: 'super_admin',
      name: '超级管理员',
      department: '区人才局综合管理科',
    });
  };

  const marqueePolicies = useMemo(() => {
    const items = POLICIES.filter((p) => !['P006', 'P009'].includes(p.id));
    return [...items, ...items];
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f6f2]">
      {/* Admin entry button — top right */}
      <button
        onClick={handleAdminEntry}
        className="fixed right-4 top-4 z-50 flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-white/25 md:right-6 md:top-6"
      >
        <Settings className="h-3.5 w-3.5" />
        管理后台
      </button>

      {/* Hero / login — takes 2/3 on desktop, natural flow on mobile */}
      <section className="relative flex min-h-[60vh] flex-col justify-center overflow-hidden bg-gradient-to-br from-[#0f3a32] to-[#1a4f47] px-6 py-10 text-white md:min-h-[66vh] md:px-12 md:py-14">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/[0.04] md:h-96 md:w-96" />
        <div className="pointer-events-none -bottom-18 absolute left-1/3 h-64 w-64 rounded-full bg-white/[0.04] md:-bottom-24 md:h-80 md:w-80" />

        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 lg:flex-row lg:justify-between">
          {/* Left: branding + stats */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-xl lg:pr-8"
          >
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm md:h-12 md:w-12">
                <Landmark className="h-6 w-6 text-[#c8a96e] md:h-7 md:w-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">汇知道</h1>
                <p className="text-xs text-white/70 md:text-sm">徐汇区人才政策服务助手</p>
              </div>
            </div>

            <h2 className="mb-4 text-3xl font-semibold leading-tight md:text-4xl">
              人才政策，一键可查
            </h2>
            <p className="mb-8 max-w-lg text-sm leading-relaxed text-white/80 md:text-base">
              汇聚徐汇区稳就业、人才租房、创业扶持、储备人才等多类政策，通过简历解析与智能问答，快速匹配适合你的申报路径。
            </p>

            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm md:p-4"
                >
                  <div className="mb-2 flex items-center gap-1.5 text-[#c8a96e] md:gap-2">
                    <s.icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="text-[10px] font-medium md:text-xs">{s.label}</span>
                  </div>
                  <div className="text-xl font-bold md:text-2xl">
                    {s.value}
                    <span className="ml-1 text-xs font-normal text-white/70">{s.suffix}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: login card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="w-full max-w-sm"
          >
            <div className="rounded-2xl bg-white p-6 text-slate-800 shadow-2xl md:rounded-3xl md:p-8">
              <div className="mb-5 flex items-center gap-2 md:mb-6">
                <Shield className="h-5 w-5 text-[#2e7066]" />
                <h3 className="text-base font-semibold md:text-lg">欢迎登录</h3>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">
                    手机号 / 邮箱
                  </label>
                  <input
                    type="text"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder="请输入手机号或邮箱"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#2e7066] focus:bg-white focus:ring-2 focus:ring-[#2e7066]/10"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-500">
                    验证码
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="请输入验证码"
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#2e7066] focus:bg-white focus:ring-2 focus:ring-[#2e7066]/10"
                    />
                    <button
                      type="button"
                      className="rounded-xl border border-slate-200 px-4 py-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      获取验证码
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !account.trim() || !code.trim()}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f3a32] py-3 text-sm font-medium text-white transition hover:bg-[#0d2e27] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? '登录中…' : '登录'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-5 text-center md:mt-6">
                <button
                  onClick={enterApp}
                  className="text-xs font-medium text-slate-400 underline-offset-4 transition hover:text-[#2e7066] hover:underline"
                >
                  暂不登录，游客体验
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Policy preview — takes 1/3 on desktop */}
      <section className="flex flex-1 flex-col justify-center overflow-hidden px-6 py-8 md:py-10">
        <div className="mx-auto mb-5 w-full max-w-6xl md:mb-6">
          <div className="flex items-end justify-between">
            <h3 className="text-lg font-semibold text-slate-800 md:text-xl">政策速览</h3>
          </div>
        </div>

        <div className="relative w-full overflow-hidden">
          {/* Fade masks — hidden on small screens to avoid clipping perception */}
          <div className="pointer-events-none absolute left-0 top-0 z-10 hidden h-full w-16 bg-gradient-to-r from-[#f7f6f2] to-transparent md:block lg:w-24" />
          <div className="pointer-events-none absolute right-0 top-0 z-10 hidden h-full w-16 bg-gradient-to-l from-[#f7f6f2] to-transparent md:block lg:w-24" />

          <div className="animate-marquee flex w-max gap-4 hover:[animation-play-state:paused] md:gap-5">
            {marqueePolicies.map((policy, i) => (
              <div
                key={`${policy.id}-${i}`}
                className="w-72 flex-shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md md:w-80 md:p-5"
              >
                <span className="mb-3 inline-flex rounded-full bg-[#0f3a32]/5 px-2.5 py-1 text-[10px] font-medium text-[#2e7066]">
                  {policy.category}
                </span>
                <h4 className="mb-2 line-clamp-2 text-sm font-semibold text-slate-800">
                  {policy.name}
                </h4>
                <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                  {policy.benefit}
                </p>
                <div className="mt-3 flex items-center gap-1 text-[10px] font-medium text-[#c8a96e]">
                  <span className="h-1 w-1 rounded-full bg-[#c8a96e]" />
                  {policy.validPeriod}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-6 py-4 md:py-5">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-2 text-xs text-slate-400 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <Landmark className="h-4 w-4" />
            <span>徐汇区人才服务官方平台</span>
          </div>
          <span>数据仅供参考，具体以政策主管部门解释为准</span>
        </div>
      </footer>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 48s linear infinite;
        }
      `}</style>
    </div>
  );
};
