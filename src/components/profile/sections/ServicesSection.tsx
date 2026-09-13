import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarClock,
  CalendarDays,
  MapPin,
  X,
  Users,
  Mic,
  Handshake,
  Plus,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useApp } from '../../../store/AppContext';
import { EmptyState } from '../shared/EmptyState';
import { Modal } from '../shared/Modal';
import { Appointment, ActivityRegistration } from '../../../types';

const activityTypeConfig: Record<ActivityRegistration['type'], { label: string; icon: React.ReactNode }> = {
  salon: { label: '科创沙龙', icon: <Mic className="h-3 w-3" /> },
  briefing: { label: '政策宣讲', icon: <Users className="h-3 w-3" /> },
  matchmaking: { label: '企业对接会', icon: <Handshake className="h-3 w-3" /> },
};

export const ServicesSection: React.FC = () => {
  const { state, cancelAppointment, cancelActivityRegistration, addAppointment, showToast } = useApp();
  const { appointments, activities } = state;
  const [bookingOpen, setBookingOpen] = useState(false);
  const [form, setForm] = useState({ type: '一对一人才辅导', date: '', time: '', note: '' });

  const formatTime = (ts: number) => new Date(ts).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

  const handleBook = () => {
    if (!form.date || !form.time) return;
    const appointment: Appointment = {
      id: `ap-${Date.now()}`,
      type: form.type,
      time: new Date(`${form.date}T${form.time}`).getTime(),
      counselor: '待分配专员',
      notes: form.note,
      status: 'upcoming',
    };
    addAppointment(appointment);
    setBookingOpen(false);
    setForm({ type: '一对一人才辅导', date: '', time: '', note: '' });
    showToast('预约已提交');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-800">线下服务与活动</h3>
        <button
          onClick={() => setBookingOpen(true)}
          className="inline-flex items-center gap-1 rounded-lg bg-[#0f3a32] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[#0d2e27]"
        >
          <Plus className="h-3.5 w-3.5" />
          发起预约
        </button>
      </div>

      {/* 预约记录 */}
      <div>
        <h4 className="mb-2 text-xs font-semibold text-slate-500">我的预约记录</h4>
        {appointments.length === 0 ? (
          <EmptyState title="暂无预约" description="可发起一对一辅导或材料审核预约" />
        ) : (
          <div className="grid gap-2">
            {appointments.map((ap) => (
              <motion.div
                key={ap.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0f3a32]/5">
                    <CalendarClock className="h-4 w-4 text-[#2e7066]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{ap.type}</p>
                    <p className="text-[10px] text-slate-400">
                      {formatTime(ap.time)} · {ap.counselor} · {ap.notes}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {ap.status === 'upcoming' && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">
                      <Clock className="h-3 w-3" />
                      待开始
                    </span>
                  )}
                  {ap.status === 'completed' && (
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      已完成
                    </span>
                  )}
                  {ap.status === 'cancelled' && (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">已取消</span>
                  )}
                  {ap.status === 'upcoming' && (
                    <button
                      onClick={() => cancelAppointment(ap.id)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* 活动报名 */}
      <div>
        <h4 className="mb-2 text-xs font-semibold text-slate-500">人才活动报名</h4>
        {activities.length === 0 ? (
          <EmptyState title="暂无报名" description="科创沙龙、政策宣讲等活动报名后将展示在这里" />
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {activities.map((ac) => {
              const cfg = activityTypeConfig[ac.type];
              return (
                <motion.div
                  key={ac.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#0f3a32]/5 px-2 py-0.5 text-[10px] font-medium text-[#2e7066]">
                      {cfg.icon}
                      {cfg.label}
                    </span>
                    {ac.status === 'registered' && (
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">已报名</span>
                    )}
                    {ac.status === 'checked_in' && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-green-600">已签到</span>
                    )}
                    {ac.status === 'cancelled' && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">已取消</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-slate-700">{ac.name}</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    <CalendarDays className="mr-1 inline h-3 w-3" />
                    {formatTime(ac.time)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    <MapPin className="mr-1 inline h-3 w-3" />
                    {ac.location}
                  </p>
                  {ac.status === 'registered' && (
                    <button
                      onClick={() => cancelActivityRegistration(ac.id)}
                      className="mt-2 w-full rounded-lg border border-slate-200 py-1 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      取消报名
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} title="发起线下辅导预约">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">辅导类型</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2e7066] focus:bg-white"
            >
              <option>一对一人才辅导</option>
              <option>材料审核辅导</option>
              <option>政策申报辅导</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">日期</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2e7066] focus:bg-white"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">时间</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2e7066] focus:bg-white"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">备注</label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-[#2e7066] focus:bg-white"
            />
          </div>
          <button
            onClick={handleBook}
            disabled={!form.date || !form.time}
            className="w-full rounded-xl bg-[#0f3a32] py-2.5 text-sm font-medium text-white transition hover:bg-[#0d2e27] disabled:cursor-not-allowed disabled:opacity-50"
          >
            提交预约
          </button>
        </div>
      </Modal>
    </div>
  );
};
