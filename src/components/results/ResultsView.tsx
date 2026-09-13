import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, TrafficCone, ClipboardList, Lightbulb, User } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { PolicyMatchTab } from './PolicyMatchTab';
import { QualificationTab } from './QualificationTab';
import { MaterialsTab } from './MaterialsTab';
import { SuggestionTab } from './SuggestionTab';
import { ProfileCardTab } from './ProfileCardTab';
import { ReportSection } from './ReportSection';
import { FullReportModal } from './FullReportModal';

type TabId = 'match' | 'qualification' | 'materials' | 'suggestion' | 'profile';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'match', label: '政策匹配', icon: FileText },
  { id: 'qualification', label: '资格灯号', icon: TrafficCone },
  { id: 'materials', label: '材料清单', icon: ClipboardList },
  { id: 'suggestion', label: '申报建议', icon: Lightbulb },
  { id: 'profile', label: '画像卡', icon: User },
];

export const ResultsView: React.FC = () => {
  const { state, navigateTo } = useApp();
  const [activeTab, setActiveTab] = useState<TabId>('match');
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <div className="flex h-full flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white px-4 py-3 md:px-6 md:py-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={() => navigateTo('chat')}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:px-3 md:py-1.5 md:text-sm"
            >
              <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
              返回对话
            </button>
            <div className="h-4 w-px bg-slate-200 md:h-5" />
            <h1 className="text-base font-semibold text-slate-800 md:text-lg">匹配结果</h1>
          </div>

          {/* Completeness */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">信息完整度</span>
            <div className="flex items-center gap-2">
              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100 md:w-28">
                <div
                  className={`h-full rounded-full ${
                    state.completeness >= 80 ? 'bg-green-500' : state.completeness >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${state.completeness}%` }}
                />
              </div>
              <span className="text-sm font-bold text-slate-700">{state.completeness}%</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2">
          <span className="text-xs text-amber-700">
            匹配结果基于提供的信息进行智能分析，仅供参考。具体申报资格请以政策原文及主管部门审核为准。
          </span>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-slate-100 bg-white px-4 md:px-6">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-medium transition-colors md:px-4 md:py-3 md:text-sm ${
                active
                  ? 'border-[#2e7066] text-[#2e7066]'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="mx-auto max-w-4xl"
        >
          {activeTab === 'match' && <PolicyMatchTab />}
          {activeTab === 'qualification' && <QualificationTab />}
          {activeTab === 'materials' && <MaterialsTab />}
          {activeTab === 'suggestion' && <SuggestionTab />}
          {activeTab === 'profile' && <ProfileCardTab />}
        </motion.div>

        {/* Full analysis report section */}
        <ReportSection onViewFullReport={() => setReportOpen(true)} />
      </div>

      <FullReportModal open={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
};
