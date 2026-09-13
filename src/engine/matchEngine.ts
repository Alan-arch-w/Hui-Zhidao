import { TalentProfile, QuizAnswer, MatchResult, MatchLevel } from '../types';

const KEY_INDUSTRIES = ['AI', '人工智能', '集成电路', '生物医药', '软件', '高端装备', '航空航天', '先进材料', '新能源', '科技'];

function hasKeyword(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k.toLowerCase()));
}

function isKeyIndustry(industry: string): boolean {
  return hasKeyword(industry, KEY_INDUSTRIES);
}

function isStartupRelated(profile: TalentProfile): boolean {
  return (
    profile.currentRole.includes('创业') ||
    profile.companyStage.includes('创业') ||
    profile.companyStage.includes('创始人')
  );
}

function hasHighEducation(education: string): boolean {
  return hasKeyword(education, ['本科', '硕士', '博士']);
}

function hasOverseasStudy(quiz: QuizAnswer): boolean {
  return quiz.overseasExp.includes('海外留学');
}

function hasOverseasWork(quiz: QuizAnswer): boolean {
  return quiz.overseasExp.includes('海外工作');
}

function scoreToLevel(score: number): MatchLevel {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  if (score >= 20) return 'low';
  return 'none';
}

// ===================================================================
// Individual policy matchers
// ===================================================================

function matchP001(profile: TalentProfile, quiz: QuizAnswer): MatchResult {
  let score = 0;
  const satisfied: string[] = [];
  const pending: string[] = [];

  if (profile.age > 0 && profile.age <= 35) {
    score += 30;
    satisfied.push('年龄35周岁及以下');
  } else if (profile.age > 35) {
    pending.push('年龄超过35周岁（部分子项不适用）');
  } else {
    pending.push('年龄信息需确认');
    score += 10;
  }

  if (isStartupRelated(profile)) {
    score += 40;
    satisfied.push('有创业/创业公司经历');
  } else {
    pending.push('需确认是否为首次创业及法定代表人身份');
  }

  if (quiz.socialInsurance === '已缴纳') {
    score += 15;
    satisfied.push('已连续缴纳社保');
  } else {
    pending.push('社保缴纳记录需确认');
  }

  if (profile.achievements.includes('融资') || hasKeyword(profile.highlights, ['技能', '学徒', '见习'])) {
    score += 15;
    satisfied.push('有技能培训/融资相关经历');
  } else {
    pending.push('技能培训或融资经历可补充');
  }

  return {
    policyId: 'P001',
    policyName: '徐汇区稳就业提技能助创业补贴政策（2025-2027年）',
    matchLevel: scoreToLevel(score),
    matchScore: score,
    status: 'normal',
    satisfiedConditions: satisfied,
    pendingConditions: pending,
    suggestion: isStartupRelated(profile)
      ? '你符合创业补贴基本条件，建议确认首次创业身份和社保稳定就业时长后申报首次创业一次性补贴。'
      : '若有创业计划，可关注创业见习生活费补贴和创业担保贷款贴息。',
  };
}

function matchP002(profile: TalentProfile, quiz: QuizAnswer): MatchResult {
  let score = 0;
  const satisfied: string[] = [];
  const pending: string[] = [];

  if (hasHighEducation(profile.education)) {
    score += 25;
    satisfied.push(`${profile.education}及以上学历，符合个人条件`);
  } else if (profile.education) {
    pending.push('学历需满足本科及以上（高校院所/三甲医院需硕士+）');
  } else {
    pending.push('学历信息需确认');
  }

  if (quiz.renting === '是') {
    score += 30;
    satisfied.push('在上海租房');
  } else if (quiz.renting === '不确定') {
    score += 10;
    pending.push('租房状态需确认');
  } else {
    pending.push('需在沪租房并网签备案');
  }

  if (quiz.workInXuhui === '是') {
    score += 20;
    satisfied.push('工作单位在徐汇区');
  } else if (quiz.workInXuhui === '不确定') {
    score += 5;
    pending.push('工作单位是否在徐汇区需确认');
  } else {
    pending.push('工作单位需注册或办公在徐汇区');
  }

  if (isKeyIndustry(profile.industry)) {
    score += 25;
    satisfied.push('行业符合重点产业导向');
  } else {
    pending.push('用人单位是否符合重点产业导向需确认');
  }

  pending.push('需确认本人及配偶及未成年子女在沪无产权住房');
  pending.push('需由用人单位统一申报（不接受个人申报）');

  return {
    policyId: 'P002',
    policyName: '2026年度徐汇区人才租房补贴',
    matchLevel: scoreToLevel(score),
    matchScore: score,
    status: 'normal',
    satisfiedConditions: satisfied,
    pendingConditions: pending,
    suggestion: '建议确认用人单位资质及租赁合同网签备案情况，由单位统一申报。',
  };
}

function matchP003(profile: TalentProfile, quiz: QuizAnswer): MatchResult {
  let score = 0;
  const satisfied: string[] = [];
  const pending: string[] = [];

  if (hasOverseasStudy(quiz)) {
    score += 50;
    satisfied.push('有海外留学经历');
  } else if (hasOverseasWork(quiz)) {
    score += 25;
    pending.push('有海外工作经历，需确认是否符合留学人员身份');
  } else {
    pending.push('需具备海外留学人员身份');
  }

  if (profile.age > 0 && profile.age <= 45) {
    score += 30;
    satisfied.push('年龄45岁以下');
  } else if (profile.age > 45) {
    pending.push('年龄超过45周岁');
  } else {
    pending.push('年龄需确认（45岁以下）');
    score += 10;
  }

  if (score > 0) {
    score += 20;
    satisfied.push('有意向来沪工作/创业');
  }

  return {
    policyId: 'P003',
    policyName: '2025年度上海市白玉兰人才计划浦江项目',
    matchLevel: scoreToLevel(score),
    matchScore: score,
    status: 'reference',
    satisfiedConditions: satisfied,
    pendingConditions: pending,
    suggestion: hasOverseasStudy(quiz)
      ? '建议准备留学归国证明、学位认证等材料，通过上海国际人才网申报。'
      : '需确认海外留学身份后评估申报资格。',
  };
}

function matchP004(profile: TalentProfile, _quiz: QuizAnswer): MatchResult {
  let score = 0;
  const satisfied: string[] = [];
  const pending: string[] = [];

  if (isKeyIndustry(profile.industry)) {
    score += 40;
    satisfied.push(`行业属于重点产业领域（${profile.industry}）`);
  } else {
    pending.push('行业需属于8大重点产业领域');
  }

  pending.push('工资薪金需≥30万或超单位平均1.5倍（需确认）');

  if (profile.achievements.includes('专利') || profile.achievements.includes('论文')) {
    score += 15;
    satisfied.push('有知识产权/学术成果');
  } else {
    pending.push('企业需有相关知识产权，个人可补充成果');
  }

  pending.push('企业研发投入3年平均增长需≥5%');
  pending.push('需全年在本企业工作并在本市纳税');

  return {
    policyId: 'P004',
    policyName: '2023年度重点产业领域人才专项奖励',
    matchLevel: scoreToLevel(score),
    matchScore: score,
    status: 'reference',
    satisfiedConditions: satisfied,
    pendingConditions: pending,
    suggestion: '建议由企业为主体申报，确认薪资水平和企业研发投入情况。',
  };
}

function matchP005(profile: TalentProfile, quiz: QuizAnswer): MatchResult {
  let score = 0;
  const satisfied: string[] = [];
  const pending: string[] = [];

  if (profile.age > 0 && profile.age <= 30) {
    score += 35;
    satisfied.push('年龄30岁以下');
  } else if (profile.age > 30 && profile.age <= 35) {
    score += 10;
    pending.push('年龄超过30岁（部分权益可能不适用）');
  } else {
    pending.push('年龄需30岁以下');
  }

  if (isKeyIndustry(profile.industry) || hasKeyword(profile.industry, ['科技', 'AI', '人工智能'])) {
    score += 35;
    satisfied.push('科技创新/AI方向');
  } else {
    pending.push('需为科技创新方向');
  }

  if (quiz.startupIntent === '是' || quiz.startupIntent === '考虑中') {
    score += 30;
    satisfied.push(`有创业意向（${quiz.startupIntent}）`);
  } else {
    pending.push('需有来徐汇区落户创业意向');
  }

  return {
    policyId: 'P005',
    policyName: 'U30科创极客召集令',
    matchLevel: scoreToLevel(score),
    matchScore: score,
    status: 'normal',
    satisfiedConditions: satisfied,
    pendingConditions: pending,
    suggestion: '建议通过上海徐汇科创大会渠道报名，准备创业计划书和科技创新方向说明。',
  };
}

function matchP007(profile: TalentProfile, quiz: QuizAnswer): MatchResult {
  let score = 0;
  const satisfied: string[] = [];
  const pending: string[] = [];

  if (quiz.policyInterest === '都想了解' || quiz.policyInterest === '创业扶持') {
    score += 40;
    satisfied.push('对人才活动/创业扶持有关注');
  } else {
    score += 20;
  }

  if (isKeyIndustry(profile.industry) || hasKeyword(profile.industry, ['AI', '人工智能', '创业'])) {
    score += 30;
    satisfied.push('AI/创业方向，适合AI创新创业研修营');
  } else {
    pending.push('非AI/创业方向，部分活动可能不匹配');
  }

  if (quiz.startupIntent === '是' || quiz.startupIntent === '考虑中') {
    score += 30;
    satisfied.push('有创业意向，适合BP辅导/训练营');
  }

  return {
    policyId: 'P007',
    policyName: '人才四季·夏燃砺才｜六月人才集结令',
    matchLevel: scoreToLevel(score),
    matchScore: score,
    status: 'normal',
    satisfiedConditions: satisfied,
    pendingConditions: pending,
    suggestion: '建议关注AI创新创业研修营和海聚英才BP辅导活动，按公告报名参加。',
  };
}

function matchP008(profile: TalentProfile, _quiz: QuizAnswer): MatchResult {
  let score = 0;
  const satisfied: string[] = [];
  const pending: string[] = [];

  // DEMO profile is 28, 硕士, but not 应届 — typically won't match well
  if (hasKeyword(profile.companyStage, ['应届', '学生', '在校'])) {
    score += 35;
    satisfied.push('应届身份');
  } else {
    pending.push('需为2026届全日制应届硕博研究生');
  }

  if (profile.age > 0 && ((profile.education.includes('硕士') && profile.age <= 27) || (profile.education.includes('博士') && profile.age <= 30))) {
    score += 25;
    satisfied.push('年龄达标');
  } else if (profile.age > 0) {
    pending.push('年龄需硕士≤27岁/博士≤30岁');
  }

  pending.push('院校需为双一流/本市高校/海外QS前100');
  pending.push('需选择6大类岗位之一');

  return {
    policyId: 'P008',
    policyName: '上海市徐汇区2026年储备人才招聘',
    matchLevel: scoreToLevel(score),
    matchScore: score,
    status: 'normal',
    satisfiedConditions: satisfied,
    pendingConditions: pending,
    suggestion: '若为应届硕博且院校符合要求，建议关注区委组织部招聘公告。',
  };
}

function matchP010(profile: TalentProfile, quiz: QuizAnswer): MatchResult {
  let score = 0;
  const satisfied: string[] = [];
  const pending: string[] = [];

  if (isKeyIndustry(profile.industry) || hasKeyword(profile.industry, ['AI', '人工智能', '技术'])) {
    score += 40;
    satisfied.push('AI/技术方向，适合极客组或企业组');
  } else {
    pending.push('需为AI技术开发者或AI行业落地企业');
  }

  if (quiz.startupIntent === '是' || quiz.startupIntent === '考虑中') {
    score += 30;
    satisfied.push(`有创业意向（${quiz.startupIntent}）`);
  } else {
    pending.push('参赛和创业意向需确认');
  }

  if (profile.achievements.includes('重点项目') || profile.achievements.includes('获奖')) {
    score += 30;
    satisfied.push('有项目成果/获奖经历');
  } else {
    pending.push('参赛作品/项目成果可补充');
  }

  return {
    policyId: 'P010',
    policyName: '第六届海聚英才OPC专项赛',
    matchLevel: scoreToLevel(score),
    matchScore: score,
    status: 'normal',
    satisfiedConditions: satisfied,
    pendingConditions: pending,
    suggestion: '建议报名极客组或企业组参赛，准备AI技术方案/行业落地案例。',
  };
}

// ===================================================================
// Main match runner
// ===================================================================

export function runMatch(profile: TalentProfile, quiz: QuizAnswer): MatchResult[] {
  const results: MatchResult[] = [
    matchP001(profile, quiz),
    matchP002(profile, quiz),
    matchP003(profile, quiz),
    matchP004(profile, quiz),
    matchP005(profile, quiz),
    matchP007(profile, quiz),
    matchP008(profile, quiz),
    matchP010(profile, quiz),
  ];

  // P006 and P009 are background policies, not matched
  // Sort by matchScore descending
  results.sort((a, b) => b.matchScore - a.matchScore);

  return results;
}
