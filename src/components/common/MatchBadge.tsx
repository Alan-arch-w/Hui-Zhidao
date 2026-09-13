import React from 'react';
import { MatchLevel } from '../../types';

interface MatchBadgeProps {
  level: MatchLevel;
  score?: number;
  size?: 'sm' | 'md';
}

const LEVEL_CONFIG: Record<MatchLevel, { label: string; bg: string; text: string; border: string }> = {
  high: { label: '高匹配', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  medium: { label: '中匹配', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  low: { label: '低匹配', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  none: { label: '不匹配', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
};

export const MatchBadge: React.FC<MatchBadgeProps> = ({ level, score, size = 'md' }) => {
  const config = LEVEL_CONFIG[level];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${config.bg} ${config.text} ${config.border} ${padding} font-medium`}>
      {config.label}
      {score !== undefined && level !== 'none' && (
        <span className="opacity-70">{score}分</span>
      )}
    </span>
  );
};
