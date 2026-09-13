import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, CheckCircle2, UserPlus } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { AdminTalent } from '../../types';
import { Modal } from './shared/Modal';

export const AuthorizeBanner: React.FC = () => {
  const { state, authorizeToPool, showToast, updateAccount, updatePrivacy } = useApp();
  const { profile, account, privacy, matchResults } = state;
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Check if already authorized and submitted
  const alreadyInPool = account.authorized && state.adminTalents.some(
    (t) => t.name === account.realName || t.name === profile.name
  );

  const handleAuthorize = () => {
    // Create admin talent from current profile
    const talent: AdminTalent = {
      id: `at-user-${Date.now()}`,
      name: account.realName || profile.name || '匿名用户',
      age: profile.age || 0,
      education: profile.education || '未知',
      major: profile.major || '未知',
      industry: profile.industry || '未知',
      talentType: profile.talentType || '青年人才',
      policyInterest: state.quizAnswers.policyInterest || '都想了解',
      matchScore: matchResults.length > 0
        ? Math.round(matchResults.reduce((a, b) => a + b.matchScore, 0) / matchResults.length)
        : 0,
      status: 'pending',
      authorizedAt: Date.now(),
      currentRole: profile.currentRole || '未知',
      workArea: profile.workArea || '未知',
      highlights: profile.highlights || '暂无亮点信息',
      resumeSummary: `${profile.education || ''} ${profile.major || ''}，${profile.currentRole || ''}，${profile.projectExp || '工作经历待补充'}。`,
      aiSuggestion: matchResults.length > 0
        ? `已匹配到 ${matchResults.length} 项政策，建议优先关注 ${matchResults[0]?.policyName || '相关政策'}。`
        : '建议完善画像信息后进行政策匹配，以获得更精准的推荐。',
      matchResults: matchResults.map((m) => ({
        policyName: m.policyName,
        matchScore: m.matchScore,
        level: m.matchLevel,
      })),
      materialGaps: matchResults.length > 0
        ? matchResults.flatMap((m) => m.pendingConditions).slice(0, 3)
        : ['建议完善个人画像信息'],
      followUpRecords: [],
    };

    authorizeToPool(talent);
    updateAccount({ authorized: true });
    updatePrivacy({ ...privacy, talentPoolAuthorized: true });
    setConfirmOpen(false);
    showToast('已成功授权加入人才服务库，政府端将审核您的档案');
  };

  if (alreadyInPool) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between border-b border-green-100 bg-green-50/50 px-4 py-2.5 md:px-6"
      >
        <div className="flex items-center gap-2 text-xs text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          <span>已授权入库，政府端正在审核您的档案</span>
        </div>
        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-medium text-green-700">
          审核中
        </span>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between border-b border-[#0f3a32]/15 bg-[#0f3a32]/5 px-4 py-2.5 md:px-6"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0f3a32]/10">
            <ShieldCheck className="h-3.5 w-3.5 text-[#2e7066]" />
          </div>
          <div>
            <div className="text-xs font-medium text-slate-700">授权加入人才服务库</div>
            <div className="text-[10px] text-slate-500">授权后，政府端可审核您的档案并主动对接人才服务</div>
          </div>
        </div>
        <button
          onClick={() => setConfirmOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-[#0f3a32] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#0d2e27]"
        >
          <UserPlus className="h-3.5 w-3.5" />
          立即授权
          <ArrowRight className="h-3 w-3" />
        </button>
      </motion.div>

      <Modal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} title="授权加入人才服务库">
        <div className="space-y-4">
          <div className="rounded-xl bg-[#0f3a32]/5 p-4">
            <div className="mb-2 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#2e7066]" />
              <span className="text-sm font-medium text-slate-800">授权说明</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-600">
              授权后，您的人才档案（包括基础信息、AI 画像、政策匹配结果）将提交至徐汇区人才服务管理后台，
              由政府端工作人员进行入库审核。审核通过后，您将获得主动政策推送与一对一人才服务对接。
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-[10px] font-medium text-slate-400">将提交的档案信息</div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-slate-400">姓名</span><span className="ml-2 font-medium text-slate-700">{account.realName || profile.name || '未填写'}</span></div>
              <div><span className="text-slate-400">人才类型</span><span className="ml-2 font-medium text-slate-700">{profile.talentType || '青年人才'}</span></div>
              <div><span className="text-slate-400">行业方向</span><span className="ml-2 font-medium text-slate-700">{profile.industry || '未知'}</span></div>
              <div><span className="text-slate-400">匹配度</span><span className="ml-2 font-medium text-slate-700">{matchResults.length > 0 ? `${Math.round(matchResults.reduce((a, b) => a + b.matchScore, 0) / matchResults.length)}%` : '待匹配'}</span></div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setConfirmOpen(false)}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              暂不授权
            </button>
            <button
              onClick={handleAuthorize}
              className="flex-1 rounded-xl bg-[#0f3a32] py-2.5 text-sm font-medium text-white transition hover:bg-[#0d2e27]"
            >
              确认授权
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
