import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Download, User, Calendar, GraduationCap, Briefcase, FileCheck, X, CheckCircle2, AlertTriangle, XCircle, Lightbulb, Shield, Sparkles } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { MatchResult, Policy } from '../../types';
import { POLICIES } from '../../data/policies';

interface FullReportModalProps {
  open: boolean;
  onClose: () => void;
}

interface ProfileField {
  label: string;
  value: string;
  source: '简历识别' | '对话补充' | '待确认';
}

interface PolicyDiagnosis {
  name: string;
  status: '完全符合' | '部分达标' | '暂不匹配';
  satisfied: string[];
  pending: string[];
  unmet: string[];
  suggestion: string;
}

interface GapItem {
  category: string;
  items: {
    name: string;
    impact: string;
    value: string;
    priority: string;
    action: string;
  }[];
}

interface TodoItem {
  title: string;
  priority: '高' | '中' | '低';
  materials: string;
  channel: string;
  done: boolean;
}

export const FullReportModal: React.FC<FullReportModalProps> = ({ open, onClose }) => {
  const { state, showToast } = useApp();
  const { profile, quizAnswers, matchResults, completeness } = state;

  const generateTime = useMemo(() => new Date().toLocaleString('zh-CN'), []);

  const fullMatchCount = matchResults.filter((r) => r.matchLevel === 'high').length;
  const partialMatchCount = matchResults.filter((r) => r.matchLevel === 'medium').length;
  const lowMatchCount = matchResults.filter((r) => r.matchLevel === 'low' || r.matchLevel === 'none').length;

  const topDirection = matchResults.length > 0 ? matchResults[0].policyName : '人才租房补贴 / 青年人才计划';

  // Profile fields
  const profileFields: ProfileField[] = [
    { label: '姓名', value: profile.name || '待确认', source: profile.name ? '简历识别' : '待确认' },
    { label: '年龄', value: profile.age > 0 ? `${profile.age}岁` : '待确认', source: profile.age > 0 ? '简历识别' : '待确认' },
    { label: '学历', value: profile.education || '待确认', source: profile.education ? '简历识别' : '待确认' },
    { label: '专业方向', value: profile.major || '待确认', source: profile.major ? '简历识别' : '待确认' },
    { label: '行业方向', value: profile.industry || '待确认', source: profile.industry ? '简历识别' : '待确认' },
    { label: '当前身份', value: profile.currentRole || '待确认', source: profile.currentRole ? '简历识别' : '待确认' },
    { label: '工作区域', value: profile.workArea || (quizAnswers.workInXuhui === '是' ? '徐汇区' : '待确认'), source: profile.workArea ? '简历识别' : quizAnswers.workInXuhui ? '对话补充' : '待确认' },
    { label: '公司阶段', value: profile.companyStage || '待确认', source: profile.companyStage ? '简历识别' : '待确认' },
    { label: '社保情况', value: quizAnswers.socialInsurance || '待确认', source: quizAnswers.socialInsurance ? '对话补充' : '待确认' },
    { label: '租房情况', value: quizAnswers.renting || '待确认', source: quizAnswers.renting ? '对话补充' : '待确认' },
    { label: '成果情况', value: profile.achievements.length > 0 && !profile.achievements.includes('暂无') ? profile.achievements.join('、') : '暂无', source: profile.achievements.length > 0 ? '简历识别' : '待确认' },
  ];

  // Policy diagnosis
  const policyDiagnoses: PolicyDiagnosis[] = useMemo(() => {
    const examples = ['徐汇区人才租房补贴', '徐汇区光启人才计划青年项目', '上海市人才引进相关政策'];
    return matchResults.slice(0, 3).map((result: MatchResult) => {
      const policy = POLICIES.find((p: Policy) => p.id === result.policyId);
      const name = result.policyName || policy?.name || examples[matchResults.indexOf(result)] || '政策诊断';
      let status: '完全符合' | '部分达标' | '暂不匹配' = '部分达标';
      if (result.matchLevel === 'high') status = '完全符合';
      else if (result.matchLevel === 'medium') status = '部分达标';
      else status = '暂不匹配';
      return {
        name,
        status,
        satisfied: result.satisfiedConditions.length > 0 ? result.satisfiedConditions : ['基础信息已录入'],
        pending: result.pendingConditions.length > 0 ? result.pendingConditions : ['部分条件需进一步确认'],
        unmet: result.matchLevel === 'low' || result.matchLevel === 'none' ? ['关键条件未满足'] : [],
        suggestion: result.suggestion || '建议按政策要求准备材料并关注申报窗口',
      };
    });
  }, [matchResults]);

  // Gap ledger
  const gapCategories: GapItem[] = useMemo(() => {
    const socialGaps: GapItem['items'] = [];
    if (quizAnswers.socialInsurance !== '已缴纳') {
      socialGaps.push({
        name: '社保连续缴纳记录',
        impact: '人才租房补贴、人才引进',
        value: '影响多项政策申报资格',
        priority: '高',
        action: '联系 HR 或社保中心查询连续缴纳记录',
      });
    }
    const rentingGaps: GapItem['items'] = [];
    if (quizAnswers.renting !== '是') {
      rentingGaps.push({
        name: '租房合同及租赁备案',
        impact: '人才租房补贴',
        value: '租房补贴必备材料',
        priority: '高',
        action: '签订租赁合同并办理网签备案',
      });
    }
    const achievementGaps: GapItem['items'] = [];
    if (profile.achievements.length === 0 || profile.achievements.includes('暂无')) {
      achievementGaps.push({
        name: '专利、论文、获奖或项目成果',
        impact: '光启人才计划、领军人才评选',
        value: '提升高层次政策竞争力',
        priority: '中',
        action: '整理现有成果，规划新增专利/论文',
      });
    }
    const companyGaps: GapItem['items'] = [];
    if (quizAnswers.workInXuhui !== '是') {
      companyGaps.push({
        name: '单位在徐汇注册/办公证明',
        impact: '徐汇区人才政策',
        value: '部分区级政策仅限注册在徐汇单位',
        priority: '高',
        action: '确认单位注册地址及纳税关系',
      });
    }
    return [
      { category: '社保类', items: socialGaps.length > 0 ? socialGaps : [{ name: '社保记录基本符合', impact: '-', value: '已满足多数政策要求', priority: '低', action: '保持连续缴纳' }] },
      { category: '成果专利类', items: achievementGaps.length > 0 ? achievementGaps : [{ name: '成果材料已具备', impact: '-', value: '已满足当前匹配政策', priority: '低', action: '持续补充高层次成果' }] },
      { category: '企业资质类', items: companyGaps.length > 0 ? companyGaps : [{ name: '单位资质已确认', impact: '-', value: '工作单位在徐汇区域', priority: '低', action: '关注企业资质变化' }] },
      { category: '租房备案类', items: rentingGaps.length > 0 ? rentingGaps : [{ name: '租房备案已具备', impact: '-', value: '可申请租房补贴', priority: '低', action: '保持备案有效' }] },
    ].filter((g) => g.items.length > 0);
  }, [profile.achievements, quizAnswers.renting, quizAnswers.socialInsurance, quizAnswers.workInXuhui]);

  // Short-term plan (1-3 months)
  const shortTermTodos: TodoItem[] = [
    { title: '确认社保缴纳记录', priority: '高', materials: '身份证、社保卡', channel: '上海人社 APP / 单位 HR', done: quizAnswers.socialInsurance === '已缴纳' },
    { title: '补充租赁合同和租赁备案', priority: '高', materials: '租赁合同、房东证件、房屋产权证', channel: '区住房租赁服务中心', done: quizAnswers.renting === '是' },
    { title: '确认单位申报资质', priority: '高', materials: '单位营业执照、纳税证明', channel: '单位 HR / 园区服务窗口', done: quizAnswers.workInXuhui === '是' },
    { title: '整理学历学位证明', priority: '中', materials: '学历学位证书、学信网验证', channel: '学信网 / 学校档案馆', done: !!profile.education },
    { title: '联系单位 HR 或园区服务窗口', priority: '中', materials: '政策咨询清单', channel: '徐汇区人才服务窗口', done: false },
  ];

  // Long-term plan (6-12 months)
  const longTermItems = [
    '整理项目成果说明，量化产品落地数据（用户增长、营收规模等）',
    '补充专利、论文、获奖或融资材料，提升成果厚度',
    '参与区级创新创业活动、创业大赛或产业对接会',
    '准备职称评审或职业资格材料',
    '优化简历成果表达，突出与目标政策相关的关键词',
    '积累可量化的产品落地数据，形成系统性业绩证明',
  ];

  const handleDownload = () => {
    showToast('已生成《徐汇人才资质综合分析与提升规划报告》PDF文件。');
    setTimeout(() => window.print(), 400);
  };

  const statusBadge = (status: '完全符合' | '部分达标' | '暂不匹配') => {
    if (status === '完全符合') return { class: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 };
    if (status === '部分达标') return { class: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertTriangle };
    return { class: 'bg-red-50 text-red-700 border-red-200', icon: XCircle };
  };

  const sourceBadge = (source: ProfileField['source']) => {
    if (source === '简历识别') return 'bg-green-50 text-green-700';
    if (source === '对话补充') return 'bg-blue-50 text-blue-700';
    return 'bg-slate-100 text-slate-500';
  };

  const priorityBadge = (p: string) => {
    if (p === '高') return 'bg-red-50 text-red-700';
    if (p === '中') return 'bg-amber-50 text-amber-700';
    return 'bg-slate-100 text-slate-600';
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-slate-100 print:bg-white"
        >
          {/* Fixed top bar */}
          <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 print:hidden md:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <ArrowLeft className="h-4 w-4" />
                返回结果页
              </button>
              <div className="h-5 w-px bg-slate-200" />
              <span className="text-sm font-semibold text-slate-700">徐汇人才资质综合分析与提升规划报告</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-lg bg-[#0f3a32] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#16433b]"
              >
                <Download className="h-4 w-4" />
                下载报告
              </button>
            </div>
          </div>

          {/* Scrollable report content */}
          <div className="flex-1 overflow-y-auto print:overflow-visible">
            <div className="mx-auto min-h-full max-w-5xl bg-white p-6 shadow-sm print:p-0 print:shadow-none md:p-10">
              {/* Cover */}
              <section className="mb-12 border-b border-slate-200 pb-12">
                <div className="mb-8 rounded-2xl border border-slate-200 bg-gradient-to-br from-[#0f3a32] to-[#2e7066] p-8 text-center text-white md:p-12">
                  <h1 className="text-2xl font-bold md:text-4xl">徐汇人才资质综合分析与提升规划报告</h1>
                  <p className="mt-4 text-sm text-white/80 md:text-base">由汇知道 AI 人才政策自查助手生成</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-slate-400" />
                      <span className="text-sm text-slate-500">申请者姓名</span>
                      <span className="ml-auto text-sm font-semibold text-slate-800">{profile.name || '待确认'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-5 w-5 text-slate-400" />
                      <span className="text-sm text-slate-500">人才类型</span>
                      <span className="ml-auto text-sm font-semibold text-slate-800">{profile.talentType || '待确认'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-5 w-5 text-slate-400" />
                      <span className="text-sm text-slate-500">重点方向</span>
                      <span className="ml-auto text-sm font-semibold text-slate-800">{profile.industry || '待确认'}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-slate-400" />
                      <span className="text-sm text-slate-500">生成时间</span>
                      <span className="ml-auto text-sm font-semibold text-slate-800">{generateTime}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FileCheck className="h-5 w-5 text-slate-400" />
                      <span className="text-sm text-slate-500">信息完整度</span>
                      <span className="ml-auto text-sm font-semibold text-slate-800">{completeness}%</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* 1. Profile */}
              <section className="mb-10">
                <h2 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-2 text-xl font-bold text-[#0f3a32]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f3a32] text-sm text-white">一</span>
                  人才基础画像
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {profileFields.map((field, index) => (
                    <div key={index} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs text-slate-400">{field.label}</span>
                        <span className={`rounded px-2 py-0.5 text-[10px] font-medium ${sourceBadge(field.source)}`}>{field.source}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-800">{field.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 2. Policy match overview */}
              <section className="mb-10">
                <h2 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-2 text-xl font-bold text-[#0f3a32]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f3a32] text-sm text-white">二</span>
                  政策匹配总览
                </h2>
                <div className="mb-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-center">
                    <p className="text-2xl font-bold text-green-700">{fullMatchCount}</p>
                    <p className="text-xs text-green-700">完全符合政策</p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                    <p className="text-2xl font-bold text-amber-700">{partialMatchCount}</p>
                    <p className="text-xs text-amber-700">部分达标政策</p>
                  </div>
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                    <p className="text-2xl font-bold text-slate-600">{lowMatchCount}</p>
                    <p className="text-xs text-slate-600">暂不匹配政策</p>
                  </div>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-800">推荐优先申请方向</span>
                  </div>
                  <p className="text-sm text-blue-700">{topDirection}</p>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">
                  综合判断：你当前共匹配到 {matchResults.length} 项政策，其中 {fullMatchCount} 项完全符合、{partialMatchCount} 项部分达标。建议优先聚焦「{topDirection}」，在短期内补齐关键材料后即可启动申报。
                </p>
              </section>

              {/* 3. Policy diagnosis */}
              <section className="mb-10">
                <h2 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-2 text-xl font-bold text-[#0f3a32]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f3a32] text-sm text-white">三</span>
                  分政策诊断
                </h2>
                <div className="space-y-4">
                  {policyDiagnoses.map((policy, index) => {
                    const badge = statusBadge(policy.status);
                    return (
                      <div key={index} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 p-4">
                          <h3 className="font-semibold text-slate-800">{policy.name}</h3>
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${badge.class}`}>
                            <badge.icon className="h-3.5 w-3.5" />
                            {policy.status}
                          </span>
                        </div>
                        <div className="p-4">
                          <div className="mb-3">
                            <p className="mb-1 text-xs font-semibold text-green-700">已满足条件</p>
                            <ul className="space-y-1">
                              {policy.satisfied.map((c, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-sm text-slate-600">
                                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                                  {c}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="mb-3">
                            <p className="mb-1 text-xs font-semibold text-amber-700">待确认条件</p>
                            <ul className="space-y-1">
                              {policy.pending.map((c, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-sm text-slate-600">
                                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                                  {c}
                                </li>
                              ))}
                            </ul>
                          </div>
                          {policy.unmet.length > 0 && (
                            <div className="mb-3">
                              <p className="mb-1 text-xs font-semibold text-red-700">暂不满足条件</p>
                              <ul className="space-y-1">
                                {policy.unmet.map((c, i) => (
                                  <li key={i} className="flex items-start gap-1.5 text-sm text-slate-600">
                                    <XCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-500" />
                                    {c}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          <div className="rounded-lg bg-[#c8a96e]/10 p-3">
                            <p className="text-xs font-semibold text-[#9a7e4e]">申报建议</p>
                            <p className="mt-1 text-sm text-slate-700">{policy.suggestion}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 4. Gap ledger */}
              <section className="mb-10">
                <h2 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-2 text-xl font-bold text-[#0f3a32]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f3a32] text-sm text-white">四</span>
                  资质缺口台账
                </h2>
                <div className="space-y-5">
                  {gapCategories.map((category, index) => (
                    <div key={index}>
                      <h3 className="mb-2 text-sm font-bold text-slate-700">{category.category}</h3>
                      <div className="space-y-2">
                        {category.items.map((item, i) => (
                          <div key={i} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-12 md:items-center">
                            <div className="md:col-span-3">
                              <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                              <p className="text-xs text-slate-400">影响：{item.impact}</p>
                            </div>
                            <div className="md:col-span-3">
                              <p className="text-xs text-slate-400">补齐价值</p>
                              <p className="text-sm text-slate-700">{item.value}</p>
                            </div>
                            <div className="md:col-span-1">
                              <span className={`rounded px-2 py-0.5 text-xs font-medium ${priorityBadge(item.priority)}`}>{item.priority}优先级</span>
                            </div>
                            <div className="md:col-span-5">
                              <p className="text-xs text-slate-400">建议动作</p>
                              <p className="text-sm text-slate-700">{item.action}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 5. Short-term plan */}
              <section className="mb-10">
                <h2 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-2 text-xl font-bold text-[#0f3a32]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f3a32] text-sm text-white">五</span>
                  短期提升规划（1-3 个月）
                </h2>
                <div className="space-y-3">
                  {shortTermTodos.map((todo, index) => (
                    <div key={index} className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className={`rounded px-2 py-0.5 text-xs font-medium ${priorityBadge(todo.priority)}`}>{todo.priority}优先级</span>
                        <span className="text-sm font-semibold text-slate-800">{todo.title}</span>
                        {todo.done && <span className="ml-auto text-xs font-medium text-green-600">已完成</span>}
                      </div>
                      <div className="grid gap-2 text-sm text-slate-600 md:grid-cols-2">
                        <p><span className="text-slate-400">所需材料：</span>{todo.materials}</p>
                        <p><span className="text-slate-400">建议渠道：</span>{todo.channel}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* 6. Long-term plan */}
              <section className="mb-10">
                <h2 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-2 text-xl font-bold text-[#0f3a32]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f3a32] text-sm text-white">六</span>
                  中长期提升规划（6-12 个月）
                </h2>
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <ul className="space-y-3">
                    {longTermItems.map((item, index) => (
                      <li key={index} className="flex items-start gap-3 text-sm text-slate-700">
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#0f3a32]/10 text-xs font-bold text-[#2e7066]">
                          {index + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* 7. AI suggestion */}
              <section className="mb-10">
                <h2 className="mb-5 flex items-center gap-2 border-b border-slate-200 pb-2 text-xl font-bold text-[#0f3a32]">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f3a32] text-sm text-white">七</span>
                  AI 综合建议
                </h2>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-800">AI 综合建议</span>
                  </div>
                  <p className="text-sm leading-relaxed text-blue-700">
                    根据当前画像，你最适合优先关注「{topDirection}」。目前最关键的短板是
                    {gapCategories.flatMap((g) => g.items).filter((g) => g.priority === '高').length > 0
                      ? '社保记录、租房备案及单位资质等基础条件'
                      : '成果类材料与高层次业绩证明'}
                    ，建议下一步先完成这些事项的确认与补齐。中长期来看，通过补充专利、论文、项目获奖及量化业绩数据，可显著提升未来申报更高层级人才政策的竞争力。
                  </p>
                </div>
              </section>

              {/* Disclaimer */}
              <section className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
                  <p className="text-xs leading-relaxed text-slate-500">
                    本报告由 AI 自动生成，仅用于申报前自查和准备参考，不代表官方审核结果。最终资格认定、申报条件和材料要求，以主管部门、官方政策文件和申报系统为准。
                  </p>
                </div>
              </section>

              {/* Bottom actions (mobile / print fallback) */}
              <div className="flex justify-end gap-3 print:hidden">
                <button
                  onClick={onClose}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  返回结果页
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 rounded-xl bg-[#0f3a32] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#16433b]"
                >
                  <Download className="h-4 w-4" />
                  下载报告
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
