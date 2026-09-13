import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { MatchBadge } from '../common/MatchBadge';
import { POLICIES } from '../../data/policies';
import { MatchResult, Policy } from '../../types';

export const PolicyMatchTab: React.FC = () => {
  const { state, openPolicyDetail } = useApp();
  const [expanded, setExpanded] = useState<string | null>(null);

  const getPolicy = (id: string): Policy | undefined => POLICIES.find((p) => p.id === id);

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <div className="space-y-3">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">
        政策匹配结果（共 {state.matchResults.length} 条）
      </h2>

      {state.matchResults.map((result: MatchResult, index: number) => {
        const policy = getPolicy(result.policyId);
        const isExpanded = expanded === result.policyId;
        const isReference = result.status === 'reference';

        return (
          <div
            key={result.policyId}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            {/* Card header */}
            <div
              className="flex cursor-pointer items-start justify-between gap-3 p-4"
              onClick={() => toggleExpand(result.policyId)}
            >
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300">#{index + 1}</span>
                  <MatchBadge level={result.matchLevel} score={result.matchScore} size="sm" />
                  {isReference && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-[#c8a96e]/10 px-2 py-0.5 text-[10px] font-medium text-[#9a7e4e]">
                      <Info className="h-3 w-3" /> 参考政策
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-semibold text-slate-700">{result.policyName}</h3>
                <p className="mt-1 text-xs text-slate-400">
                  匹配分：{result.matchScore} / 100
                </p>
              </div>
              <button className="mt-1 text-slate-400">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>

            {/* Expanded content */}
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="border-t border-slate-100 p-4"
              >
                {/* Satisfied conditions */}
                {result.satisfiedConditions.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-1.5 text-xs font-semibold text-green-700">已满足条件</p>
                    <ul className="space-y-1">
                      {result.satisfiedConditions.map((cond, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                          <span className="mt-0.5 text-green-500">●</span>
                          {cond}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Pending conditions */}
                {result.pendingConditions.length > 0 && (
                  <div className="mb-3">
                    <p className="mb-1.5 text-xs font-semibold text-amber-700">待确认条件</p>
                    <ul className="space-y-1">
                      {result.pendingConditions.map((cond, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                          <span className="mt-0.5 text-amber-500">●</span>
                          {cond}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestion */}
                <div className="mb-3 rounded-lg bg-[#0f3a32]/5 p-3">
                  <p className="text-xs text-[#2e7066]">{result.suggestion}</p>
                </div>

                {/* Policy benefit */}
                {policy && (
                  <div className="mb-3">
                    <p className="mb-1 text-xs font-semibold text-slate-500">补贴标准</p>
                    <p className="text-xs text-slate-600">{policy.benefit}</p>
                  </div>
                )}

                {/* View detail button */}
                {policy && (
                    <button
                    onClick={() => openPolicyDetail(result.policyId)}
                    className="text-xs font-medium text-[#2e7066] hover:text-[#1a4f47]"
                  >
                    查看政策详情 →
                  </button>
                )}
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
};
