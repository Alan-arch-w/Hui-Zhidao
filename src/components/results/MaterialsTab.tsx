import React from 'react';
import { CheckCircle2, FileQuestion, FilePlus, FileSearch } from 'lucide-react';
import { useApp } from '../../store/AppContext';

interface MaterialItem {
  name: string;
  status: 'ready' | 'prepare' | 'confirm' | 'optional';
}

interface MaterialGroup {
  title: string;
  items: MaterialItem[];
}

const STATUS_CONFIG = {
  ready: { icon: CheckCircle2, label: '已具备', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  prepare: { icon: FilePlus, label: '建议准备', color: 'text-[#2e7066]', bg: 'bg-[#0f3a32]/5', border: 'border-[#0f3a32]/15' },
  confirm: { icon: FileQuestion, label: '需要确认', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  optional: { icon: FileSearch, label: '可选补充', color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
};

export const MaterialsTab: React.FC = () => {
  const { state } = useApp();
  const { profile, quizAnswers } = state;

  // Build material groups based on profile and quiz answers
  const groups: MaterialGroup[] = [
    {
      title: '基础材料',
      items: [
        { name: '身份证复印件', status: 'ready' },
        { name: '学历学位证书', status: profile.education ? 'ready' : 'prepare' },
        { name: '简历', status: state.fileName ? 'ready' : 'prepare' },
        { name: '社保证明', status: quizAnswers.socialInsurance === '已缴纳' ? 'ready' : 'confirm' },
        { name: '劳动合同/在职证明', status: profile.currentRole ? 'ready' : 'confirm' },
      ],
    },
    {
      title: '租房补贴相关',
      items: [
        { name: '租赁合同', status: quizAnswers.renting === '是' ? 'prepare' : 'confirm' },
        { name: '房屋租赁网签备案证明', status: quizAnswers.renting === '是' ? 'prepare' : 'confirm' },
        { name: '用人单位资质证明', status: 'confirm' },
        { name: '本人及家属在沪无产权住房承诺书', status: 'prepare' },
        { name: '用人单位统一申报委托', status: 'prepare' },
      ],
    },
    {
      title: '人才计划相关',
      items: [
        { name: '海外学历认证', status: quizAnswers.overseasExp === '海外留学' ? 'prepare' : 'optional' },
        { name: '项目成果证明（专利/论文/获奖）', status: profile.achievements.length > 0 && !profile.achievements.includes('暂无') ? 'prepare' : 'optional' },
        { name: '创业计划书', status: quizAnswers.startupIntent === '是' || quizAnswers.startupIntent === '考虑中' ? 'prepare' : 'optional' },
        { name: '企业营业执照（如适用）', status: profile.companyStage && profile.companyStage.includes('创业') ? 'confirm' : 'optional' },
        { name: '薪资纳税证明', status: 'confirm' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-800">申报材料清单</h2>

      <p className="text-sm text-slate-500">
        根据你的画像和政策匹配结果，整理了以下材料清单。不同政策所需材料可能不同，请按实际申报要求准备。
      </p>

      {groups.map((group, gIndex) => (
        <div key={gIndex}>
          <h3 className="mb-3 text-sm font-semibold text-slate-700">{group.title}</h3>
          <div className="space-y-2">
            {group.items.map((item, iIndex) => {
              const config = STATUS_CONFIG[item.status];
              return (
                <div
                  key={iIndex}
                  className={`flex items-center justify-between rounded-lg border ${config.border} ${config.bg} px-4 py-2.5`}
                >
                  <div className="flex items-center gap-2">
                    <config.icon className={`h-4 w-4 ${config.color}`} />
                    <span className="text-sm text-slate-700">{item.name}</span>
                  </div>
                  <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Summary */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-4 gap-3 text-center">
          {(['ready', 'prepare', 'confirm', 'optional'] as const).map((status) => {
            const count = groups.reduce((acc, g) => acc + g.items.filter((i) => i.status === status).length, 0);
            const config = STATUS_CONFIG[status];
            return (
              <div key={status}>
                <p className={`text-2xl font-bold ${config.color}`}>{count}</p>
                <p className="text-xs text-slate-400">{config.label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
