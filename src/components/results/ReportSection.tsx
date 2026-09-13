import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Eye, Download, CheckCircle2, AlertCircle, Target, Sparkles, Clock, TrendingUp } from 'lucide-react';
import { useApp } from '../../store/AppContext';

interface ReportSectionProps {
  onViewFullReport: () => void;
}

export const ReportSection: React.FC<ReportSectionProps> = ({ onViewFullReport }) => {
  const { state, showToast } = useApp();
  const { matchResults, profile, quizAnswers } = state;

  const fullMatchCount = matchResults.filter((r) => r.matchLevel === 'high').length;
  const partialMatchCount = matchResults.filter((r) => r.matchLevel === 'medium').length;

  // Derive advantages from profile + quiz
  const advantages: string[] = [];
  if (profile.education?.includes('硕士') || profile.education?.includes('博士')) advantages.push(`学历层次较高（${profile.education}）`);
  if (quizAnswers.socialInsurance === '已缴纳') advantages.push('社保已在上海连续缴纳');
  if (quizAnswers.workInXuhui === '是') advantages.push('工作单位在徐汇区域');
  if (profile.industry?.includes('AI') || profile.industry?.includes('科技') || profile.industry?.includes('人工智能')) advantages.push('属于徐汇区重点产业方向');
  if (profile.achievements.length > 0 && !profile.achievements.includes('暂无')) advantages.push('具备一定的项目或成果基础');
  if (advantages.length === 0) advantages.push('基础条件已具备，仍有提升空间');

  // Derive gaps
  const gaps: string[] = [];
  if (quizAnswers.socialInsurance !== '已缴纳') gaps.push('社保缴纳情况需进一步确认');
  if (quizAnswers.renting !== '是') gaps.push('租房补贴申请需补充租房及备案信息');
  if (profile.achievements.length === 0 || profile.achievements.includes('暂无')) gaps.push('专利、论文、获奖等成果类材料偏弱');
  if (quizAnswers.workInXuhui !== '是') gaps.push('工作单位是否在徐汇需确认');
  if (gaps.length === 0) gaps.push('建议完善成果类证明，提升高层次政策竞争力');

  const topDirection = matchResults.length > 0 ? matchResults[0].policyName : '人才租房补贴 / 青年人才计划';

  const summaryItems = [
    { label: '匹配政策数量', value: `${matchResults.length} 项（${fullMatchCount} 完全符合 / ${partialMatchCount} 部分达标）`, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: '当前优势', value: advantages[0], icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: '主要缺口', value: gaps[0], icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: '优先方向', value: topDirection, icon: Target, color: 'text-[#2e7066]', bg: 'bg-[#0f3a32]/5' },
  ];

  const handleDownload = () => {
    showToast('已生成《徐汇人才资质综合分析与提升规划报告》PDF文件。');
    // Allow a moment for the toast to be visible before printing
    setTimeout(() => window.print(), 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-auto mt-8 max-w-4xl"
    >
      <div className="overflow-hidden rounded-2xl border border-[#0f3a32]/10 bg-white shadow-md">
        {/* Header with gradient accent */}
        <div className="relative bg-gradient-to-r from-[#0f3a32] to-[#2e7066] px-6 py-5">
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
            <div className="h-full w-full bg-[radial-gradient(circle_at_top_right,_white,_transparent_60%)]" />
          </div>
          <div className="relative flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-white">完整分析报告已生成</h2>
              <p className="mt-1 text-sm text-white/80">
                系统已根据你的简历、补充信息和政策匹配结果，生成一份完整的人才资质分析与提升规划报告。
              </p>
            </div>
          </div>
        </div>

        {/* Summary grid */}
        <div className="p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {summaryItems.map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-colors hover:bg-slate-50"
              >
                <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${item.bg}`}>
                  <item.icon className={`h-4 w-4 ${item.color}`} />
                </div>
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-700">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Short plan preview */}
          <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#2e7066]" />
              <h3 className="text-sm font-semibold text-slate-700">短期提升建议</h3>
            </div>
            <ul className="space-y-2">
              <li className="flex items-start gap-2 text-sm text-slate-600">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#c8a96e]" />
                确认社保连续缴纳记录及用人单位资质
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-600">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#c8a96e]" />
                补充租赁合同和租赁备案（如申请租房补贴）
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-600">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#c8a96e]" />
                整理学历学位证明与在职证明
              </li>
            </ul>
          </div>

          {/* Long plan preview */}
          <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#2e7066]" />
              <h3 className="text-sm font-semibold text-slate-700">中长期提升建议</h3>
            </div>
            <p className="text-sm text-slate-600">
              围绕{topDirection}，逐步补充成果类材料（专利、论文、项目获奖），积累可量化业绩数据，并参与区级创新创业活动，为未来申报更高层级人才政策打好基础。
            </p>
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              onClick={onViewFullReport}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#0f3a32] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#16433b]"
            >
              <Eye className="h-4 w-4" />
              查看完整报告
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 rounded-xl border border-[#0f3a32]/20 bg-white px-5 py-2.5 text-sm font-medium text-[#0f3a32] transition-colors hover:bg-[#0f3a32]/5"
            >
              <Download className="h-4 w-4" />
              下载报告
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
