import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBadgeProps {
  completeness: number;
}

export const ProgressBadge: React.FC<ProgressBadgeProps> = ({ completeness }) => {
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completeness / 100) * circumference;

  const getColor = () => {
    if (completeness >= 80) return '#22c55e';
    if (completeness >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 flex max-w-md items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      {/* Circular progress */}
      <div className="relative h-20 w-20 flex-shrink-0">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 70 70">
          <circle
            cx="35"
            cy="35"
            r={radius}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="6"
          />
          <motion.circle
            cx="35"
            cy="35"
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-slate-700">{completeness}%</span>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-slate-700">信息完整度</p>
        <p className="mt-0.5 text-xs text-slate-400">
          {completeness >= 80
            ? '信息较完整，可进行精准匹配'
            : completeness >= 50
              ? '信息基本完整，建议补充更多细节'
              : '信息较少，建议补充更多细节'}
        </p>
      </div>
    </motion.div>
  );
};
