import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Target,
  Lightbulb,
  MessageSquare,
  Send,
  Download,
} from 'lucide-react';
import { useApp } from '../../../store/AppContext';
import { Modal } from '../../profile/shared/Modal';
import {
  AdminTalent,
  TalentStatus,
  TALENT_STATUS_LABELS,
} from '../../../types';

const statusColors: Record<TalentStatus, string> = {
  pending: 'bg-amber-50 text-amber-600',
  approved: 'bg-green-50 text-green-600',
  material_needed: 'bg-orange-50 text-orange-600',
  contacted: 'bg-blue-50 text-blue-600',
  completed: 'bg-slate-100 text-slate-500',
};

const allStatuses: TalentStatus[] = ['pending', 'approved', 'material_needed', 'contacted', 'completed'];
const talentTypes = ['高层次人才', '领军人才', '青年科技创新人才', '青年人才'];
const industries = ['AI / 科技创新', '生物医药', '数字经济', '集成电路'];
const educations = ['博士', '硕士', '本科'];

export const TalentPoolSection: React.FC = () => {
  const { state, updateTalentStatus, addFollowUp, showToast } = useApp();
  const { adminTalents } = state;

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [filterEdu, setFilterEdu] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [detailTalent, setDetailTalent] = useState<AdminTalent | null>(null);
  const [followUpText, setFollowUpText] = useState('');

  const filtered = useMemo(() => {
    return adminTalents.filter((t) => {
      if (search && !t.name.includes(search) && !t.talentType.includes(search)) return false;
      if (filterType && t.talentType !== filterType) return false;
      if (filterIndustry && t.industry !== filterIndustry) return false;
      if (filterEdu && t.education !== filterEdu) return false;
      if (filterStatus && t.status !== filterStatus) return false;
      return true;
    });
  }, [adminTalents, search, filterType, filterIndustry, filterEdu, filterStatus]);

  const handleStatusChange = (talent: AdminTalent, status: TalentStatus) => {
    updateTalentStatus(talent.id, status, `状态变更为：${TALENT_STATUS_LABELS[status]}`);
    showToast(`${talent.name} 状态已更新为「${TALENT_STATUS_LABELS[status]}」`);
    setDetailTalent({ ...talent, status });
  };

  const handleAddFollowUp = () => {
    if (!detailTalent || !followUpText.trim()) return;
    addFollowUp(detailTalent.id, followUpText.trim());
    setFollowUpText('');
    showToast('跟进记录已添加');
    // Update local detail
    const updated = adminTalents.find((t) => t.id === detailTalent.id);
    if (updated) setDetailTalent(updated);
  };

  const handleExport = () => {
    showToast('已生成脱敏报表，敏感字段已自动处理');
  };

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索姓名或人才类型"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-[#2e7066] focus:bg-white"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#2e7066]"
          >
            <option value="">全部人才类型</option>
            {talentTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select
            value={filterIndustry}
            onChange={(e) => setFilterIndustry(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#2e7066]"
          >
            <option value="">全部行业方向</option>
            {industries.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
          <select
            value={filterEdu}
            onChange={(e) => setFilterEdu(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#2e7066]"
          >
            <option value="">全部学历</option>
            {educations.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#2e7066]"
          >
            <option value="">全部状态</option>
            {allStatuses.map((s) => (
              <option key={s} value={s}>{TALENT_STATUS_LABELS[s]}</option>
            ))}
          </select>
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5" />
            导出脱敏报表
          </button>
        </div>
        <div className="mt-2 text-xs text-slate-400">
          共 {filtered.length} 条记录
        </div>
      </div>

      {/* Talent table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-xs text-slate-500">
                <th className="px-4 py-3 font-medium">姓名</th>
                <th className="px-4 py-3 font-medium">年龄</th>
                <th className="px-4 py-3 font-medium">学历</th>
                <th className="px-4 py-3 font-medium">行业方向</th>
                <th className="px-4 py-3 font-medium">人才类型</th>
                <th className="px-4 py-3 font-medium">政策关注</th>
                <th className="px-4 py-3 font-medium">匹配度</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-slate-50 text-sm transition hover:bg-slate-50/50"
                >
                  <td className="px-4 py-3 font-medium text-slate-800">{t.name}</td>
                  <td className="px-4 py-3 text-slate-600">{t.age}</td>
                  <td className="px-4 py-3 text-slate-600">{t.education}</td>
                  <td className="px-4 py-3 text-slate-600">{t.industry}</td>
                  <td className="px-4 py-3 text-slate-600">{t.talentType}</td>
                  <td className="px-4 py-3 text-slate-600">{t.policyInterest}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${t.matchScore >= 85 ? 'text-[#2e7066]' : t.matchScore >= 70 ? 'text-[#c8a96e]' : 'text-slate-500'}`}>
                      {t.matchScore}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[t.status]}`}>
                      {TALENT_STATUS_LABELS[t.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setDetailTalent(t)}
                        className="flex h-7 items-center gap-1 rounded-lg bg-[#0f3a32]/5 px-2.5 text-[10px] font-medium text-[#2e7066] transition hover:bg-[#0f3a32]/10"
                      >
                        <Eye className="h-3 w-3" />
                        详情
                      </button>
                      {t.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(t, 'approved')}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50 text-green-600 transition hover:bg-green-100"
                            title="通过审核"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(t, 'material_needed')}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-500 transition hover:bg-orange-100"
                            title="驳回"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">暂无符合条件的人才数据</div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={!!detailTalent}
        onClose={() => {
          setDetailTalent(null);
          setFollowUpText('');
        }}
        title="人才档案详情"
        maxWidth="max-w-2xl"
      >
        {detailTalent && (
          <div className="space-y-5">
            {/* Basic info */}
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <FileText className="h-4 w-4 text-[#2e7066]" />
                  基础信息
                </h4>
                <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${statusColors[detailTalent.status]}`}>
                  {TALENT_STATUS_LABELS[detailTalent.status]}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-3">
                <div><span className="text-slate-400">姓名</span><div className="mt-0.5 font-medium text-slate-700">{detailTalent.name}</div></div>
                <div><span className="text-slate-400">年龄</span><div className="mt-0.5 font-medium text-slate-700">{detailTalent.age} 岁</div></div>
                <div><span className="text-slate-400">学历</span><div className="mt-0.5 font-medium text-slate-700">{detailTalent.education}</div></div>
                <div><span className="text-slate-400">专业</span><div className="mt-0.5 font-medium text-slate-700">{detailTalent.major}</div></div>
                <div><span className="text-slate-400">行业</span><div className="mt-0.5 font-medium text-slate-700">{detailTalent.industry}</div></div>
                <div><span className="text-slate-400">人才类型</span><div className="mt-0.5 font-medium text-slate-700">{detailTalent.talentType}</div></div>
                <div><span className="text-slate-400">当前职位</span><div className="mt-0.5 font-medium text-slate-700">{detailTalent.currentRole}</div></div>
                <div><span className="text-slate-400">工作区域</span><div className="mt-0.5 font-medium text-slate-700">{detailTalent.workArea}</div></div>
                <div><span className="text-slate-400">政策关注</span><div className="mt-0.5 font-medium text-slate-700">{detailTalent.policyInterest}</div></div>
              </div>
            </div>

            {/* AI talent portrait */}
            <div className="rounded-xl border border-[#2e7066]/20 bg-[#0f3a32]/5 p-4">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Target className="h-4 w-4 text-[#2e7066]" />
                AI 人才画像
              </h4>
              <p className="text-xs leading-relaxed text-slate-600">{detailTalent.highlights}</p>
            </div>

            {/* Resume summary */}
            <div className="rounded-xl bg-slate-50 p-4">
              <h4 className="mb-2 text-sm font-semibold text-slate-800">简历摘要</h4>
              <p className="text-xs leading-relaxed text-slate-600">{detailTalent.resumeSummary}</p>
            </div>

            {/* Match results */}
            <div className="rounded-xl border border-slate-200 p-4">
              <h4 className="mb-3 text-sm font-semibold text-slate-800">政策匹配结果</h4>
              <div className="space-y-2">
                {detailTalent.matchResults.map((m, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-xs text-slate-700">{m.policyName}</span>
                    <span className={`text-xs font-medium ${m.matchScore >= 85 ? 'text-[#2e7066]' : m.matchScore >= 70 ? 'text-[#c8a96e]' : 'text-slate-500'}`}>
                      {m.matchScore}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Material gaps */}
            {detailTalent.materialGaps.length > 0 && (
              <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4">
                <h4 className="mb-2 text-sm font-semibold text-orange-700">材料缺口</h4>
                <div className="flex flex-wrap gap-2">
                  {detailTalent.materialGaps.map((g, i) => (
                    <span key={i} className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-medium text-orange-700">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AI suggestion */}
            <div className="rounded-xl border border-[#c8a96e]/30 bg-[#c8a96e]/5 p-4">
              <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <Lightbulb className="h-4 w-4 text-[#c8a96e]" />
                AI 建议
              </h4>
              <p className="text-xs leading-relaxed text-slate-600">{detailTalent.aiSuggestion}</p>
            </div>

            {/* Status change */}
            <div className="rounded-xl border border-slate-200 p-4">
              <h4 className="mb-3 text-sm font-semibold text-slate-800">修改状态</h4>
              <div className="flex flex-wrap gap-2">
                {allStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(detailTalent, s)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                      detailTalent.status === s
                        ? 'bg-[#0f3a32] text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {TALENT_STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Follow-up records */}
            <div className="rounded-xl border border-slate-200 p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800">
                <MessageSquare className="h-4 w-4 text-slate-400" />
                跟进记录
              </h4>
              <div className="mb-3 space-y-2">
                {detailTalent.followUpRecords.length === 0 ? (
                  <div className="py-2 text-center text-xs text-slate-400">暂无跟进记录</div>
                ) : (
                  detailTalent.followUpRecords.map((r, i) => (
                    <div key={i} className="rounded-lg bg-slate-50 px-3 py-2">
                      <div className="text-xs text-slate-700">{r.content}</div>
                      <div className="mt-1 text-[10px] text-slate-400">
                        {r.operator} · {new Date(r.time).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={followUpText}
                  onChange={(e) => setFollowUpText(e.target.value)}
                  placeholder="添加跟进记录..."
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#2e7066] focus:bg-white"
                />
                <button
                  onClick={handleAddFollowUp}
                  disabled={!followUpText.trim()}
                  className="flex items-center gap-1 rounded-xl bg-[#0f3a32] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#0d2e27] disabled:opacity-50"
                >
                  <Send className="h-3 w-3" />
                  添加
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
