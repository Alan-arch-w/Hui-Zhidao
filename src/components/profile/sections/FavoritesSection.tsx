import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  Trash2,
  Bell,
  Filter,
  Check,
  Home,
  Rocket,
  Crown,
  MapPin,
} from 'lucide-react';
import { useApp } from '../../../store/AppContext';
import { EmptyState } from '../shared/EmptyState';
import { Countdown } from '../shared/Countdown';
import { Switch } from '../shared/Switch';
import { Modal } from '../shared/Modal';
import { FavoritePolicy, Notification } from '../../../types';

const categoryConfig: Record<FavoritePolicy['category'], { label: string; icon: React.ReactNode; color: string }> = {
  renting: { label: '租房补贴', icon: <Home className="h-3 w-3" />, color: 'text-blue-600 bg-blue-50' },
  startup: { label: '创业扶持', icon: <Rocket className="h-3 w-3" />, color: 'text-emerald-600 bg-emerald-50' },
  leading: { label: '领军评选', icon: <Crown className="h-3 w-3" />, color: 'text-amber-600 bg-amber-50' },
  hukou: { label: '落户政策', icon: <MapPin className="h-3 w-3" />, color: 'text-purple-600 bg-purple-50' },
};

const industries = ['人工智能', '生物医药', '集成电路', '金融科技', '文化创意', '高端制造'];
const talentLevels = ['青年人才', '领军人才', '高层次人才', '海外人才', '创业人才'];

export const FavoritesSection: React.FC = () => {
  const { state, deleteFavorite, updateSubscription, markNotificationRead, markAllNotificationsRead, openPolicyDetail } = useApp();
  const { favorites, subscription, notifications } = state;
  const [activeGroup, setActiveGroup] = useState<FavoritePolicy['category'] | 'all'>('all');
  const [subOpen, setSubOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);

  const filtered = activeGroup === 'all' ? favorites : favorites.filter((f) => f.category === activeGroup);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const toggleIndustry = (ind: string) => {
    const set = new Set(subscription.industries);
    if (set.has(ind)) set.delete(ind);
    else set.add(ind);
    updateSubscription({ ...subscription, industries: Array.from(set) });
  };

  const toggleTalentLevel = (level: string) => {
    const set = new Set(subscription.talentLevels);
    if (set.has(level)) set.delete(level);
    else set.add(level);
    updateSubscription({ ...subscription, talentLevels: Array.from(set) });
  };

  return (
    <div className="space-y-5">
      {/* 收藏政策 */}
      <div>
        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="text-base font-semibold text-slate-800">政策收藏</h3>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveGroup('all')}
              className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition ${
                activeGroup === 'all' ? 'bg-[#0f3a32] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              全部
            </button>
            {(Object.keys(categoryConfig) as FavoritePolicy['category'][]).map((key) => (
              <button
                key={key}
                onClick={() => setActiveGroup(key)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition ${
                  activeGroup === key ? 'bg-[#0f3a32] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {categoryConfig[key].label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="暂无收藏政策" description="在政策库中收藏的政策会按类别分组展示" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((fav, index) => {
              const cfg = categoryConfig[fav.category];
              return (
                <motion.div
                  key={fav.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.color}`}>
                      {cfg.icon}
                      {cfg.label}
                    </span>
                    <Countdown targetTime={fav.deadline} />
                  </div>
                  <h4 className="mb-3 text-sm font-semibold text-slate-800">{fav.name}</h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openPolicyDetail(fav.policyId)}
                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-slate-200 py-1.5 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      <ExternalLink className="h-3 w-3" />
                      查看原文
                    </button>
                    <button
                      onClick={() => deleteFavorite(fav.id)}
                      className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* 订阅与通知 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">订阅与通知</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setNotifyOpen(true)}
              className="relative inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[10px] font-medium text-slate-600 transition hover:bg-slate-50"
            >
              <Bell className="h-3.5 w-3.5" />
              消息面板
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] text-white">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setSubOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-[#0f3a32] px-2.5 py-1.5 text-[10px] font-medium text-white transition hover:bg-[#0d2e27]"
            >
              <Filter className="h-3.5 w-3.5" />
              订阅设置
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          <span>已订阅产业：</span>
          {subscription.industries.map((i) => (
            <span key={i} className="rounded-full bg-[#0f3a32]/5 px-2 py-0.5 text-[10px] text-[#2e7066]">
              {i}
            </span>
          ))}
          <span className="ml-2">已订阅层级：</span>
          {subscription.talentLevels.map((l) => (
            <span key={l} className="rounded-full bg-[#0f3a32]/5 px-2 py-0.5 text-[10px] text-[#2e7066]">
              {l}
            </span>
          ))}
          <span className="ml-2 inline-flex items-center gap-1">
            推送：
            <Switch
              checked={subscription.pushEnabled}
              onChange={(checked) => updateSubscription({ ...subscription, pushEnabled: checked })}
              size="sm"
            />
          </span>
        </div>
      </div>

      <Modal isOpen={subOpen} onClose={() => setSubOpen(false)} title="订阅设置">
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-slate-600">产业赛道</p>
            <div className="flex flex-wrap gap-2">
              {industries.map((ind) => (
                <button
                  key={ind}
                  onClick={() => toggleIndustry(ind)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-medium transition ${
                    subscription.industries.includes(ind)
                      ? 'bg-[#0f3a32] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {subscription.industries.includes(ind) && <Check className="h-3 w-3" />}
                  {ind}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-slate-600">人才层级</p>
            <div className="flex flex-wrap gap-2">
              {talentLevels.map((level) => (
                <button
                  key={level}
                  onClick={() => toggleTalentLevel(level)}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-medium transition ${
                    subscription.talentLevels.includes(level)
                      ? 'bg-[#0f3a32] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {subscription.talentLevels.includes(level) && <Check className="h-3 w-3" />}
                  {level}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => setSubOpen(false)}
            className="w-full rounded-xl bg-[#0f3a32] py-2.5 text-sm font-medium text-white transition hover:bg-[#0d2e27]"
          >
            完成
          </button>
        </div>
      </Modal>

      <Modal isOpen={notifyOpen} onClose={() => setNotifyOpen(false)} title="消息通知" maxWidth="max-w-lg">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs text-slate-400">共 {notifications.length} 条通知</span>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllNotificationsRead()}
              className="text-xs font-medium text-[#2e7066] hover:underline"
            >
              全部标为已读
            </button>
          )}
        </div>
        <div className="max-h-[50vh] space-y-2 overflow-y-auto pr-1">
          {notifications.map((n: Notification) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`cursor-pointer rounded-xl border p-3 transition ${
                n.read ? 'border-slate-100 bg-slate-50' : 'border-[#2e7066]/20 bg-[#0f3a32]/[0.02]'
              }`}
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">{n.title}</span>
                {!n.read && <span className="h-2 w-2 rounded-full bg-red-500" />}
              </div>
              <p className="text-xs leading-relaxed text-slate-500">{n.content}</p>
              <p className="mt-1 text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleString('zh-CN')}</p>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};
