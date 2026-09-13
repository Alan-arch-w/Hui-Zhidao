import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Cpu, Home, AlertCircle, Download, TrendingUp } from 'lucide-react';
import { useApp } from '../../../store/AppContext';

export const DataBoardSection: React.FC = () => {
  const { state, showToast } = useApp();
  const { adminTalents, serviceOrders, policyRules } = state;

  const totalTalents = adminTalents.length;
  const pendingCount = adminTalents.filter((t) => t.status === 'pending').length;
  const aiCount = adminTalents.filter((t) => t.industry.includes('AI') || t.industry.includes('科技')).length;
  const digitalCount = adminTalents.filter((t) => t.industry.includes('数字')).length;
  const rentInterest = adminTalents.filter((t) => t.policyInterest.includes('租房')).length;
  const gapCount = adminTalents.filter((t) => t.status === 'material_needed').length;
  const approvedCount = adminTalents.filter((t) => t.status === 'approved' || t.status === 'contacted' || t.status === 'completed').length;
  const completedOrders = serviceOrders.filter((o) => o.status === 'completed').length;
  const onlinePolicies = policyRules.filter((p) => p.status === 'online').length;

  const stats = [
    { label: '入库人才总数', value: totalTalents, icon: Users, color: '#0f3a32', suffix: '人' },
    { label: '待审核人数', value: pendingCount, icon: UserCheck, color: '#c8a96e', suffix: '人' },
    { label: 'AI/数字经济人才', value: aiCount + digitalCount, icon: Cpu, color: '#2e7066', suffix: '人' },
    { label: '关注租房补贴', value: rentInterest, icon: Home, color: '#3b82f6', suffix: '人' },
    { label: '待跟进人才', value: gapCount, icon: AlertCircle, color: '#f59e0b', suffix: '人' },
    { label: '已完成工单', value: completedOrders, icon: TrendingUp, color: '#10b981', suffix: '单' },
  ];

  // Industry distribution
  const industryMap: Record<string, number> = {};
  adminTalents.forEach((t) => {
    industryMap[t.industry] = (industryMap[t.industry] || 0) + 1;
  });
  const industries = Object.entries(industryMap).sort((a, b) => b[1] - a[1]);
  const maxIndustry = Math.max(...industries.map((i) => i[1]), 1);

  // Status distribution
  const statusMap: Record<string, number> = {};
  adminTalents.forEach((t) => {
    statusMap[t.status] = (statusMap[t.status] || 0) + 1;
  });

  const statusLabels: Record<string, string> = {
    pending: '待审核',
    approved: '已入库',
    material_needed: '材料待补充',
    contacted: '已联系',
    completed: '已完成服务',
  };
  const statusColors: Record<string, string> = {
    pending: '#f59e0b',
    approved: '#10b981',
    material_needed: '#f97316',
    contacted: '#3b82f6',
    completed: '#64748b',
  };

  return (
    <div className="space-y-5">
      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-4"
          >
            <div
              className="mb-2 flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${s.color}15` }}
            >
              <s.icon className="h-4 w-4" style={{ color: s.color }} />
            </div>
            <div className="text-2xl font-bold text-slate-800">
              {s.value}
              <span className="ml-1 text-xs font-normal text-slate-400">{s.suffix}</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-500">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Industry distribution */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5"
        >
          <h3 className="mb-4 text-sm font-semibold text-slate-800">人才行业分布</h3>
          <div className="space-y-3">
            {industries.map(([name, count]) => (
              <div key={name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-slate-600">{name}</span>
                  <span className="font-medium text-slate-800">{count} 人</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / maxIndustry) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="h-full rounded-full bg-[#0f3a32]"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Status distribution */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5"
        >
          <h3 className="mb-4 text-sm font-semibold text-slate-800">入库状态分布</h3>
          <div className="space-y-3">
            {Object.entries(statusMap).map(([status, count]) => (
              <div key={status}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: statusColors[status] }} />
                    {statusLabels[status]}
                  </span>
                  <span className="font-medium text-slate-800">{count} 人</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / totalTalents) * 100}%` }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: statusColors[status] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Summary row */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-6">
            <div>
              <div className="text-2xl font-bold text-[#0f3a32]">{approvedCount}</div>
              <div className="text-xs text-slate-500">已入库人才</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#2e7066]">{onlinePolicies}</div>
              <div className="text-xs text-slate-500">在线政策数</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#c8a96e]">{Math.round((completedOrders / serviceOrders.length) * 100) || 0}%</div>
              <div className="text-xs text-slate-500">工单完成率</div>
            </div>
          </div>
          <button
            onClick={() => showToast('已生成脱敏报表，敏感字段已自动处理')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            导出数据看板
          </button>
        </div>
      </motion.div>
    </div>
  );
};
