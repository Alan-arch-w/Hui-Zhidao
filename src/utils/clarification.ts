import { TalentProfile } from '../types';

export const CLARIFY_PROFILE_FIELDS: {
  key: keyof TalentProfile;
  label: string;
  question: string;
  placeholder: string;
}[] = [
  {
    key: 'age',
    label: '年龄',
    question: '你的年龄是多少？（仅数字，如 28）',
    placeholder: '请输入年龄',
  },
  {
    key: 'education',
    label: '学历',
    question: '你的最高学历是什么？（如 本科/硕士/博士）',
    placeholder: '请输入学历',
  },
  {
    key: 'major',
    label: '专业',
    question: '你的专业或研究方向是什么？',
    placeholder: '请输入专业',
  },
  {
    key: 'currentRole',
    label: '职位',
    question: '你目前的职位或角色是什么？',
    placeholder: '请输入职位',
  },
  {
    key: 'workArea',
    label: '工作区域',
    question: '你目前的工作区域在哪里？（如 徐汇区/上海其他区）',
    placeholder: '请输入工作区域',
  },
  {
    key: 'companyStage',
    label: '公司阶段',
    question: '你所在的公司或机构阶段是什么？（如 大型企业/创业公司/高校/科研院所）',
    placeholder: '请输入公司阶段',
  },
  {
    key: 'industry',
    label: '行业领域',
    question: '你所在的行业领域是什么？（如 AI/集成电路/生物医药）',
    placeholder: '请输入行业领域',
  },
  {
    key: 'projectExp',
    label: '项目经历',
    question: '请简要描述你近年的项目经历或核心成果。',
    placeholder: '请输入项目经历',
  },
  {
    key: 'highlights',
    label: '核心亮点',
    question: '请简要总结你的核心亮点或竞争优势。',
    placeholder: '请输入核心亮点',
  },
  {
    key: 'overseasExp',
    label: '海外经历',
    question: '你是否有海外留学或海外工作经历？（如 海外留学/海外工作/无）',
    placeholder: '请输入海外经历',
  },
];

/**
 * 检测人才画像中缺失的核心字段。
 * 字符串为空、年龄 <= 0、achievements 为空数组视为缺失。
 */
export function getMissingProfileFields(profile: TalentProfile): (keyof TalentProfile)[] {
  return CLARIFY_PROFILE_FIELDS.filter((field) => {
    const value = profile[field.key];
    if (field.key === 'age') return typeof value !== 'number' || value <= 0;
    if (field.key === 'achievements') return false; // 成果由追问补充
    if (Array.isArray(value)) return value.length === 0;
    return !value || String(value).trim() === '';
  }).map((field) => field.key);
}

function parseAge(answer: string): number | null {
  const match = answer.match(/(\d{1,3})/);
  if (match) {
    const age = parseInt(match[1], 10);
    return age > 0 && age < 120 ? age : null;
  }
  return null;
}

function parseEducation(answer: string): string {
  if (answer.includes('博士')) return '博士';
  if (answer.includes('硕士')) return '硕士';
  if (answer.includes('本科')) return '本科';
  if (answer.includes('大专') || answer.includes('专科')) return '大专/专科';
  if (answer.includes('高中')) return '高中';
  return answer.trim();
}

function parseAchievements(answer: string): string[] {
  const tags = ['专利', '论文', '获奖', '融资', '重点项目', '暂无'];
  const found = tags.filter((tag) => answer.includes(tag));
  return found.length > 0 ? found : ['暂无'];
}

/**
 * 将用户在补齐阶段的回答解析为字段值。
 */
export function parseClarifyAnswer(
  fieldKey: keyof TalentProfile,
  answer: string,
): string | number | string[] {
  const raw = answer.trim();
  switch (fieldKey) {
    case 'age':
      return parseAge(raw) ?? 0;
    case 'education':
      return parseEducation(raw);
    case 'achievements':
      return parseAchievements(raw);
    default:
      return raw;
  }
}

export function getClarifyFieldDef(fieldKey: keyof TalentProfile) {
  return CLARIFY_PROFILE_FIELDS.find((f) => f.key === fieldKey)!;
}
