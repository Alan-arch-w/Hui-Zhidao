import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { useApp } from '../../store/AppContext';

interface QualItem {
  label: string;
  status: 'green' | 'yellow' | 'red';
  detail: string;
}

export const QualificationTab: React.FC = () => {
  const { state } = useApp();
  const { profile, quizAnswers } = state;

  // Build qualification items based on profile and quiz answers
  const items: QualItem[] = [
    {
      label: '学历达标',
      status: profile.education && (profile.education.includes('本科') || profile.education.includes('硕士') || profile.education.includes('博士')) ? 'green' : 'red',
      detail: profile.education || '未填写',
    },
    {
      label: '年龄符合',
      status: profile.age > 0 && profile.age <= 35 ? 'green' : profile.age > 0 && profile.age <= 45 ? 'yellow' : 'red',
      detail: profile.age > 0 ? `${profile.age}岁` : '未填写',
    },
    {
      label: '社保缴纳',
      status: quizAnswers.socialInsurance === '已缴纳' ? 'green' : quizAnswers.socialInsurance === '不确定' ? 'yellow' : 'red',
      detail: quizAnswers.socialInsurance || '未填写',
    },
    {
      label: '在沪租房',
      status: quizAnswers.renting === '是' ? 'green' : quizAnswers.renting === '不确定' ? 'yellow' : 'red',
      detail: quizAnswers.renting || '未填写',
    },
    {
      label: '徐汇工作',
      status: quizAnswers.workInXuhui === '是' ? 'green' : quizAnswers.workInXuhui === '不确定' ? 'yellow' : 'red',
      detail: quizAnswers.workInXuhui || '未填写',
    },
    {
      label: '重点产业',
      status: profile.industry && (profile.industry.includes('AI') || profile.industry.includes('科技') || profile.industry.includes('人工智能')) ? 'green' : profile.industry ? 'yellow' : 'red',
      detail: profile.industry || '未填写',
    },
    {
      label: '创业经历',
      status: profile.currentRole && profile.currentRole.includes('创业') ? 'green' : profile.companyStage && profile.companyStage.includes('创业') ? 'green' : 'yellow',
      detail: profile.currentRole || '未确认',
    },
    {
      label: '海外经历',
      status: quizAnswers.overseasExp === '海外留学' ? 'green' : quizAnswers.overseasExp === '海外工作' ? 'yellow' : 'red',
      detail: quizAnswers.overseasExp || '无',
    },
    {
      label: '成果标签',
      status: profile.achievements.length > 0 && !profile.achievements.includes('暂无') ? 'green' : 'yellow',
      detail: profile.achievements.length > 0 ? profile.achievements.join('、') : '暂无',
    },
    {
      label: '创业意向',
      status: quizAnswers.startupIntent === '是' ? 'green' : quizAnswers.startupIntent === '考虑中' ? 'yellow' : 'red',
      detail: quizAnswers.startupIntent || '未填写',
    },
  ];

  const statusConfig = {
    green: { icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200', label: '符合' },
    yellow: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', label: '待确认' },
    red: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200', label: '不符合' },
  };

  const greenCount = items.filter((i) => i.status === 'green').length;
  const yellowCount = items.filter((i) => i.status === 'yellow').length;

  // Advantages and shortcomings
  const advantages = items.filter((i) => i.status === 'green').slice(0, 4);
  const shortcomings = items.filter((i) => i.status !== 'green').slice(0, 4);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">资格灯号总览</h2>

      {/* Traffic lights grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {items.map((item, index) => {
          const config = statusConfig[item.status];
          return (
            <div
              key={index}
              className={`flex flex-col items-center rounded-xl border ${config.border} ${config.bg} p-3 text-center`}
            >
              <config.icon className={`mb-1 h-6 w-6 ${config.color}`} />
              <p className="text-xs font-medium text-slate-700">{item.label}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">{item.detail}</p>
            </div>
          );
        })}
      </div>

      {/* Summary bar */}
      <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500" />
          <span className="text-sm text-slate-600">符合 {greenCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-amber-500" />
          <span className="text-sm text-slate-600">待确认 {yellowCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          <span className="text-sm text-slate-600">不符合 {items.length - greenCount - yellowCount}</span>
        </div>
      </div>

      {/* Advantages */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <h3 className="text-sm font-semibold text-slate-700">当前优势</h3>
        </div>
        <div className="space-y-1.5">
          {advantages.length > 0 ? (
            advantages.map((item, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className="ml-auto text-xs text-slate-400">{item.detail}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">暂无明显优势，建议补充更多信息</p>
          )}
        </div>
      </div>

      {/* Shortcomings */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-amber-500" />
          <h3 className="text-sm font-semibold text-slate-700">主要短板</h3>
        </div>
        <div className="space-y-1.5">
          {shortcomings.length > 0 ? (
            shortcomings.map((item, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-slate-600">{item.label}</span>
                <span className="ml-auto text-xs text-slate-400">{item.detail}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400">无明显短板</p>
          )}
        </div>
      </div>
    </div>
  );
};
