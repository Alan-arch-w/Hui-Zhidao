import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, User, GraduationCap, Briefcase, MapPin, Award, Building2, CheckCircle2, XCircle } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { QUIZ_QUESTIONS } from '../../types';
import { getBreakdown } from '../../utils/completeness';

export const ProfileView: React.FC = () => {
  const { state, navigateTo } = useApp();
  const { profile, quizAnswers, completeness } = state;

  const breakdown = getBreakdown(profile, quizAnswers);

  const profileItems = [
    { icon: User, label: '姓名', value: profile.name },
    { icon: User, label: '年龄', value: profile.age > 0 ? `${profile.age}岁` : '未填写' },
    { icon: GraduationCap, label: '学历', value: profile.education || '未填写' },
    { icon: Briefcase, label: '专业', value: profile.major || '未填写' },
    { icon: Briefcase, label: '职位', value: profile.currentRole || '未填写' },
    { icon: MapPin, label: '工作区域', value: profile.workArea || '未填写' },
    { icon: Building2, label: '公司阶段', value: profile.companyStage || '未填写' },
    { icon: Award, label: '行业领域', value: profile.industry || '未填写' },
    { icon: Briefcase, label: '项目经验', value: profile.projectExp || '未填写' },
    { icon: Award, label: '人才类型', value: profile.talentType || '未确认' },
    { icon: Award, label: '海外经历', value: profile.overseasExp || '未填写' },
    { icon: Award, label: '简历亮点', value: profile.highlights || '未填写' },
  ];

  const getQuizAnswer = (questionId: string): string => {
    const answer = (quizAnswers as any)[questionId];
    if (Array.isArray(answer)) {
      return answer.length > 0 ? answer.join('、') : '未回答';
    }
    return answer || '未回答';
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center gap-2 md:gap-3">
          <button
            onClick={() => navigateTo('chat')}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:px-3 md:py-1.5 md:text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
            返回对话
          </button>
          <div className="h-4 w-px bg-slate-200 md:h-5" />
          <h1 className="text-base font-semibold text-slate-800 md:text-lg">人才画像</h1>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-4xl space-y-4 md:space-y-6">
          {/* Profile card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center justify-between bg-gradient-to-r from-[#0f3a32] to-[#1a4f47] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 backdrop-blur">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">{profile.name || '人才画像'}</h2>
                  <p className="text-xs text-white/70">{profile.talentType || '待确认'}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{completeness}%</p>
                <p className="text-xs text-white/70">完整度</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
              {profileItems.map((item, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-50">
                    <item.icon className="h-4 w-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">{item.label}</p>
                    <p className="text-sm font-medium text-slate-700">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {profile.achievements.length > 0 && (
              <div className="border-t border-slate-100 p-5">
                <p className="mb-2 text-[10px] text-slate-400">成果标签</p>
                <div className="flex flex-wrap gap-2">
                  {profile.achievements.map((ach, index) => (
                    <span key={index} className="rounded-full bg-[#0f3a32]/5 px-3 py-1 text-xs font-medium text-[#2e7066]">
                      {ach}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Quiz answers summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">追问信息汇总</h3>
            <div className="space-y-3">
              {QUIZ_QUESTIONS.map((q, index) => {
                const answer = getQuizAnswer(q.id);
                const answered = answer !== '未回答';
                return (
                  <div key={q.id} className="flex items-start gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#0f3a32]/5 text-[10px] font-bold text-[#2e7066]">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="text-xs text-slate-500">{q.question}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        {answered ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 text-slate-300" />
                        )}
                        <span className={`text-sm font-medium ${answered ? 'text-slate-700' : 'text-slate-400'}`}>
                          {answer}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Completeness breakdown */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-700">完整度明细</h3>
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
                  <span className="ml-auto opacity-50">{item.weight}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
