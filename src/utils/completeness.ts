import { TalentProfile, QuizAnswer, CompletenessItem } from '../types';

/**
 * 计算信息完整度百分比。
 * OCR 完成后基础 70%，每答一道追问题增加约 3%，最高 90%。
 */
export function calculate(profile: TalentProfile, quiz?: QuizAnswer): number {
  let score = 0;
  const quizData = quiz || {
    socialInsurance: '',
    renting: '',
    workInXuhui: '',
    achievements: [],
    overseasExp: '',
    startupIntent: '',
    policyInterest: '',
  };

  // Profile 基础信息（最高 70%）
  if (profile.name) score += 8;
  if (profile.age > 0) score += 5;
  if (profile.education) score += 8;
  if (profile.major) score += 6;
  if (profile.currentRole) score += 6;
  if (profile.workArea) score += 5;
  if (profile.companyStage) score += 5;
  if (profile.industry) score += 6;
  if (profile.projectExp) score += 5;
  if (profile.talentType) score += 5;
  if (profile.highlights) score += 4;
  if (profile.achievements.length > 0) score += 7;

  // 限制 profile 部分最高 70%
  if (score > 70) score = 70;

  // 追问答案（每题约 3%，最高 90%）
  let quizScore = 0;
  if (quizData.socialInsurance) quizScore += 3;
  if (quizData.renting) quizScore += 3;
  if (quizData.workInXuhui) quizScore += 3;
  if (quizData.achievements.length > 0) quizScore += 3;
  if (quizData.overseasExp) quizScore += 3;
  if (quizData.startupIntent) quizScore += 3;
  if (quizData.policyInterest) quizScore += 2;

  score += quizScore;
  if (score > 90) score = 90;

  return Math.round(score);
}

/**
 * 获取完整度明细项列表。
 */
export function getBreakdown(profile: TalentProfile, quiz?: QuizAnswer): CompletenessItem[] {
  const quizData = quiz || {
    socialInsurance: '',
    renting: '',
    workInXuhui: '',
    achievements: [],
    overseasExp: '',
    startupIntent: '',
    policyInterest: '',
  };
  const items: CompletenessItem[] = [
    { label: '姓名', filled: !!profile.name, weight: 8 },
    { label: '年龄', filled: profile.age > 0, weight: 5 },
    { label: '学历', filled: !!profile.education, weight: 8 },
    { label: '专业', filled: !!profile.major, weight: 6 },
    { label: '职位', filled: !!profile.currentRole, weight: 6 },
    { label: '工作区域', filled: !!profile.workArea, weight: 5 },
    { label: '公司阶段', filled: !!profile.companyStage, weight: 5 },
    { label: '行业领域', filled: !!profile.industry, weight: 6 },
    { label: '项目经验', filled: !!profile.projectExp, weight: 5 },
    { label: '人才类型', filled: !!profile.talentType, weight: 5 },
    { label: '简历亮点', filled: !!profile.highlights, weight: 4 },
    { label: '成果标签', filled: profile.achievements.length > 0, weight: 7 },
    { label: '社保缴纳情况', filled: !!quizData.socialInsurance, weight: 3 },
    { label: '租房状态', filled: !!quizData.renting, weight: 3 },
    { label: '徐汇工作', filled: !!quizData.workInXuhui, weight: 3 },
    { label: '成果补充', filled: quizData.achievements.length > 0, weight: 3 },
    { label: '海外经历', filled: !!quizData.overseasExp, weight: 3 },
    { label: '创业意向', filled: !!quizData.startupIntent, weight: 3 },
    { label: '政策偏好', filled: !!quizData.policyInterest, weight: 2 },
  ];
  return items;
}
