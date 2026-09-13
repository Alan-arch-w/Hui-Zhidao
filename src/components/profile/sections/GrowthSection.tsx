import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, Circle, Download, RefreshCw, Calendar, Link2 } from 'lucide-react';
import { useApp } from '../../../store/AppContext';
import { EmptyState } from '../shared/EmptyState';
import { Modal } from '../shared/Modal';
import { GrowthPlan } from '../../../types';

export const GrowthSection: React.FC = () => {
  const { state, toggleGrowthTask, deleteGrowthPlan, addGrowthPlan, exportTodoList, showToast } = useApp();
  const { growthPlans } = state;
  const [activePlan, setActivePlan] = useState<GrowthPlan | null>(null);

  const completedCount = growthPlans.reduce((acc, p) => acc + p.tasks.filter((t) => t.completed).length, 0);
  const totalCount = growthPlans.reduce((acc, p) => acc + p.tasks.length, 0);
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleExport = (plan: GrowthPlan) => {
    const text = exportTodoList(plan.id);
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `待办清单-${plan.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('待办清单已导出');
  };

  const handleRegenerate = () => {
    const newPlan: GrowthPlan = {
      id: `gp-${Date.now()}`,
      title: `更新版规划-${new Date().toLocaleDateString('zh-CN')}`,
      generatedAt: Date.now(),
      type: 'short',
      summary: '基于最新画像重新生成的能力提升方案。',
      tasks: [
        { id: `gt-${Date.now()}-1`, title: '更新社保缴纳记录', completed: false, channelName: '徐汇区社保中心', channelUrl: 'https://rsj.sh.gov.cn/' },
        { id: `gt-${Date.now()}-2`, title: '补充最新项目成果证明', completed: false, channelName: '单位人事部门', channelUrl: '#' },
      ],
    };
    addGrowthPlan(newPlan);
    showToast('新版规划已生成');
  };

  return (
    <div className="space-y-5">
      {/* 进度总览 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">成长进度总览</h3>
          <span className="text-2xl font-bold text-[#2e7066]">{progress}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full rounded-full bg-gradient-to-r from-[#2e7066] to-[#0f3a32]"
          />
        </div>
        <p className="mt-2 text-xs text-slate-500">
          已完成 {completedCount} / {totalCount} 项待办任务
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">历史成长规划</h3>
        <button
          onClick={handleRegenerate}
          className="inline-flex items-center gap-1 rounded-lg bg-[#0f3a32] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#0d2e27]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          重新生成规划
        </button>
      </div>

      {growthPlans.length === 0 ? (
        <EmptyState title="暂无成长规划" description="完成政策匹配后将自动生成提升方案" />
      ) : (
        <div className="grid gap-3">
          {growthPlans.map((plan, index) => {
            const planCompleted = plan.tasks.filter((t) => t.completed).length;
            const planTotal = plan.tasks.length;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <Target className="h-4 w-4 text-[#2e7066]" />
                      <h4 className="text-sm font-semibold text-slate-800">{plan.title}</h4>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-500">{plan.summary}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleExport(plan)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-600"
                      title="导出待办"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteGrowthPlan(plan.id)}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                      title="删除"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="mb-3 flex items-center gap-3 text-[10px] text-slate-400">
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(plan.generatedAt).toLocaleDateString('zh-CN')}
                  </span>
                  <span className="rounded-full bg-[#0f3a32]/5 px-2 py-0.5 text-[#2e7066]">
                    {plan.type === 'short' ? '短期方案' : '中长期方案'}
                  </span>
                  <span>
                    进度 {planCompleted}/{planTotal}
                  </span>
                </div>

                <div className="space-y-2">
                  {plan.tasks.slice(0, 3).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-2 rounded-xl bg-slate-50 p-2.5"
                    >
                      <button
                        onClick={() => toggleGrowthTask(plan.id, task.id)}
                        className={`mt-0.5 flex-shrink-0 ${task.completed ? 'text-green-500' : 'text-slate-300'}`}
                      >
                        {task.completed ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                      </button>
                      <div className="flex-1">
                        <p className={`text-xs ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                          {task.title}
                        </p>
                        <a
                          href={task.channelUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-0.5 text-[10px] text-[#2e7066] hover:underline"
                        >
                          <Link2 className="h-3 w-3" />
                          {task.channelName}
                        </a>
                      </div>
                    </div>
                  ))}
                  {plan.tasks.length > 3 && (
                    <button
                      onClick={() => setActivePlan(plan)}
                      className="w-full rounded-lg py-1.5 text-center text-[10px] font-medium text-[#2e7066] transition hover:bg-slate-50"
                    >
                      查看全部 {plan.tasks.length} 项待办
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <Modal isOpen={!!activePlan} onClose={() => setActivePlan(null)} title={activePlan?.title || '待办清单'} maxWidth="max-w-lg">
        {activePlan && (
          <div className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
            {activePlan.tasks.map((task) => (
              <div key={task.id} className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
                <button
                  onClick={() => toggleGrowthTask(activePlan.id, task.id)}
                  className={`mt-0.5 flex-shrink-0 ${task.completed ? 'text-green-500' : 'text-slate-300'}`}
                >
                  {task.completed ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                </button>
                <div className="flex-1">
                  <p className={`text-xs ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {task.title}
                  </p>
                  <a
                    href={task.channelUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-0.5 text-[10px] text-[#2e7066] hover:underline"
                  >
                    <Link2 className="h-3 w-3" />
                    {task.channelName}
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};
