import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Info, AlertCircle } from 'lucide-react';
import { MatchResult } from '../../types';
import { MatchBadge } from '../common/MatchBadge';
import { useApp } from '../../store/AppContext';

interface MatchResultCardProps {
  results: MatchResult[];
}

export const MatchResultCard: React.FC<MatchResultCardProps> = ({ results }) => {
  const { navigateTo } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 max-w-md space-y-3"
    >
      {results.map((result, index) => (
        <div
          key={result.policyId}
          className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          {/* Match badge */}
          <div className="absolute right-3 top-3">
            <MatchBadge level={result.matchLevel} score={result.matchScore} size="sm" />
          </div>

          {/* Policy name */}
          <div className="mb-2 pr-20">
            <span className="mr-2 text-xs font-bold text-slate-300">#{index + 1}</span>
            <span className="text-sm font-semibold text-slate-700">{result.policyName}</span>
            {result.status === 'reference' && (
              <span className="ml-2 inline-flex items-center gap-0.5 rounded-full bg-[#c8a96e]/10 px-2 py-0.5 text-[10px] font-medium text-[#9a7e4e]">
                <Info className="h-3 w-3" /> 参考
              </span>
            )}
          </div>

          {/* Satisfied conditions */}
          {result.satisfiedConditions.length > 0 && (
            <div className="mb-2">
              <p className="mb-1 text-[10px] font-medium text-green-700">已满足条件</p>
              <div className="flex flex-wrap gap-1">
                {result.satisfiedConditions.map((cond, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-green-50 px-2 py-0.5 text-[11px] text-green-700"
                  >
                    {cond}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pending conditions */}
          {result.pendingConditions.length > 0 && (
            <div className="mb-2">
              <p className="mb-1 text-[10px] font-medium text-amber-700">待确认条件</p>
              <div className="flex flex-wrap gap-1">
                {result.pendingConditions.slice(0, 3).map((cond, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700"
                  >
                    {cond}
                  </span>
                ))}
                {result.pendingConditions.length > 3 && (
                  <span className="text-[11px] text-slate-400">
                    +{result.pendingConditions.length - 3}项
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Suggestion */}
          <p className="mt-2 border-t border-slate-100 pt-2 text-xs text-slate-500">
            {result.suggestion}
          </p>
        </div>
      ))}

      {/* View more button */}
      <button
        onClick={() => navigateTo('results')}
        className="flex w-full items-center justify-center gap-1 rounded-xl border border-[#0f3a32]/15 bg-[#0f3a32]/5 px-4 py-2.5 text-sm font-medium text-[#2e7066] transition-colors hover:bg-[#0f3a32]/10"
      >
        查看完整匹配结果
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
        <p className="text-[11px] leading-relaxed text-slate-400">
          以上匹配结果基于你提供的信息进行智能分析，仅供参考。具体申报资格请以政策原文及主管部门审核为准。
        </p>
      </div>
    </motion.div>
  );
};
