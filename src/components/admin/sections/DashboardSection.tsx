import React from 'react';
import { motion } from 'framer-motion';
import {
  UserCheck,
  ClipboardList,
  AlertTriangle,
  UserPlus,
  ArrowRight,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../../store/AppContext';
import { AdminSection } from '../AdminLayout';

interface DashboardSectionProps {
  onNavigate: (section: AdminSection) => void;
}

export const DashboardSection: React.FC<DashboardSectionProps> = ({ onNavigate }) => {
  const { state, updateTalentStatus, showToast } = useApp();
  const { adminTalents, serviceOrders, policyRules } = state;

  const pendingTalents = adminTalents.filter((t) => t.status === 'pending');
  const pendingOrders = serviceOrders.filter((o) => o.status === 'pending');
  const expiringPolicies = policyRules
    .filter((p) => p.status === 'online' && p.deadline - Date.now() < 1000 * 60 * 60 * 24 * 30);
  const gapTalents = adminTalents.filter((t) => t.status === 'material_needed');

  const handleApprove = (id: string, name: string) => {
    updateTalentStatus(id, 'approved', `已通过 ${name} 的入库审核`);
    showToast(`${name} 入库审核已通过`);
  };

  const handleReject = (id: string, name: string) => {
    updateTalentStatus(id, 'material_needed', `${name} 审核未通过，需补充材料`);
    showToast(`${name} 已驳回，标记为材料待补充`);
  };

  const todoCards = [
    {
      title: '待入库审核人才',
      count: pendingTalents.length,
      icon: UserCheck,
      color: '#0f3a32',
      items: pendingTalents.map((t) => ({ id: t.id, name: t.name, desc: `${t.talentType} · 匹配度 ${t.matchScore}%`, actions: 'approve' as const })),
      emptyText: '暂无待审核人才',
    },
    {
      title: '待处理预约工单',
      count: pendingOrders.length,
      icon: ClipboardList,
      color: '#2e7066',
      items: pendingOrders.map((o) => ({ id: o.id, name: o.applicantName, desc: o.content, actions: 'assign' as const })),
      emptyText: '暂无待处理工单',
    },
    {
      title: '政策时效预警',
      count: expiringPolicies.length,
      icon: AlertTriangle,
      color: '#c8a96e',
      items: expiringPolicies.map((p) => ({ id: p.id, name: p.name, desc: `距到期 ${Math.ceil((p.deadline - Date.now()) / (1000 * 60 * 60 * 24))} 天`, actions: 'view' as const })),
      emptyText: '暂无即将到期政策',
    },
    {
      title: '待跟进缺口人才',
      count: gapTalents.length,
      icon: UserPlus,
      color: '#b8860b',
      items: gapTalents.map((t) => ({ id: t.id, name: t.name, desc: `缺少 ${t.materialGaps.length} 项材料`, actions: 'view' as const })),
      emptyText: '暂无缺口人才',
    },
  ];

  const handleCardAction = (cardTitle: string, action: string) => {
    if (action === 'approve') onNavigate('talents');
    else if (action === 'assign') onNavigate('orders');
    else if (action === 'view') {
      if (cardTitle.includes('政策')) onNavigate('policies');
      else onNavigate('talents');
    }
  };

  return (
    <div className="space-y-5">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-br from-[#0f3a32] to-[#1a4f47] p-5 text-white md:p-6"
      >
        <h2 className="text-base font-semibold md:text-lg">待办工作台</h2>
        <p className="mt-1 text-xs text-white/70 md:text-sm">
          今日共有 {pendingTalents.length + pendingOrders.length} 项待处理工作，请及时跟进。
        </p>
      </motion.div>

      {/* Todo cards grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {todoCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${card.color}15` }}
                >
                  <card.icon className="h-4 w-4" style={{ color: card.color }} />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">{card.title}</h3>
              </div>
              <span
                className="flex h-6 min-w-6 items-center justify-center rounded-full px-2 text-xs font-bold text-white"
                style={{ backgroundColor: card.color }}
              >
                {card.count}
              </span>
            </div>

            {card.items.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">{card.emptyText}</div>
            ) : (
              <div className="space-y-2">
                {card.items.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-medium text-slate-700">{item.name}</div>
                      <div className="mt-0.5 truncate text-[11px] text-slate-500">{item.desc}</div>
                    </div>
                    {item.actions === 'approve' && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            const talent = pendingTalents.find((t) => t.id === item.id);
                            if (talent) handleApprove(item.id, talent.name);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50 text-green-600 transition hover:bg-green-100"
                          title="通过"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            const talent = pendingTalents.find((t) => t.id === item.id);
                            if (talent) handleReject(item.id, talent.name);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
                          title="驳回"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                    {item.actions === 'assign' && (
                      <button
                        onClick={() => onNavigate('orders')}
                        className="flex h-7 items-center gap-1 rounded-lg bg-[#0f3a32]/5 px-2.5 text-[10px] font-medium text-[#2e7066] transition hover:bg-[#0f3a32]/10"
                      >
                        分配专员
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                    {item.actions === 'view' && (
                      <button
                        onClick={() => handleCardAction(card.title, 'view')}
                        className="flex h-7 items-center gap-1 rounded-lg bg-[#0f3a32]/5 px-2.5 text-[10px] font-medium text-[#2e7066] transition hover:bg-[#0f3a32]/10"
                      >
                        查看
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
                {card.items.length > 3 && (
                  <button
                    onClick={() => handleCardAction(card.title, card.items[0].actions)}
                    className="flex w-full items-center justify-center gap-1 py-2 text-[11px] font-medium text-[#2e7066] transition hover:text-[#0f3a32]"
                  >
                    查看全部 {card.items.length} 条
                    <ArrowRight className="h-3 w-3" />
                  </button>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Recent activity */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5"
      >
        <h3 className="mb-3 text-sm font-semibold text-slate-800">最近跟进记录</h3>
        <div className="space-y-2">
          {adminTalents
            .flatMap((t) => t.followUpRecords.map((r) => ({ ...r, talentName: t.name })))
            .sort((a, b) => b.time - a.time)
            .slice(0, 5)
            .map((r, i) => (
              <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5">
                <Clock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-slate-700">
                    <span className="font-medium">{r.talentName}</span> · {r.content}
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-400">
                    {r.operator} · {new Date(r.time).toLocaleString('zh-CN')}
                  </div>
                </div>
              </div>
            ))}
          {adminTalents.flatMap((t) => t.followUpRecords).length === 0 && (
            <div className="py-4 text-center text-xs text-slate-400">暂无跟进记录</div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
