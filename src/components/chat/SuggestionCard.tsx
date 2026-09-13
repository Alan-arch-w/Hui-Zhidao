import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ArrowRight, FileCheck, Pencil } from 'lucide-react';
import { MatchResult } from '../../types';
import { useApp } from '../../store/AppContext';

interface SuggestionCardProps {
  results?: MatchResult[];
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({ results = [] }) => {
  const { state, navigateTo, showToast } = useApp();

  // Determine top 2 policies to suggest
  const topPolicies = results.length > 0 ? results.slice(0, 2) : state.matchResults.slice(0, 2);

  const suggestions = topPolicies.map((r) => ({
    name: r.policyName,
    level: r.matchLevel,
    reason: r.suggestion,
  }));

  const supplementInfo = [
    '确认社保连续缴纳月数及基数',
    '确认用人单位是否符合重点产业导向',
    '准备租赁合同或网签备案证明',
    '整理专利/论文/获奖等成果证明',
  ];

  const resumeTips = [
    '补充明确的项目成果量化数据',
    '标注核心技术栈和行业关键词',
    '突出与目标政策相关的经历',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 max-w-md space-y-4"
    >
      {/* Priority suggestions */}
      <div className="rounded-2xl border border-[#c8a96e]/30 bg-[#c8a96e]/5 p-4">
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-semibold text-slate-700">优先申请方向</span>
        </div>
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-2 rounded-lg bg-white p-3">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#0f3a32]/10 text-[10px] font-bold text-[#2e7066]">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium text-slate-700">{s.name}</p>
                <p className="mt-0.5 text-xs text-slate-500">{s.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info to supplement */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">需补充信息</span>
        </div>
        <ul className="space-y-1.5">
          {supplementInfo.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <ArrowRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-300" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Resume optimization */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <Pencil className="h-5 w-5 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">简历优化建议</span>
        </div>
        <ul className="space-y-1.5">
          {resumeTips.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <ArrowRight className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-300" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Next steps */}
      <div className="flex gap-2">
        <button
          onClick={() => navigateTo('results')}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#2e7066] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1a4f47]"
        >
          查看完整结果
          <ArrowRight className="h-4 w-4" />
        </button>
        <button
          onClick={() => showToast('材料清单已整理，请前往"结果"页查看')}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          整理材料清单
        </button>
      </div>
    </motion.div>
  );
};
