import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Tag, Heart } from 'lucide-react';
import { Policy, MatchResult, mapPolicyCategoryToFavorite, parsePolicyDeadline } from '../../types';
import { useApp } from '../../store/AppContext';
import { MatchBadge } from '../common/MatchBadge';

interface PolicyCardProps {
  policy: Policy;
  matchResult?: MatchResult;
  isReference?: boolean;
}

export const PolicyCard: React.FC<PolicyCardProps> = ({ policy, matchResult, isReference }) => {
  const { state, addFavorite, deleteFavorite, showToast, openPolicyDetail } = useApp();
  const isFavorite = state.favorites.some((f) => f.policyId === policy.id);

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFavorite) {
      const fav = state.favorites.find((f) => f.policyId === policy.id);
      if (fav) {
        deleteFavorite(fav.id);
        showToast('已取消收藏');
      }
    } else {
      addFavorite({
        id: `fav-${Date.now()}`,
        policyId: policy.id,
        name: policy.name,
        category: mapPolicyCategoryToFavorite(policy.category),
        deadline: parsePolicyDeadline(policy),
        collectedAt: Date.now(),
      });
      showToast('已收藏该政策');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={() => openPolicyDetail(policy.id)}
      className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {/* Category tag */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-[#0f3a32]/5 px-2 py-0.5 text-[10px] font-medium text-[#2e7066]">
              <Tag className="h-2.5 w-2.5" />
              {policy.category}
            </span>
            {isReference && (
              <span className="rounded-full bg-[#c8a96e]/10 px-2 py-0.5 text-[10px] font-medium text-[#9a7e4e]">
                政策参考
              </span>
            )}
            {matchResult && (
              <MatchBadge level={matchResult.matchLevel} size="sm" />
            )}
          </div>

          {/* Name */}
          <h3 className="text-sm font-semibold text-slate-700">{policy.name}</h3>

          {/* Brief benefit */}
          <p className="mt-1 line-clamp-2 text-xs text-slate-500">{policy.benefit}</p>

          {/* Keywords */}
          <div className="mt-2 flex flex-wrap gap-1">
            {policy.keywords.slice(0, 5).map((kw, i) => (
              <span key={i} className="rounded bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400">
                {kw}
              </span>
            ))}
            {policy.keywords.length > 5 && (
              <span className="text-[10px] text-slate-300">+{policy.keywords.length - 5}</span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button
            onClick={handleFavoriteToggle}
            title={isFavorite ? '取消收藏' : '收藏政策'}
            className={`rounded-full p-1.5 transition ${
              isFavorite
                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                : 'bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600'
            }`}
          >
            <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
          </button>
          <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-300" />
        </div>
      </div>
    </motion.div>
  );
};
