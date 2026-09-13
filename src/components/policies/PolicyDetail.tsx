import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Tag, Calendar, Building2, Target, CheckCircle2, Award, FileText, Link2, Heart, CalendarPlus, CheckCircle } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { POLICIES } from '../../data/policies';
import { mapPolicyCategoryToFavorite, parsePolicyDeadline, mapPolicyToActivityType, parseEventLocation } from '../../types';

export const PolicyDetail: React.FC = () => {
  const { nav, state, navigateBack, addFavorite, deleteFavorite, addActivityRegistration, cancelActivityRegistration, showToast } = useApp();
  const policy = POLICIES.find((p) => p.id === nav.policyDetailId);

  const isFavorite = state.favorites.some((f) => f.policyId === policy?.id);
  const registeredActivity = state.activities.find((a) => a.policyId === policy?.id);
  const isRegistered = !!registeredActivity && registeredActivity.status !== 'cancelled';
  const isEvent = policy?.category === '赛事活动';

  if (!policy) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-400">政策未找到</p>
      </div>
    );
  }

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      const fav = state.favorites.find((f) => f.policyId === policy.id);
      if (fav) {
        deleteFavorite(fav.id);
        showToast('已取消收藏');
      }
    } else {
      addFavorite({
        id: `fav-${Date.now()}`,
        policyId: policy.id,
        name: policy.name,
        category: mapPolicyCategoryToFavorite(policy.category),
        deadline: parsePolicyDeadline(policy),
        collectedAt: Date.now(),
      });
      showToast('已收藏该政策');
    }
  };

  const handleRegister = () => {
    if (isRegistered) {
      if (registeredActivity) {
        cancelActivityRegistration(registeredActivity.id);
        showToast('已取消报名');
      }
      return;
    }
    addActivityRegistration({
      id: `ac-${Date.now()}`,
      policyId: policy.id,
      name: policy.name,
      type: mapPolicyToActivityType(policy),
      time: parsePolicyDeadline(policy),
      location: parseEventLocation(policy),
      status: 'registered',
    });
    showToast('报名成功，请留意活动通知');
  };

  return (
    <div className="flex h-full flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={navigateBack}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 md:px-3 md:py-1.5 md:text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5 md:h-4 md:w-4" />
            返回
          </button>

          <button
            onClick={handleFavoriteToggle}
            title={isFavorite ? '取消收藏' : '收藏政策'}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              isFavorite
                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
            {isFavorite ? '已收藏' : '收藏'}
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto max-w-3xl space-y-4"
        >
          {/* Title section */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[#0f3a32]/5 px-2.5 py-0.5 text-xs font-medium text-[#2e7066]">
                <Tag className="h-3 w-3" />
                {policy.category}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
                {policy.subcategory}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-800">{policy.name}</h1>

            {/* Action bar */}
            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={handleFavoriteToggle}
                className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  isFavorite
                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
                {isFavorite ? '已收藏' : '收藏政策'}
              </button>

              {isEvent ? (
                <button
                  onClick={handleRegister}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    isRegistered
                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      : 'bg-[#2e7066] text-white hover:bg-[#256c5c]'
                  }`}
                >
                  {isRegistered ? (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      已报名
                    </>
                  ) : (
                    <>
                      <CalendarPlus className="h-4 w-4" />
                      立即报名
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => showToast('申报入口将在正式申报期开放，请留意通知')}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#c8a96e]/10 px-4 py-2 text-sm font-medium text-[#9a7e4e] transition hover:bg-[#c8a96e]/20"
                >
                  <CalendarPlus className="h-4 w-4" />
                  申报咨询
                </button>
              )}

              {isRegistered && (
                <button
                  onClick={handleRegister}
                  className="text-xs text-slate-400 underline transition hover:text-slate-600"
                >
                  取消报名
                </button>
              )}
            </div>

            {isRegistered && (
              <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">报名状态：已成功报名</span>
                </div>
                <p className="mt-1 text-xs text-emerald-600">
                  活动/赛事时间：{new Date(registeredActivity.time).toLocaleDateString('zh-CN')}，地点：{registeredActivity.location}
                </p>
              </div>
            )}
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Target */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <Target className="h-4 w-4 text-[#2e7066]" />
                <span className="text-xs font-semibold text-slate-500">适用对象</span>
              </div>
              <p className="text-sm text-slate-700">{policy.target}</p>
            </div>

            {/* Valid period */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#2e7066]" />
                <span className="text-xs font-semibold text-slate-500">有效期限</span>
              </div>
              <p className="text-sm text-slate-700">{policy.validPeriod}</p>
            </div>

            {/* Source */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#2e7066]" />
                <span className="text-xs font-semibold text-slate-500">发布来源</span>
              </div>
              <p className="text-sm text-slate-700">{policy.source}</p>
            </div>

            {/* Apply method */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#2e7066]" />
                <span className="text-xs font-semibold text-slate-500">申报方式</span>
              </div>
              <p className="text-sm text-slate-700">{policy.applyMethod}</p>
            </div>
          </div>

          {/* Conditions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h2 className="text-sm font-semibold text-slate-700">申报条件</h2>
            </div>
            <ul className="space-y-2">
              {policy.conditions.map((cond, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#2e7066]/70" />
                  {cond}
                </li>
              ))}
            </ul>
          </div>

          {/* Benefit */}
          <div className="rounded-2xl border border-[#c8a96e]/30 bg-[#c8a96e]/5 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <h2 className="text-sm font-semibold text-slate-700">补贴标准</h2>
            </div>
            <p className="text-sm leading-relaxed text-slate-700">{policy.benefit}</p>
          </div>

          {/* Keywords */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <Link2 className="h-5 w-5 text-slate-400" />
              <h2 className="text-sm font-semibold text-slate-700">关键词</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {policy.keywords.map((kw, index) => (
                <span key={index} className="rounded-full bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Match rules (for reference) */}
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-[10px] font-semibold text-slate-400">匹配规则（内部参考）</p>
            <p className="mt-1 text-xs text-slate-400">{policy.matchRules}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
