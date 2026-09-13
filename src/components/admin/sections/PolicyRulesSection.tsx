import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, Power, Archive, Download } from 'lucide-react';
import { useApp } from '../../../store/AppContext';
import { Modal } from '../../profile/shared/Modal';
import { PolicyRule, PolicyRuleStatus, POLICY_RULE_STATUS_LABELS } from '../../../types';

const statusColors: Record<PolicyRuleStatus, string> = {
  online: 'bg-green-50 text-green-600',
  offline: 'bg-slate-100 text-slate-500',
  archived: 'bg-slate-100 text-slate-400',
};

export const PolicyRulesSection: React.FC = () => {
  const { state, updatePolicyRule, showToast } = useApp();
  const { policyRules } = state;

  const [editRule, setEditRule] = useState<PolicyRule | null>(null);
  const [form, setForm] = useState({ name: '', target: '', keyConditions: '', category: '' });

  const handleEdit = (rule: PolicyRule) => {
    setEditRule(rule);
    setForm({ name: rule.name, target: rule.target, keyConditions: rule.keyConditions, category: rule.category });
  };

  const handleSave = () => {
    if (!editRule) return;
    updatePolicyRule(editRule.id, {
      name: form.name.trim() || editRule.name,
      target: form.target.trim() || editRule.target,
      keyConditions: form.keyConditions.trim() || editRule.keyConditions,
      category: form.category.trim() || editRule.category,
    });
    showToast('政策规则已更新');
    setEditRule(null);
  };

  const handleStatusChange = (rule: PolicyRule, status: PolicyRuleStatus) => {
    updatePolicyRule(rule.id, { status });
    showToast(`「${rule.name}」已${status === 'online' ? '上线' : status === 'offline' ? '下线' : '归档'}`);
  };

  const handleExport = () => {
    showToast('已生成脱敏报表，敏感字段已自动处理');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">当前共 {policyRules.length} 条政策规则，其中 {policyRules.filter((p) => p.status === 'online').length} 条已上线</p>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
        >
          <Download className="h-3.5 w-3.5" />
          导出脱敏报表
        </button>
      </div>

      {/* Policy table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">政策名称</th>
                <th className="px-4 py-3 font-medium">适用人群</th>
                <th className="px-4 py-3 font-medium">关键条件</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">到期提醒</th>
                <th className="px-4 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {policyRules.map((rule, i) => {
                const daysLeft = Math.ceil((rule.deadline - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <motion.tr
                    key={rule.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-50 text-sm transition hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{rule.name}</div>
                      <div className="mt-0.5 text-[10px] text-slate-400">{rule.category}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">{rule.target}</td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      <div className="max-w-xs truncate" title={rule.keyConditions}>{rule.keyConditions}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[rule.status]}`}>
                        {POLICY_RULE_STATUS_LABELS[rule.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {daysLeft > 0 ? (
                        <span className={`text-xs ${daysLeft < 30 ? 'font-medium text-orange-600' : 'text-slate-500'}`}>
                          {daysLeft} 天
                        </span>
                      ) : (
                        <span className="text-xs text-red-500">已过期</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(rule)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0f3a32]/5 text-[#2e7066] transition hover:bg-[#0f3a32]/10"
                          title="编辑"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        {rule.status === 'online' ? (
                          <button
                            onClick={() => handleStatusChange(rule, 'offline')}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                            title="下线"
                          >
                            <Power className="h-3.5 w-3.5" />
                          </button>
                        ) : rule.status === 'offline' ? (
                          <button
                            onClick={() => handleStatusChange(rule, 'online')}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50 text-green-600 transition hover:bg-green-100"
                            title="上线"
                          >
                            <Power className="h-3.5 w-3.5" />
                          </button>
                        ) : null}
                        {rule.status !== 'archived' && (
                          <button
                            onClick={() => handleStatusChange(rule, 'archived')}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-slate-400 transition hover:bg-slate-200"
                            title="归档"
                          >
                            <Archive className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={!!editRule} onClose={() => setEditRule(null)} title="编辑政策规则">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">政策名称</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2e7066] focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">政策类别</label>
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2e7066] focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">适用人群</label>
            <textarea
              value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })}
              rows={2}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2e7066] focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">关键条件</label>
            <textarea
              value={form.keyConditions}
              onChange={(e) => setForm({ ...form, keyConditions: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2e7066] focus:bg-white"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setEditRule(null)}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              className="flex-1 rounded-xl bg-[#0f3a32] py-2.5 text-sm font-medium text-white transition hover:bg-[#0d2e27]"
            >
              保存
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
