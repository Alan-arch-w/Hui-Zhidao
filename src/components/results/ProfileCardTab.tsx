import React from 'react';
import { motion } from 'framer-motion';
import { User, GraduationCap, Briefcase, MapPin, Award, Building2, Copy, Download, RefreshCw } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { getBreakdown } from '../../utils/completeness';

export const ProfileCardTab: React.FC = () => {
  const { state, dispatch, navigateTo, showToast } = useApp();
  const { profile, quizAnswers, completeness } = state;

  const breakdown = getBreakdown(profile, quizAnswers);
  const filledCount = breakdown.filter((b) => b.filled).length;

  const handleCopy = () => {
    const text = `人才画像报告\n姓名：${profile.name}\n年龄：${profile.age}\n学历：${profile.education}\n专业：${profile.major}\n职位：${profile.currentRole}\n行业：${profile.industry}\n人才类型：${profile.talentType}\n信息完整度：${completeness}%`;
    navigator.clipboard?.writeText(text).then(
      () => showToast('报告已复制到剪贴板'),
      () => showToast('复制失败，请手动复制'),
    );
  };

  const handleExport = () => {
    showToast('报告导出功能演示中');
  };

  const handleRestart = () => {
    dispatch({ type: 'RESET_ALL' });
    navigateTo('chat');
    showToast('已重置，可以重新开始咨询');
  };

  const infoItems = [
    { icon: User, label: '姓名', value: profile.name },
    { icon: User, label: '年龄', value: profile.age > 0 ? `${profile.age}岁` : '' },
    { icon: GraduationCap, label: '学历', value: profile.education },
    { icon: Briefcase, label: '专业', value: profile.major },
    { icon: Briefcase, label: '职位', value: profile.currentRole },
    { icon: MapPin, label: '工作区域', value: profile.workArea },
    { icon: Building2, label: '公司阶段', value: profile.companyStage },
    { icon: Award, label: '行业领域', value: profile.industry },
  ].filter((item) => item.value);

  return (
    <div className="space-y-4">
      {/* Profile card with gradient */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl shadow-lg"
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0f3a32] via-[#1a4f47] to-[#0f3a32] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{profile.name || '人才画像'}</h2>
              <p className="text-sm text-white/70">{profile.talentType || '待确认'}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-3xl font-bold text-white">{completeness}%</p>
              <p className="text-xs text-white/70">信息完整度</p>
            </div>
          </div>
        </div>

        {/* Info grid */}
        <div className="bg-white p-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {infoItems.map((item, index) => (
              <div key={index}>
                <div className="mb-1 flex items-center gap-1 text-slate-400">
                  <item.icon className="h-3 w-3" />
                  <span className="text-[10px]">{item.label}</span>
                </div>
                <p className="text-sm font-medium text-slate-700">{item.value}</p>
              </div>
            ))}
          </div>

          {profile.projectExp && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="mb-1 text-[10px] text-slate-400">项目经验</p>
              <p className="text-sm text-slate-600">{profile.projectExp}</p>
            </div>
          )}

          {profile.highlights && (
            <div className="mt-3">
              <p className="mb-1 text-[10px] text-slate-400">简历亮点</p>
              <p className="text-sm text-slate-600">{profile.highlights}</p>
            </div>
          )}

          {profile.achievements.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 text-[10px] text-slate-400">成果标签</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.achievements.map((ach, index) => (
                  <span key={index} className="rounded-full bg-[#0f3a32]/5 px-3 py-1 text-xs font-medium text-[#2e7066]">
                    {ach}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Completeness breakdown */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">信息完整度明细</h3>
          <span className="text-xs text-slate-400">{filledCount} / {breakdown.length} 项已填写</span>
        </div>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {breakdown.map((item, index) => (
            <div
              key={index}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${
                item.filled ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-400'
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${item.filled ? 'bg-green-500' : 'bg-slate-300'}`} />
              {item.label}
            </div>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2e7066] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1a4f47]"
        >
          <Copy className="h-4 w-4" />
          复制报告
        </button>
        <button
          onClick={handleExport}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Download className="h-4 w-4" />
          导出
        </button>
        <button
          onClick={handleRestart}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          重新咨询
        </button>
      </div>
    </div>
  );
};
