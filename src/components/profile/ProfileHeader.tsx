import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, ShieldCheck, Phone, LogOut, Pencil, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { Switch } from './shared/Switch';
import { Modal } from './shared/Modal';

export const ProfileHeader: React.FC = () => {
  const { state, updateAccount, logout } = useApp();
  const { account } = state;
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ realName: account.realName, phone: account.phone });

  const maskedPhone = account.phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');

  const handleSave = () => {
    updateAccount({ realName: form.realName.trim() || account.realName, phone: form.phone || account.phone });
    setEditOpen(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 border-b border-slate-100 bg-white px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6 md:py-3"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0f3a32]/5">
            <User className="h-5 w-5 text-[#2e7066]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-800 md:text-lg">{account.realName}</h2>
              {account.verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-600">
                  <ShieldCheck className="h-3 w-3" />
                  已核验
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                  未核验
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {maskedPhone}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 md:gap-4">
          <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
            <span className="text-xs text-slate-500">人才库授权</span>
            <Switch
              checked={account.authorized}
              onChange={(checked) => updateAccount({ authorized: checked })}
              size="sm"
            />
          </div>
          <button
            onClick={() => setEditOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            修改实名信息
          </button>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1 rounded-lg bg-[#0f3a32] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#0d2e27]"
          >
            <LogOut className="h-3.5 w-3.5" />
            退出登录
          </button>
        </div>
      </motion.div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="修改实名信息">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">真实姓名</label>
            <input
              value={form.realName}
              onChange={(e) => setForm({ ...form, realName: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2e7066] focus:bg-white focus:ring-2 focus:ring-[#2e7066]/10"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">联系电话</label>
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2e7066] focus:bg-white focus:ring-2 focus:ring-[#2e7066]/10"
            />
          </div>
          <button
            onClick={handleSave}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f3a32] py-2.5 text-sm font-medium text-white transition hover:bg-[#0d2e27]"
          >
            <CheckCircle2 className="h-4 w-4" />
            保存
          </button>
        </div>
      </Modal>
    </>
  );
};
