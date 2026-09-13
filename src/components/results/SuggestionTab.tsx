import React from 'react';
import { Lightbulb, ArrowRight, FileCheck, Pencil, Target } from 'lucide-react';
import { useApp } from '../../store/AppContext';

export const SuggestionTab: React.FC = () => {
  const { state, navigateTo, showToast } = useApp();

  const topPolicies = state.matchResults.slice(0, 3);

  const supplementInfo = [
    '确认社保连续缴纳月数及基数是否达标',
    '确认用人单位是否符合重点产业导向及经营良好',
    '准备租赁合同或网签备案证明（如申请租房补贴）',
    '整理专利/论文/获奖等成果证明文件',
    '确认海外学历认证（如适用）',
  ];

  const resumeTips = [
    '补充明确的项目成果量化数据（如用户增长、收入规模等）',
    '标注核心技术栈和行业关键词，便于政策匹配',
    '突出与目标政策相关的经历（如创业、海外、重点产业）',
    '完善公司信息，包括成立时间、阶段、融资情况',
  ];

  const nextSteps = [
    { step: '1', action: '优先申报高匹配度政策', detail: '从匹配度最高的政策开始准备材料' },
    { step: '2', action: '补充待确认信息', detail: '联系用人单位确认资质和社保情况' },
    { step: '3', action: '整理申报材料', detail: '按材料清单逐项准备并确认' },
    { step: '4', action: '关注申报时间窗口', detail: '注意各政策的申报截止日期' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">申报建议</h2>

      {/* Priority direction */}
      <div className="rounded-2xl border border-[#c8a96e]/30 bg-[#c8a96e]/5 p-5">
        <div className="mb-3 flex items-center gap-2">
          <Target className="h-5 w-5 text-[#2e7066]" />
          <h3 className="text-sm font-semibold text-slate-700">优先申请方向</h3>
        </div>
        <div className="space-y-2">
          {topPolicies.map((r, i) => (
            <div key={r.policyId} className="flex items-start gap-2 rounded-lg bg-white p-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#0f3a32]/10 text-xs font-bold text-[#2e7066]">
                {i + 1}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-700">{r.policyName}</p>
                <p className="mt-0.5 text-xs text-slate-500">{r.suggestion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info to supplement */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-700">需补充信息</h3>
        </div>
        <ul className="space-y-2">
          {supplementInfo.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-300" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Resume optimization */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <Pencil className="h-5 w-5 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700">简历优化建议</h3>
        </div>
        <ul className="space-y-2">
          {resumeTips.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
              <ArrowRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-300" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Next steps */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-[#2e7066]" />
          <h3 className="text-sm font-semibold text-slate-700">下一步行动</h3>
        </div>
        <div className="space-y-3">
          {nextSteps.map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[#2e7066] text-sm font-bold text-white">
                {item.step}
              </span>
              <div>
                <p className="text-sm font-medium text-slate-700">{item.action}</p>
                <p className="text-xs text-slate-400">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => navigateTo('policies')}
          className="flex-1 rounded-xl bg-[#2e7066] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1a4f47]"
        >
          浏览政策库
        </button>
        <button
          onClick={() => showToast('材料清单已导出至剪贴板')}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          导出材料清单
        </button>
      </div>
    </div>
  );
};
