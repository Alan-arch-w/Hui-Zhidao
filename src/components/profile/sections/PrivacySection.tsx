import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Trash2,
  MessageSquare,
  Bell,
  Mic,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../../../store/AppContext';
import { Switch } from '../shared/Switch';
import { Modal } from '../shared/Modal';

export const PrivacySection: React.FC = () => {
  const { state, updatePrivacy, updateAccount, showToast } = useApp();
  const { privacy } = state;
  const [confirmOpen, setConfirmOpen] = useState<string | null>(null);

  const handleConfirm = () => {
    if (confirmOpen === 'conversations') {
      showToast('对话记录已清空');
    } else if (confirmOpen === 'credentials') {
      showToast('全部简历证照已清空');
    } else if (confirmOpen === 'all') {
      updateAccount({ realName: '', phone: '', verified: false, authorized: false });
      updatePrivacy({ talentPoolAuthorized: false, policyPushEnabled: false, voiceInputEnabled: false });
      showToast('已申请永久删除全部数据');
    }
    setConfirmOpen(null);
  };

  const renderTooltip = (text: string) => (
    <div className="group relative inline-block">
      <HelpCircle className="h-3.5 w-3.5 cursor-help text-slate-400" />
      <div className="absolute bottom-full left-1/2 z-20 mb-2 hidden w-48 -translate-x-1/2 rounded-lg bg-slate-800 px-3 py-2 text-[10px] leading-relaxed text-white shadow-lg group-hover:block">
        {text}
        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      {/* 高端人才库授权 */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-slate-200 bg-white p-4"
      >
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#2e7066]" />
            <h3 className="text-sm font-semibold text-slate-800">高端人才库授权</h3>
            {renderTooltip('开启后，徐汇区人才服务后台可在政策匹配、人才计划申报时调取你的档案信息。关闭后立即撤回授权。')}
          </div>
          <Switch
            checked={privacy.talentPoolAuthorized}
            onChange={(checked) => {
              updatePrivacy({ ...privacy, talentPoolAuthorized: checked });
              updateAccount({ authorized: checked });
            }}
          />
        </div>
        <p className="text-xs leading-relaxed text-slate-500">
          {privacy.talentPoolAuthorized
            ? '你已授权徐汇区人才服务后台调取本人档案，用于政策精准匹配与人才计划推荐。'
            : '你已关闭人才库授权，后台不再调取你的档案信息，部分精准推荐功能可能受限。'}
        </p>
      </motion.div>

      {/* 数据自主处置 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">数据自主处置</h3>
        <div className="space-y-2">
          <button
            onClick={() => setConfirmOpen('conversations')}
            className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-slate-200"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-700">清空对话记录</span>
            </div>
            <span className="text-[10px] text-slate-400">不可恢复</span>
          </button>
          <button
            onClick={() => setConfirmOpen('credentials')}
            className="flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 transition hover:border-slate-200"
          >
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-700">清空全部简历证照</span>
            </div>
            <span className="text-[10px] text-slate-400">不可恢复</span>
          </button>
          <button
            onClick={() => setConfirmOpen('all')}
            className="flex w-full items-center justify-between rounded-xl border border-red-100 bg-red-50 p-3 transition hover:border-red-200"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-xs font-medium text-red-600">申请永久删除个人全部数据</span>
            </div>
            <span className="text-[10px] text-red-400">需人工审核</span>
          </button>
        </div>
      </div>

      {/* 通知与交互设置 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">通知与交互</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-700">政策推送通知</span>
            </div>
            <Switch
              checked={privacy.policyPushEnabled}
              onChange={(checked) => updatePrivacy({ ...privacy, policyPushEnabled: checked })}
              size="sm"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-medium text-slate-700">语音对话输入</span>
            </div>
            <Switch
              checked={privacy.voiceInputEnabled}
              onChange={(checked) => updatePrivacy({ ...privacy, voiceInputEnabled: checked })}
              size="sm"
            />
          </div>
        </div>
      </div>

      <Modal isOpen={!!confirmOpen} onClose={() => setConfirmOpen(null)} title="确认操作">
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-sm text-slate-700">
            {confirmOpen === 'conversations' && '确定要清空所有 AI 对话记录吗？此操作不可恢复。'}
            {confirmOpen === 'credentials' && '确定要清空所有简历和证照附件吗？此操作不可恢复。'}
            {confirmOpen === 'all' && '确定要申请永久删除个人全部数据吗？提交后需人工审核，审核通过后数据将不可恢复。'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmOpen(null)}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              取消
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white transition hover:bg-red-600"
            >
              确认
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
