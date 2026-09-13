// ===================================================================
// 汇知道 V2 — 全局类型定义与常量
// ===================================================================

/** 对话流阶段 */
export type ChatPhase =
  | 'welcome'
  | 'upload_guide'
  | 'ocr_parsing'
  | 'profile_generated'
  | 'clarifying'
  | 'quiz'
  | 'matching'
  | 'results'
  | 'suggestion'
  | 'completed';

/** 匹配等级 */
export type MatchLevel = 'high' | 'medium' | 'low' | 'none';

/** 政策状态：normal=正常匹配, reference=参考, background=背景信息 */
export type PolicyStatus = 'normal' | 'reference' | 'background';

/** 侧栏模块 */
export type ModuleType = 'chat' | 'results' | 'profile' | 'policies';

/** 个人中心分栏 */
export type ProfileSection =
  | 'matches'
  | 'credentials'
  | 'favorites'
  | 'growth'
  | 'services'
  | 'privacy';

/** 消息类型 */
export type MessageType = 'ai' | 'user';

/** 富组件类型 */
export type RichContentType =
  | 'upload'
  | 'ocr_progress'
  | 'profile_card'
  | 'quiz_options'
  | 'match_result'
  | 'progress_badge'
  | 'suggestion'
  | 'disclaimer';

/** 政策库条目 */
export interface Policy {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  target: string;
  conditions: string[];
  benefit: string;
  applyMethod: string;
  source: string;
  validPeriod: string;
  keywords: string[];
  matchRules: string;
}

/** 人才画像 */
export interface TalentProfile {
  name: string;
  age: number;
  education: string;
  major: string;
  currentRole: string;
  workArea: string;
  companyStage: string;
  industry: string;
  projectExp: string;
  highlights: string;
  talentType: string;
  overseasExp: string;
  achievements: string[];
}

/** 追问问题 */
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  multi: boolean;
}

/** 追问答案 */
export interface QuizAnswer {
  socialInsurance: string;
  renting: string;
  workInXuhui: string;
  achievements: string[];
  overseasExp: string;
  startupIntent: string;
  policyInterest: string;
}

/** 匹配结果 */
export interface MatchResult {
  policyId: string;
  policyName: string;
  matchLevel: MatchLevel;
  matchScore: number;
  status: PolicyStatus;
  satisfiedConditions: string[];
  pendingConditions: string[];
  suggestion: string;
}

/** 富组件内容 */
export interface RichContent {
  type: RichContentType;
  data: Record<string, any>;
}

/** 对话消息 */
export interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  richContents?: RichContent[];
  timestamp: number;
}

/** 全局应用状态 */
export interface AppState {
  phase: ChatPhase;
  messages: ChatMessage[];
  profile: TalentProfile;
  quizAnswers: QuizAnswer;
  fileName: string;
  completeness: number;
  matchResults: MatchResult[];
  useDemoData: boolean;
  currentQuizIndex: number;
  isLoading: boolean;
  missingFields: (keyof TalentProfile)[];
  currentClarifyField: keyof TalentProfile | null;
  // 个人中心
  account: UserAccount;
  profileSection: ProfileSection;
  matchRecords: MatchRecord[];
  resumes: ResumeVersion[];
  credentials: CredentialAttachment[];
  favorites: FavoritePolicy[];
  subscription: SubscriptionSettings;
  notifications: Notification[];
  growthPlans: GrowthPlan[];
  appointments: Appointment[];
  activities: ActivityRegistration[];
  privacy: PrivacySettings;
  // 管理后台
  adminMode: boolean;
  adminUser: AdminUser | null;
  adminTalents: AdminTalent[];
  policyRules: PolicyRule[];
  serviceOrders: ServiceOrder[];
}

/** 导航状态 */
export interface NavigationState {
  currentModule: ModuleType;
  moduleStack: ModuleType[];
  policyDetailId: string | null;
}

/** 完整度明细项 */
export interface CompletenessItem {
  label: string;
  filled: boolean;
  weight: number;
}

// ===================================================================
// 个人中心相关类型
// ===================================================================

/** 登录账号基础信息 */
export interface UserAccount {
  realName: string;
  verified: boolean;
  phone: string;
  authorized: boolean;
}

/** 匹配记录 */
export interface MatchRecord {
  id: string;
  matchTime: number;
  resumeVersionId: string;
  resumeName: string;
  reportTitle: string;
  reportSummary: string;
  matchScore: number;
  chatHistoryIds: string[];
}

/** 简历版本 */
export interface ResumeVersion {
  id: string;
  name: string;
  uploadTime: number;
  isDefault: boolean;
  source: 'upload' | 'manual';
  content?: string;
}

/** 证照附件 */
export interface CredentialAttachment {
  id: string;
  name: string;
  category: 'education' | 'patent' | 'title' | 'award' | 'social' | 'other';
  uploadTime: number;
  size: number;
  fileType: string;
}

/** 收藏政策 */
export interface FavoritePolicy {
  id: string;
  policyId: string;
  name: string;
  category: 'renting' | 'startup' | 'leading' | 'hukou';
  deadline: number;
  collectedAt: number;
  sourceUrl?: string;
}

/** 订阅设置 */
export interface SubscriptionSettings {
  industries: string[];
  talentLevels: string[];
  pushEnabled: boolean;
}

/** 消息通知 */
export interface Notification {
  id: string;
  type: 'policy' | 'appointment' | 'audit' | 'system';
  title: string;
  content: string;
  createdAt: number;
  read: boolean;
}

/** 成长任务 */
export interface GrowthTask {
  id: string;
  title: string;
  completed: boolean;
  channelName: string;
  channelUrl: string;
  dueDate?: number;
}

/** 成长规划 */
export interface GrowthPlan {
  id: string;
  title: string;
  generatedAt: number;
  type: 'short' | 'long';
  tasks: GrowthTask[];
  summary: string;
}

/** 线下辅导预约 */
export interface Appointment {
  id: string;
  type: string;
  time: number;
  counselor: string;
  notes: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

/** 活动报名 */
export interface ActivityRegistration {
  id: string;
  policyId?: string;
  name: string;
  type: 'salon' | 'briefing' | 'matchmaking';
  time: number;
  location: string;
  status: 'registered' | 'checked_in' | 'cancelled';
}

// 政策 → 个人中心数据映射工具
export function mapPolicyCategoryToFavorite(category: string): FavoritePolicy['category'] {
  if (category === '人才补贴') return 'renting';
  if (category === '人才计划') return 'leading';
  if (category === '招聘储备') return 'hukou';
  return 'startup'; // 创业扶持、赛事活动、规范指导等默认
}

export function parsePolicyDeadline(policy: Pick<Policy, 'validPeriod'>): number {
  const text = policy.validPeriod;
  const yearMonthDay = text.match(/(\d{4})年(\d{1,2})月(\d{1,2})[-—](\d{1,2})日/);
  if (yearMonthDay) {
    return new Date(parseInt(yearMonthDay[1]), parseInt(yearMonthDay[2]) - 1, parseInt(yearMonthDay[4])).getTime();
  }
  const yearMonth = text.match(/(\d{4})年(\d{1,2})月/);
  if (yearMonth) {
    const y = parseInt(yearMonth[1]);
    const m = parseInt(yearMonth[2]);
    return new Date(y, m, 0, 23, 59, 59).getTime();
  }
  const yearOnly = text.match(/(\d{4})年度/);
  if (yearOnly) {
    return new Date(parseInt(yearOnly[1]), 11, 31, 23, 59, 59).getTime();
  }
  return Date.now() + 1000 * 60 * 60 * 24 * 90;
}

export function mapPolicyToActivityType(policy: Pick<Policy, 'name' | 'applyMethod'>): ActivityRegistration['type'] {
  if (policy.name.includes('宣讲') || policy.applyMethod.includes('宣讲')) return 'briefing';
  if (policy.name.includes('赛') || policy.name.includes('黑客松') || policy.name.includes('召集令')) return 'matchmaking';
  return 'salon';
}

export function parseEventLocation(policy: Pick<Policy, 'conditions' | 'source'>): string {
  for (const cond of policy.conditions) {
    const venue = cond.match(/([^，。]*(?:中心|大厦|Tower|会场|滨江|园区|广场|酒店|北杨|徐汇)[^，。]*)/);
    if (venue) return venue[1].trim();
  }
  if (/徐汇/.test(policy.source)) return '上海市徐汇区';
  return '上海市徐汇区（具体地点以通知为准）';
}

/** 隐私与账号设置 */
export interface PrivacySettings {
  talentPoolAuthorized: boolean;
  policyPushEnabled: boolean;
  voiceInputEnabled: boolean;
}

// ===================================================================
// 导出常量
// ===================================================================

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  { id: 'socialInsurance', question: '你目前是否已在上海连续缴纳社保？', options: ['已缴纳', '未缴纳', '不确定'], multi: false },
  { id: 'renting', question: '你目前是否在上海租房？', options: ['是', '否', '不确定'], multi: false },
  { id: 'workInXuhui', question: '你的工作单位是否注册或办公在徐汇区？', options: ['是', '否', '不确定'], multi: false },
  { id: 'achievements', question: '你是否有以下成果？（可多选）', options: ['专利', '论文', '获奖', '融资', '重点项目', '暂无'], multi: true },
  { id: 'overseasExp', question: '你是否有海外留学或海外工作经历？', options: ['海外留学', '海外工作', '无'], multi: false },
  { id: 'startupIntent', question: '你是否有创业或参加创业赛事的意向？', options: ['是', '否', '考虑中'], multi: false },
  { id: 'policyInterest', question: '你希望优先了解哪类政策？', options: ['人才租房补贴', '人才计划申报', '创业扶持', '落户相关', '都想了解'], multi: false },
];

export const INITIAL_PROFILE: TalentProfile = {
  name: '',
  age: 0,
  education: '',
  major: '',
  currentRole: '',
  workArea: '',
  companyStage: '',
  industry: '',
  projectExp: '',
  highlights: '',
  talentType: '',
  overseasExp: '',
  achievements: [],
};

export const DEMO_PROFILE: TalentProfile = {
  name: '王同学',
  age: 28,
  education: '硕士',
  major: '人工智能 / 产品设计',
  currentRole: 'AI创业公司产品经理',
  workArea: '徐汇区',
  companyStage: '创业公司，成立2年',
  industry: 'AI / 科技创新',
  projectExp: '参与AI产品从0到1落地',
  highlights: '有产品项目经验，暂无明确专利/论文/融资信息',
  talentType: '青年科技创新人才',
  overseasExp: '无',
  achievements: ['重点项目'],
};

export const INITIAL_QUIZ: QuizAnswer = {
  socialInsurance: '',
  renting: '',
  workInXuhui: '',
  achievements: [],
  overseasExp: '',
  startupIntent: '',
  policyInterest: '',
};

export const INITIAL_ACCOUNT: UserAccount = {
  realName: '张人才',
  verified: true,
  phone: '13800138000',
  authorized: true,
};

export const INITIAL_SUBSCRIPTION: SubscriptionSettings = {
  industries: ['人工智能', '生物医药'],
  talentLevels: ['青年人才', '领军人才'],
  pushEnabled: true,
};

export const INITIAL_PRIVACY: PrivacySettings = {
  talentPoolAuthorized: true,
  policyPushEnabled: true,
  voiceInputEnabled: false,
};

export const DEMO_QUIZ: QuizAnswer = {
  socialInsurance: '已缴纳',
  renting: '是',
  workInXuhui: '是',
  achievements: ['重点项目'],
  overseasExp: '无',
  startupIntent: '考虑中',
  policyInterest: '都想了解',
};

export const DEMO_MATCH_RECORDS: MatchRecord[] = [
  {
    id: 'mr-1',
    matchTime: Date.now() - 1000 * 60 * 60 * 24 * 2,
    resumeVersionId: 'rv-1',
    resumeName: '王同学-产品经理.pdf',
    reportTitle: '2026-06 徐汇区人才政策匹配报告',
    reportSummary: '匹配到 3 项高匹配度政策：人才租房补贴、青年创业扶持、储备人才计划。',
    matchScore: 86,
    chatHistoryIds: ['msg-1'],
  },
  {
    id: 'mr-2',
    matchTime: Date.now() - 1000 * 60 * 60 * 24 * 12,
    resumeVersionId: 'rv-2',
    resumeName: '王同学-初版简历.pdf',
    reportTitle: '2026-05 徐汇区人才政策匹配报告',
    reportSummary: '匹配到 2 项政策：人才租房补贴、高层次人才认定。',
    matchScore: 72,
    chatHistoryIds: [],
  },
];

export const DEMO_RESUMES: ResumeVersion[] = [
  {
    id: 'rv-1',
    name: '王同学-产品经理.pdf',
    uploadTime: Date.now() - 1000 * 60 * 60 * 24 * 2,
    isDefault: true,
    source: 'upload',
  },
  {
    id: 'rv-2',
    name: '王同学-初版简历.pdf',
    uploadTime: Date.now() - 1000 * 60 * 60 * 24 * 15,
    isDefault: false,
    source: 'upload',
  },
];

export const DEMO_CREDENTIALS: CredentialAttachment[] = [
  { id: 'cd-1', name: '硕士学位证书.pdf', category: 'education', uploadTime: Date.now() - 1000 * 60 * 60 * 24 * 5, size: 1024 * 1024 * 1.2, fileType: 'application/pdf' },
  { id: 'cd-2', name: '发明专利受理通知书.pdf', category: 'patent', uploadTime: Date.now() - 1000 * 60 * 60 * 24 * 3, size: 1024 * 512, fileType: 'application/pdf' },
  { id: 'cd-3', name: '高级职称证书.pdf', category: 'title', uploadTime: Date.now() - 1000 * 60 * 60 * 24 * 8, size: 1024 * 768, fileType: 'application/pdf' },
  { id: 'cd-4', name: '社保缴纳证明.pdf', category: 'social', uploadTime: Date.now() - 1000 * 60 * 60 * 24 * 1, size: 1024 * 300, fileType: 'application/pdf' },
];

export const DEMO_FAVORITES: FavoritePolicy[] = [
  { id: 'fav-1', policyId: 'P001', name: '徐汇区人才租房补贴', category: 'renting', deadline: Date.now() + 1000 * 60 * 60 * 24 * 45, collectedAt: Date.now() - 1000 * 60 * 60 * 24 * 3 },
  { id: 'fav-2', policyId: 'P003', name: '青年创业扶持资金', category: 'startup', deadline: Date.now() + 1000 * 60 * 60 * 24 * 90, collectedAt: Date.now() - 1000 * 60 * 60 * 24 * 5 },
  { id: 'fav-3', policyId: 'P005', name: '徐汇区领军人才评选', category: 'leading', deadline: Date.now() + 1000 * 60 * 60 * 24 * 20, collectedAt: Date.now() - 1000 * 60 * 60 * 24 * 1 },
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  { id: 'nt-1', type: 'policy', title: '新政策上线', content: '徐汇区 2026 年暑期实习补贴已发布，与你关注的产业赛道相关。', createdAt: Date.now() - 1000 * 60 * 60 * 2, read: false },
  { id: 'nt-2', type: 'appointment', title: '预约审核通过', content: '你的一对一人才辅导预约已通过审核，请准时参加。', createdAt: Date.now() - 1000 * 60 * 60 * 24, read: false },
  { id: 'nt-3', type: 'audit', title: '入库审核提醒', content: '你的高端人才库授权信息已通过核验。', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 3, read: true },
];

export const DEMO_GROWTH_PLANS: GrowthPlan[] = [
  {
    id: 'gp-1',
    title: '2026 下半年能力提升方案',
    generatedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    type: 'short',
    summary: '针对人才租房补贴与青年创业扶持，补齐社保连续缴纳与项目落地材料。',
    tasks: [
      { id: 'gt-1', title: '补齐 6 个月连续社保缴纳记录', completed: true, channelName: '徐汇区社保中心', channelUrl: 'https://rsj.sh.gov.cn/' },
      { id: 'gt-2', title: '准备租房合同与房东备案证明', completed: false, channelName: '徐汇人才服务窗口', channelUrl: '#' },
      { id: 'gt-3', title: '整理创业项目商业计划书', completed: false, channelName: '徐汇区科技创新服务中心', channelUrl: '#' },
    ],
  },
  {
    id: 'gp-2',
    title: '2026-2027 中长期发展规划',
    generatedAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
    type: 'long',
    summary: '以领军人才评选为目标，规划专利、论文、企业营收等核心指标提升路径。',
    tasks: [
      { id: 'gt-4', title: '提交 1 项发明专利申请', completed: false, channelName: '国家知识产权局', channelUrl: 'https://www.cnipa.gov.cn/' },
      { id: 'gt-5', title: '参加市级创业大赛并入围', completed: false, channelName: '上海市科委', channelUrl: '#' },
    ],
  },
];

export const DEMO_APPOINTMENTS: Appointment[] = [
  { id: 'ap-1', type: '一对一人才辅导', time: Date.now() + 1000 * 60 * 60 * 24 * 3, counselor: '李专员', notes: '针对人才计划申报流程进行辅导', status: 'upcoming' },
  { id: 'ap-2', type: '材料审核辅导', time: Date.now() - 1000 * 60 * 60 * 24 * 7, counselor: '王专员', notes: '已确认租房补贴申报材料清单', status: 'completed' },
];

export const DEMO_ACTIVITIES: ActivityRegistration[] = [
  { id: 'ac-1', name: '徐汇区科创沙龙第 12 期', type: 'salon', time: Date.now() + 1000 * 60 * 60 * 24 * 10, location: '徐汇滨江 AI Tower', status: 'registered' },
  { id: 'ac-2', name: '2026 人才政策宣讲会', type: 'briefing', time: Date.now() - 1000 * 60 * 60 * 24 * 5, location: '徐汇区行政服务中心', status: 'checked_in' },
];

export const SUGGESTED_QUESTIONS: string[] = [
  '我可以申请哪些人才补贴？',
  '如何判断自己是否符合人才计划？',
  '徐汇区有哪些创业扶持政策？',
  '需要准备哪些申报材料？',
];

// ===================================================================
// 管理后台相关类型
// ===================================================================

/** 管理员角色 */
export type AdminRole = 'super_admin' | 'reviewer' | 'specialist';

/** 管理员用户 */
export interface AdminUser {
  role: AdminRole;
  name: string;
  department: string;
}

/** 人才入库状态 */
export type TalentStatus = 'pending' | 'approved' | 'material_needed' | 'contacted' | 'completed';

/** 后台人才档案 */
export interface AdminTalent {
  id: string;
  name: string;
  age: number;
  education: string;
  major: string;
  industry: string;
  talentType: string;
  policyInterest: string;
  matchScore: number;
  status: TalentStatus;
  authorizedAt: number;
  currentRole: string;
  workArea: string;
  highlights: string;
  resumeSummary: string;
  aiSuggestion: string;
  matchResults: { policyName: string; matchScore: number; level: string }[];
  materialGaps: string[];
  followUpRecords: { time: number; content: string; operator: string }[];
}

/** 政策规则状态 */
export type PolicyRuleStatus = 'online' | 'offline' | 'archived';

/** 政策规则 */
export interface PolicyRule {
  id: string;
  name: string;
  category: string;
  target: string;
  keyConditions: string;
  status: PolicyRuleStatus;
  deadline: number;
}

/** 工单状态 */
export type OrderStatus = 'pending' | 'assigned' | 'processing' | 'completed';

/** 服务工单类型 */
export type OrderType = 'consultation' | 'appointment' | 'material' | 'other';

/** 服务工单 */
export interface ServiceOrder {
  id: string;
  type: OrderType;
  applicantName: string;
  content: string;
  createdAt: number;
  status: OrderStatus;
  assignee: string;
  notes: string;
}

// ===================================================================
// 管理后台 Demo 数据
// ===================================================================

export const DEMO_ADMIN_TALENTS: AdminTalent[] = [
  {
    id: 'at-1',
    name: '张伟',
    age: 32,
    education: '博士',
    major: '人工智能',
    industry: 'AI / 科技创新',
    talentType: '高层次人才',
    policyInterest: '人才计划申报',
    matchScore: 92,
    status: 'pending',
    authorizedAt: Date.now() - 1000 * 60 * 30,
    currentRole: 'AI算法负责人',
    workArea: '徐汇区',
    highlights: '发表顶会论文 8 篇，主持市级重点科研项目',
    resumeSummary: '清华大学博士毕业，5 年 AI 算法研发经验，现任某科技公司算法负责人，主持多项重点科研项目。',
    aiSuggestion: '该人才符合徐汇区领军人才评选条件，建议优先推荐申报领军人才计划，并匹配高层次人才租房补贴。',
    matchResults: [
      { policyName: '徐汇区领军人才评选', matchScore: 95, level: 'high' },
      { policyName: '高层次人才租房补贴', matchScore: 88, level: 'high' },
      { policyName: '人才计划申报绿色通道', matchScore: 80, level: 'medium' },
    ],
    materialGaps: ['近 3 年个税完税证明', '代表作全文 PDF'],
    followUpRecords: [],
  },
  {
    id: 'at-2',
    name: '李娜',
    age: 28,
    education: '硕士',
    major: '生物医药',
    industry: '生物医药',
    talentType: '青年科技创新人才',
    policyInterest: '人才租房补贴',
    matchScore: 85,
    status: 'pending',
    authorizedAt: Date.now() - 1000 * 60 * 60 * 2,
    currentRole: '生物制药研发工程师',
    workArea: '徐汇区',
    highlights: '参与 2 项新药研发项目，1 项专利在审',
    resumeSummary: '复旦大学硕士，3 年生物医药研发经验，参与新药管线开发，有专利在审。',
    aiSuggestion: '符合青年人才租房补贴条件，建议同时关注生物医药产业专项扶持政策。',
    matchResults: [
      { policyName: '2026 徐汇区人才租房补贴', matchScore: 90, level: 'high' },
      { policyName: '青年创业扶持资金', matchScore: 65, level: 'medium' },
    ],
    materialGaps: ['租房合同备案'],
    followUpRecords: [],
  },
  {
    id: 'at-3',
    name: '王强',
    age: 35,
    education: '硕士',
    major: '数字经济',
    industry: '数字经济',
    talentType: '领军人才',
    policyInterest: '创业扶持',
    matchScore: 78,
    status: 'approved',
    authorizedAt: Date.now() - 1000 * 60 * 60 * 24 * 3,
    currentRole: '数字经济创业公司 CEO',
    workArea: '徐汇区',
    highlights: '创立数字经济公司，年营收 2000 万，团队 30 人',
    resumeSummary: '上海交大硕士，创业 3 年，公司专注于企业数字化转型，已获天使轮融资。',
    aiSuggestion: '已入库，建议对接创业担保贷款贴息政策，关注下次领军人才评选窗口。',
    matchResults: [
      { policyName: '稳就业创业补贴', matchScore: 85, level: 'high' },
      { policyName: '创业担保贷款贴息', matchScore: 82, level: 'high' },
    ],
    materialGaps: [],
    followUpRecords: [
      { time: Date.now() - 1000 * 60 * 60 * 24 * 2, content: '已电话沟通创业补贴申报流程', operator: '李专员' },
    ],
  },
  {
    id: 'at-4',
    name: '陈雪',
    age: 26,
    education: '本科',
    major: '集成电路设计',
    industry: '集成电路',
    talentType: '青年人才',
    policyInterest: '都想了解',
    matchScore: 68,
    status: 'material_needed',
    authorizedAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    currentRole: '芯片设计工程师',
    workArea: '徐汇区',
    highlights: '参与 1 款芯片流片，工作 2 年',
    resumeSummary: '同济大学本科，2 年芯片设计经验，参与过芯片前端设计流程。',
    aiSuggestion: '材料待补充，建议补齐社保连续缴纳证明和学历认证后重新匹配。',
    matchResults: [
      { policyName: '人才租房补贴', matchScore: 70, level: 'medium' },
    ],
    materialGaps: ['社保连续缴纳 6 个月证明', '学历认证报告', '工作单位在徐汇区注册证明'],
    followUpRecords: [
      { time: Date.now() - 1000 * 60 * 60 * 24 * 3, content: '已通知补充社保和学历认证材料', operator: '王专员' },
    ],
  },
  {
    id: 'at-5',
    name: '刘洋',
    age: 40,
    education: '博士',
    major: '人工智能',
    industry: 'AI / 科技创新',
    talentType: '领军人才',
    policyInterest: '人才计划申报',
    matchScore: 95,
    status: 'contacted',
    authorizedAt: Date.now() - 1000 * 60 * 60 * 24 * 7,
    currentRole: 'AI 研究院副院长',
    workArea: '徐汇区',
    highlights: '国家杰青，发表 SCI 论文 30+，主持国家级项目 5 项',
    resumeSummary: '中科院博士，15 年 AI 研究经验，现任某研究院副院长，国家杰青基金获得者。',
    aiSuggestion: '高层次人才，建议对接市级领军人才计划，并协调区级配套政策。',
    matchResults: [
      { policyName: '徐汇区领军人才评选', matchScore: 98, level: 'high' },
      { policyName: '高层次人才租房补贴', matchScore: 92, level: 'high' },
      { policyName: '人才计划申报绿色通道', matchScore: 90, level: 'high' },
    ],
    materialGaps: [],
    followUpRecords: [
      { time: Date.now() - 1000 * 60 * 60 * 24 * 5, content: '已安排一对一辅导预约', operator: '李专员' },
      { time: Date.now() - 1000 * 60 * 60 * 24 * 2, content: '辅导完成，已明确领军人才申报路径', operator: '李专员' },
    ],
  },
];

export const DEMO_POLICY_RULES: PolicyRule[] = [
  { id: 'pr-1', name: '徐汇区人才租房补贴', category: '人才补贴', target: '在徐汇区重点产业企业工作的各类人才', keyConditions: '本人及配偶在沪无产权住房；连续缴纳社保 6 个月以上', status: 'online', deadline: Date.now() + 1000 * 60 * 60 * 24 * 180 },
  { id: 'pr-2', name: '青年创业扶持资金', category: '创业扶持', target: '35 周岁及以下创业青年', keyConditions: '成立小微企业/个体工商户，缴纳社保+稳定就业 3 个月以上', status: 'online', deadline: Date.now() + 1000 * 60 * 60 * 24 * 90 },
  { id: 'pr-3', name: '徐汇区领军人才评选', category: '人才计划', target: '各领域高层次领军人才', keyConditions: '博士或正高职称，主持省部级以上项目，成果突出', status: 'online', deadline: Date.now() + 1000 * 60 * 60 * 24 * 20 },
  { id: 'pr-4', name: '稳就业创业补贴', category: '就业补贴', target: '创业组织、就业人员', keyConditions: '扩就业 1000 元/人；创业见习生活费补贴', status: 'online', deadline: Date.now() + 1000 * 60 * 60 * 24 * 540 },
  { id: 'pr-5', name: '高层次人才落户政策', category: '落户政策', target: '博士、高级职称、重点产业紧缺人才', keyConditions: '博士或高级职称；重点产业紧缺岗位', status: 'offline', deadline: Date.now() + 1000 * 60 * 60 * 24 * 300 },
  { id: 'pr-6', name: '2024 人才安居工程（旧版）', category: '人才补贴', target: '各类人才', keyConditions: '已到期，新版政策已上线', status: 'archived', deadline: Date.now() - 1000 * 60 * 60 * 24 * 30 },
];

export const DEMO_SERVICE_ORDERS: ServiceOrder[] = [
  { id: 'so-1', type: 'consultation', applicantName: '张伟', content: '咨询领军人才评选申报条件和流程', createdAt: Date.now() - 1000 * 60 * 30, status: 'pending', assignee: '', notes: '' },
  { id: 'so-2', type: 'appointment', applicantName: '李娜', content: '预约一对一人才辅导，了解租房补贴申报', createdAt: Date.now() - 1000 * 60 * 60 * 3, status: 'pending', assignee: '', notes: '' },
  { id: 'so-3', type: 'material', applicantName: '陈雪', content: '提醒补充社保缴纳证明和学历认证报告', createdAt: Date.now() - 1000 * 60 * 60 * 24, status: 'assigned', assignee: '王专员', notes: '已发送邮件提醒' },
  { id: 'so-4', type: 'appointment', applicantName: '刘洋', content: '已完成领军人才申报路径辅导', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5, status: 'completed', assignee: '李专员', notes: '辅导完成，人才已明确申报路径' },
  { id: 'so-5', type: 'consultation', applicantName: '王强', content: '咨询创业担保贷款贴息申请流程', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2, status: 'processing', assignee: '李专员', notes: '正在准备材料清单' },
];

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: '超级管理员',
  reviewer: '科室审核员',
  specialist: '园区专员',
};

export const TALENT_STATUS_LABELS: Record<TalentStatus, string> = {
  pending: '待审核',
  approved: '已入库',
  material_needed: '材料待补充',
  contacted: '已联系',
  completed: '已完成服务',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '待处理',
  assigned: '已分配',
  processing: '处理中',
  completed: '已完成',
};

export const POLICY_RULE_STATUS_LABELS: Record<PolicyRuleStatus, string> = {
  online: '已上线',
  offline: '已下线',
  archived: '已归档',
};
