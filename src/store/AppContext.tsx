import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import {
  AppState,
  NavigationState,
  ChatPhase,
  ChatMessage,
  RichContent,
  TalentProfile,
  QuizAnswer,
  MatchResult,
  ModuleType,
  ProfileSection,
  UserAccount,
  ResumeVersion,
  CredentialAttachment,
  FavoritePolicy,
  SubscriptionSettings,
  GrowthPlan,
  Appointment,
  ActivityRegistration,
  PrivacySettings,
  AdminUser,
  AdminTalent,
  PolicyRule,
  ServiceOrder,
  TalentStatus,
  INITIAL_PROFILE,
  INITIAL_QUIZ,
  DEMO_PROFILE,
  DEMO_QUIZ,
  INITIAL_ACCOUNT,
  INITIAL_SUBSCRIPTION,
  INITIAL_PRIVACY,
  DEMO_MATCH_RECORDS,
  DEMO_RESUMES,
  DEMO_CREDENTIALS,
  DEMO_FAVORITES,
  DEMO_NOTIFICATIONS,
  DEMO_GROWTH_PLANS,
  DEMO_APPOINTMENTS,
  DEMO_ACTIVITIES,
  DEMO_ADMIN_TALENTS,
  DEMO_POLICY_RULES,
  DEMO_SERVICE_ORDERS,
} from '../types';
import { runMatch } from '../engine/matchEngine';
import { calculate as calcCompleteness } from '../utils/completeness';
import { chatWithAI, extractProfileFromChat } from '../services/api';
import {
  getMissingProfileFields,
  parseClarifyAnswer,
} from '../utils/clarification';

// ===================================================================
// Reducer Action Types
// ===================================================================

type ChatAction =
  | { type: 'INIT_CHAT' }
  | { type: 'ADD_MESSAGE'; payload: { message: Omit<ChatMessage, 'id' | 'timestamp'> } }
  | { type: 'SET_PHASE'; payload: { phase: ChatPhase } }
  | { type: 'FILE_SELECTED'; payload: { fileName: string } }
  | { type: 'OCR_COMPLETE'; payload: { profile: TalentProfile } }
  | { type: 'OCR_PROGRESS'; payload: { step: number; progress: number } }
  | { type: 'START_CLARIFY' }
  | { type: 'CLARIFY_ANSWER'; payload: { fieldKey: keyof TalentProfile; answer: string } }
  | { type: 'UPDATE_PROFILE'; payload: { updates: Partial<TalentProfile> } }
  | { type: 'QUIZ_ANSWER'; payload: { questionId: string; answer: string | string[] } }
  | { type: 'START_MATCHING' }
  | { type: 'MATCH_COMPLETE'; payload: { results: MatchResult[] } }
  | { type: 'SET_LOADING'; payload: { isLoading: boolean } }
  | { type: 'LOAD_DEMO' }
  // 个人中心
  | { type: 'SET_PROFILE_SECTION'; payload: { section: ProfileSection } }
  | { type: 'UPDATE_ACCOUNT'; payload: { updates: Partial<UserAccount> } }
  | { type: 'SET_PROFILE_DATA'; payload: { partial: Partial<AppState> } }
  | { type: 'ADD_MATCH_RECORD'; payload: { record: MatchResult[]; resumeName: string } }
  | { type: 'DELETE_MATCH_RECORD'; payload: { id: string } }
  | { type: 'ADD_RESUME'; payload: { resume: ResumeVersion } }
  | { type: 'UPDATE_RESUME'; payload: { id: string; updates: Partial<ResumeVersion> } }
  | { type: 'DELETE_RESUME'; payload: { id: string } }
  | { type: 'SET_DEFAULT_RESUME'; payload: { id: string } }
  | { type: 'ADD_CREDENTIAL'; payload: { credential: CredentialAttachment } }
  | { type: 'DELETE_CREDENTIAL'; payload: { id: string } }
  | { type: 'ADD_FAVORITE'; payload: { favorite: FavoritePolicy } }
  | { type: 'DELETE_FAVORITE'; payload: { id: string } }
  | { type: 'UPDATE_SUBSCRIPTION'; payload: { subscription: SubscriptionSettings } }
  | { type: 'MARK_NOTIFICATION_READ'; payload: { id: string } }
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'ADD_GROWTH_PLAN'; payload: { plan: GrowthPlan } }
  | { type: 'DELETE_GROWTH_PLAN'; payload: { id: string } }
  | { type: 'TOGGLE_GROWTH_TASK'; payload: { planId: string; taskId: string } }
  | { type: 'ADD_APPOINTMENT'; payload: { appointment: Appointment } }
  | { type: 'CANCEL_APPOINTMENT'; payload: { id: string } }
  | { type: 'ADD_ACTIVITY_REGISTRATION'; payload: { activity: ActivityRegistration } }
  | { type: 'CANCEL_ACTIVITY_REGISTRATION'; payload: { id: string } }
  | { type: 'UPDATE_PRIVACY'; payload: { privacy: PrivacySettings } }
  // 管理后台
  | { type: 'ADMIN_LOGIN'; payload: { user: AdminUser } }
  | { type: 'ADMIN_LOGOUT' }
  | { type: 'UPDATE_TALENT_STATUS'; payload: { id: string; status: TalentStatus; note?: string } }
  | { type: 'ADD_FOLLOW_UP'; payload: { talentId: string; content: string; operator: string } }
  | { type: 'UPDATE_POLICY_RULE'; payload: { id: string; updates: Partial<PolicyRule> } }
  | { type: 'UPDATE_ORDER'; payload: { id: string; updates: Partial<ServiceOrder> } }
  | { type: 'AUTHORIZE_TO_POOL'; payload: { talent: AdminTalent } }
  | { type: 'RESET_ALL' };

// Navigation actions are separate
type NavAction =
  | { type: 'NAVIGATE_TO'; payload: { module: ModuleType } }
  | { type: 'NAVIGATE_BACK' }
  | { type: 'OPEN_POLICY_DETAIL'; payload: { id: string } }
  | { type: 'CLOSE_POLICY_DETAIL' };

// ===================================================================
// ID generator
// ===================================================================

let messageCounter = 0;
function genId(prefix: string = 'msg'): string {
  messageCounter += 1;
  return `${prefix}-${Date.now()}-${messageCounter}`;
}

// ===================================================================
// Initial States
// ===================================================================

function createWelcomeMessages(): ChatMessage[] {
  // The new design shows a dedicated welcome screen instead of an opening chat bubble.
  return [];
}

const initialAppState: AppState = {
  phase: 'welcome',
  messages: createWelcomeMessages(),
  profile: INITIAL_PROFILE,
  quizAnswers: INITIAL_QUIZ,
  fileName: '',
  completeness: 0,
  matchResults: [],
  useDemoData: false,
  currentQuizIndex: 0,
  isLoading: false,
  missingFields: [],
  currentClarifyField: null,
  // 个人中心
  account: INITIAL_ACCOUNT,
  profileSection: 'matches',
  matchRecords: DEMO_MATCH_RECORDS,
  resumes: DEMO_RESUMES,
  credentials: DEMO_CREDENTIALS,
  favorites: DEMO_FAVORITES,
  subscription: INITIAL_SUBSCRIPTION,
  notifications: DEMO_NOTIFICATIONS,
  growthPlans: DEMO_GROWTH_PLANS,
  appointments: DEMO_APPOINTMENTS,
  activities: DEMO_ACTIVITIES,
  privacy: INITIAL_PRIVACY,
  // 管理后台
  adminMode: false,
  adminUser: null,
  adminTalents: DEMO_ADMIN_TALENTS,
  policyRules: DEMO_POLICY_RULES,
  serviceOrders: DEMO_SERVICE_ORDERS,
};

const initialNavState: NavigationState = {
  currentModule: 'chat',
  moduleStack: [],
  policyDetailId: null,
};

// ===================================================================
// App State Reducer
// ===================================================================

function appReducer(state: AppState, action: ChatAction): AppState {
  switch (action.type) {
    case 'INIT_CHAT':
      return {
        ...state,
        phase: 'welcome',
        messages: createWelcomeMessages(),
        profile: INITIAL_PROFILE,
        quizAnswers: INITIAL_QUIZ,
        fileName: '',
        completeness: 0,
        matchResults: [],
        useDemoData: false,
        currentQuizIndex: 0,
        missingFields: [],
        currentClarifyField: null,
      };

    case 'ADD_MESSAGE': {
      const msg: ChatMessage = {
        ...action.payload.message,
        id: genId(),
        timestamp: Date.now(),
      };
      return { ...state, messages: [...state.messages, msg] };
    }

    case 'SET_PHASE':
      return { ...state, phase: action.payload.phase };

    case 'FILE_SELECTED':
      return {
        ...state,
        fileName: action.payload.fileName,
        phase: 'ocr_parsing',
      };

    case 'OCR_COMPLETE': {
      const profile = action.payload.profile;
      const completeness = calcCompleteness(profile, state.quizAnswers);
      const missingFields = getMissingProfileFields(profile);
      if (missingFields.length > 0) {
        return {
          ...state,
          profile,
          completeness,
          phase: 'clarifying',
          missingFields,
          currentClarifyField: missingFields[0],
        };
      }
      // 简历信息完整，直接进入追问阶段
      return {
        ...state,
        profile,
        completeness,
        phase: 'quiz',
        currentQuizIndex: 0,
        missingFields: [],
        currentClarifyField: null,
      };
    }

    case 'START_CLARIFY': {
      const missingFields = getMissingProfileFields(state.profile);
      if (missingFields.length === 0) {
        return {
          ...state,
          phase: 'quiz',
          currentQuizIndex: 0,
        };
      }
      return {
        ...state,
        phase: 'clarifying',
        missingFields,
        currentClarifyField: missingFields[0],
      };
    }

    case 'CLARIFY_ANSWER': {
      const { fieldKey, answer } = action.payload;
      const value = parseClarifyAnswer(fieldKey, answer);
      const updatedProfile: TalentProfile = { ...state.profile, [fieldKey]: value };
      const remaining = state.missingFields.filter((f) => f !== fieldKey);
      const completeness = calcCompleteness(updatedProfile, state.quizAnswers);
      if (remaining.length === 0) {
        return {
          ...state,
          profile: updatedProfile,
          completeness,
          phase: 'quiz',
          currentQuizIndex: 0,
          missingFields: [],
          currentClarifyField: null,
        };
      }
      return {
        ...state,
        profile: updatedProfile,
        completeness,
        missingFields: remaining,
        currentClarifyField: remaining[0],
      };
    }

    case 'UPDATE_PROFILE': {
      const updates = action.payload.updates;
      const updatedProfile: TalentProfile = { ...state.profile, ...updates };
      const completeness = calcCompleteness(updatedProfile, state.quizAnswers);
      return {
        ...state,
        profile: updatedProfile,
        completeness,
      };
    }

    case 'QUIZ_ANSWER': {
      const { questionId, answer } = action.payload;
      const newQuiz: QuizAnswer = { ...state.quizAnswers };
      (newQuiz as any)[questionId] = answer;
      const completeness = calcCompleteness(state.profile, newQuiz);
      const isLastQuiz = state.currentQuizIndex >= 6; // 0-indexed, 7 questions
      return {
        ...state,
        quizAnswers: newQuiz,
        completeness,
        currentQuizIndex: isLastQuiz ? state.currentQuizIndex : state.currentQuizIndex + 1,
        phase: isLastQuiz ? 'matching' : 'quiz',
      };
    }

    case 'START_MATCHING':
      return { ...state, phase: 'matching' };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload.isLoading };

    case 'MATCH_COMPLETE': {
      const results = action.payload.results;
      const newRecord = {
        id: genId('mr'),
        matchTime: Date.now(),
        resumeVersionId: state.resumes.find((r) => r.isDefault)?.id || '',
        resumeName: state.fileName || state.resumes.find((r) => r.isDefault)?.name || '当前简历',
        reportTitle: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')} 徐汇区人才政策匹配报告`,
        reportSummary: `匹配到 ${results.length} 项相关政策。`,
        matchScore: results.length > 0 ? Math.round(results.reduce((a, b) => a + b.matchScore, 0) / results.length) : 0,
        chatHistoryIds: state.messages.map((m) => m.id),
      };
      return {
        ...state,
        matchResults: results,
        matchRecords: [newRecord, ...state.matchRecords],
        phase: 'results',
      };
    }

    case 'LOAD_DEMO': {
      const profile = DEMO_PROFILE;
      const quiz = DEMO_QUIZ;
      const results = runMatch(profile, quiz);
      const completeness = calcCompleteness(profile, quiz);
      const messages: ChatMessage[] = [
        {
          id: genId(),
          type: 'ai',
          content:
            '你好！我是汇知道政策顾问。你选择了使用示例数据，我已加载一位「青年科技创新人才」的画像，直接为你匹配相关政策。',
          timestamp: Date.now(),
        },
        {
          id: genId(),
          type: 'ai',
          content: '简历解析完成！我提取到了以下关键信息，信息完整度 90%。',
          richContents: [
            { type: 'profile_card', data: { profile } },
            { type: 'progress_badge', data: { completeness } },
          ],
          timestamp: Date.now() + 1,
        },
        {
          id: genId(),
          type: 'ai',
          content: '匹配完成！基于你的画像，我为你匹配到以下政策，按匹配度排序：',
          richContents: [
            { type: 'match_result', data: { results: results.slice(0, 3) } },
            { type: 'disclaimer', data: {} },
          ],
          timestamp: Date.now() + 2,
        },
      ];
      return {
        ...state,
        profile,
        quizAnswers: quiz,
        matchResults: results,
        completeness,
        phase: 'results',
        useDemoData: true,
        fileName: '示例数据-王同学.pdf',
        messages,
        currentQuizIndex: 6,
        missingFields: [],
        currentClarifyField: null,
      };
    }

    // 个人中心 actions
    case 'SET_PROFILE_SECTION':
      return { ...state, profileSection: action.payload.section };

    case 'UPDATE_ACCOUNT':
      return { ...state, account: { ...state.account, ...action.payload.updates } };

    case 'SET_PROFILE_DATA':
      return { ...state, ...action.payload.partial };

    case 'ADD_MATCH_RECORD': {
      const newRecord = {
        id: genId('mr'),
        matchTime: Date.now(),
        resumeVersionId: state.resumes.find((r) => r.isDefault)?.id || '',
        resumeName: action.payload.resumeName || state.fileName || '当前简历',
        reportTitle: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')} 徐汇区人才政策匹配报告`,
        reportSummary: `匹配到 ${action.payload.record.length} 项相关政策。`,
        matchScore: action.payload.record.length > 0 ? Math.round(action.payload.record.reduce((a, b) => a + b.matchScore, 0) / action.payload.record.length) : 0,
        chatHistoryIds: state.messages.map((m) => m.id),
      };
      return { ...state, matchRecords: [newRecord, ...state.matchRecords] };
    }

    case 'DELETE_MATCH_RECORD':
      return { ...state, matchRecords: state.matchRecords.filter((r) => r.id !== action.payload.id) };

    case 'ADD_RESUME':
      return {
        ...state,
        resumes: state.resumes.map((r) => (action.payload.resume.isDefault ? { ...r, isDefault: false } : r)).concat(action.payload.resume),
      };

    case 'UPDATE_RESUME':
      return {
        ...state,
        resumes: state.resumes.map((r) => (r.id === action.payload.id ? { ...r, ...action.payload.updates } : r)),
      };

    case 'DELETE_RESUME':
      return { ...state, resumes: state.resumes.filter((r) => r.id !== action.payload.id) };

    case 'SET_DEFAULT_RESUME':
      return {
        ...state,
        resumes: state.resumes.map((r) => ({ ...r, isDefault: r.id === action.payload.id })),
      };

    case 'ADD_CREDENTIAL':
      return { ...state, credentials: [action.payload.credential, ...state.credentials] };

    case 'DELETE_CREDENTIAL':
      return { ...state, credentials: state.credentials.filter((c) => c.id !== action.payload.id) };

    case 'ADD_FAVORITE':
      return { ...state, favorites: [action.payload.favorite, ...state.favorites] };

    case 'DELETE_FAVORITE':
      return { ...state, favorites: state.favorites.filter((f) => f.id !== action.payload.id) };

    case 'UPDATE_SUBSCRIPTION':
      return { ...state, subscription: action.payload.subscription };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.id === action.payload.id ? { ...n, read: true } : n)),
      };

    case 'MARK_ALL_NOTIFICATIONS_READ':
      return { ...state, notifications: state.notifications.map((n) => ({ ...n, read: true })) };

    case 'ADD_GROWTH_PLAN':
      return { ...state, growthPlans: [action.payload.plan, ...state.growthPlans] };

    case 'DELETE_GROWTH_PLAN':
      return { ...state, growthPlans: state.growthPlans.filter((p) => p.id !== action.payload.id) };

    case 'TOGGLE_GROWTH_TASK': {
      const { planId, taskId } = action.payload;
      return {
        ...state,
        growthPlans: state.growthPlans.map((p) =>
          p.id === planId
            ? {
                ...p,
                tasks: p.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
              }
            : p
        ),
      };
    }

    case 'ADD_APPOINTMENT':
      return { ...state, appointments: [action.payload.appointment, ...state.appointments] };

    case 'CANCEL_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map((a) => (a.id === action.payload.id ? { ...a, status: 'cancelled' as const } : a)),
      };

    case 'ADD_ACTIVITY_REGISTRATION':
      return { ...state, activities: [action.payload.activity, ...state.activities] };

    case 'CANCEL_ACTIVITY_REGISTRATION':
      return {
        ...state,
        activities: state.activities.map((a) => (a.id === action.payload.id ? { ...a, status: 'cancelled' as const } : a)),
      };

    case 'UPDATE_PRIVACY':
      return { ...state, privacy: action.payload.privacy };

    // 管理后台 actions
    case 'ADMIN_LOGIN':
      return { ...state, adminMode: true, adminUser: action.payload.user };

    case 'ADMIN_LOGOUT':
      return { ...state, adminMode: false, adminUser: null };

    case 'UPDATE_TALENT_STATUS':
      return {
        ...state,
        adminTalents: state.adminTalents.map((t) =>
          t.id === action.payload.id
            ? {
                ...t,
                status: action.payload.status,
                followUpRecords: action.payload.note
                  ? [...t.followUpRecords, { time: Date.now(), content: action.payload.note!, operator: state.adminUser?.name || '系统' }]
                  : t.followUpRecords,
              }
            : t
        ),
      };

    case 'ADD_FOLLOW_UP':
      return {
        ...state,
        adminTalents: state.adminTalents.map((t) =>
          t.id === action.payload.talentId
            ? {
                ...t,
                followUpRecords: [
                  ...t.followUpRecords,
                  { time: Date.now(), content: action.payload.content, operator: action.payload.operator },
                ],
              }
            : t
        ),
      };

    case 'UPDATE_POLICY_RULE':
      return {
        ...state,
        policyRules: state.policyRules.map((p) =>
          p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
        ),
      };

    case 'UPDATE_ORDER':
      return {
        ...state,
        serviceOrders: state.serviceOrders.map((o) =>
          o.id === action.payload.id ? { ...o, ...action.payload.updates } : o
        ),
      };

    case 'AUTHORIZE_TO_POOL': {
      const exists = state.adminTalents.some((t) => t.id === action.payload.talent.id);
      if (exists) return state;
      return { ...state, adminTalents: [action.payload.talent, ...state.adminTalents] };
    }

    case 'RESET_ALL':
      return { ...initialAppState, messages: createWelcomeMessages() };

    default:
      return state;
  }
}

// ===================================================================
// Navigation Reducer
// ===================================================================

function navReducer(state: NavigationState, action: NavAction): NavigationState {
  switch (action.type) {
    case 'NAVIGATE_TO': {
      if (action.payload.module === state.currentModule && !state.policyDetailId) return state;
      return {
        ...state,
        currentModule: action.payload.module,
        moduleStack: [...state.moduleStack, state.currentModule],
        policyDetailId: null,
      };
    }
    case 'NAVIGATE_BACK': {
      if (state.policyDetailId) {
        return { ...state, policyDetailId: null };
      }
      const stack = [...state.moduleStack];
      const prev = stack.pop() || 'chat';
      return {
        ...state,
        currentModule: prev,
        moduleStack: stack,
        policyDetailId: null,
      };
    }
    case 'OPEN_POLICY_DETAIL':
      return { ...state, policyDetailId: action.payload.id };
    case 'CLOSE_POLICY_DETAIL':
      return { ...state, policyDetailId: null };
    default:
      return state;
  }
}

// ===================================================================
// Context Definition
// ===================================================================

interface AppContextValue {
  entered: boolean;
  enterApp: () => void;
  goHome: () => void;
  logout: () => void;
  state: AppState;
  nav: NavigationState;
  dispatch: React.Dispatch<ChatAction>;
  dispatchNav: React.Dispatch<NavAction>;
  navigateTo: (module: ModuleType) => void;
  navigateBack: () => void;
  openPolicyDetail: (id: string) => void;
  closePolicyDetail: () => void;
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setPhase: (phase: ChatPhase) => void;
  setLoading: (isLoading: boolean) => void;
  sendMessage: (content: string) => Promise<void>;
  showToast: (msg: string) => void;
  toast: { message: string; visible: boolean };
  // 个人中心便捷方法
  setProfileSection: (section: ProfileSection) => void;
  updateAccount: (updates: Partial<UserAccount>) => void;
  addMatchRecord: (results: MatchResult[], resumeName?: string) => void;
  deleteMatchRecord: (id: string) => void;
  addResume: (resume: ResumeVersion) => void;
  updateResume: (id: string, updates: Partial<ResumeVersion>) => void;
  deleteResume: (id: string) => void;
  setDefaultResume: (id: string) => void;
  addCredential: (credential: CredentialAttachment) => void;
  deleteCredential: (id: string) => void;
  addFavorite: (favorite: FavoritePolicy) => void;
  deleteFavorite: (id: string) => void;
  updateSubscription: (subscription: SubscriptionSettings) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addGrowthPlan: (plan: GrowthPlan) => void;
  deleteGrowthPlan: (id: string) => void;
  toggleGrowthTask: (planId: string, taskId: string) => void;
  addAppointment: (appointment: Appointment) => void;
  cancelAppointment: (id: string) => void;
  addActivityRegistration: (activity: ActivityRegistration) => void;
  cancelActivityRegistration: (id: string) => void;
  updatePrivacy: (privacy: PrivacySettings) => void;
  exportTodoList: (planId: string) => string;
  // 管理后台
  adminLogin: (user: AdminUser) => void;
  adminLogout: () => void;
  updateTalentStatus: (id: string, status: TalentStatus, note?: string) => void;
  addFollowUp: (talentId: string, content: string) => void;
  updatePolicyRule: (id: string, updates: Partial<PolicyRule>) => void;
  updateOrder: (id: string, updates: Partial<ServiceOrder>) => void;
  authorizeToPool: (talent: AdminTalent) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ===================================================================
// Provider
// ===================================================================

const PROFILE_STATE_KEY = 'hz_profile_state';

function loadProfileState(): Partial<AppState> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(PROFILE_STATE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function mergeInitialState(): AppState {
  const saved = loadProfileState();
  if (!saved) return initialAppState;
  return { ...initialAppState, ...saved };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, mergeInitialState());
  const [nav, dispatchNav] = useReducer(navReducer, initialNavState);

  const ENTERED_KEY = 'hz_entered';
  const [entered, setEntered] = React.useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(ENTERED_KEY) === 'true';
  });

  const [toastState, setToastState] = React.useState({ message: '', visible: false });
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastState({ message: msg, visible: true });
    toastTimerRef.current = setTimeout(() => {
      setToastState((prev) => ({ ...prev, visible: false }));
    }, 2500);
  }, []);

  const enterApp = useCallback(() => {
    localStorage.setItem(ENTERED_KEY, 'true');
    setEntered(true);
  }, [ENTERED_KEY]);

  const goHome = useCallback(() => {
    setEntered(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ENTERED_KEY);
    dispatch({ type: 'RESET_ALL' });
    setEntered(false);
  }, [ENTERED_KEY]);

  const navigateTo = useCallback((module: ModuleType) => {
    dispatchNav({ type: 'NAVIGATE_TO', payload: { module } });
  }, []);

  const navigateBack = useCallback(() => {
    dispatchNav({ type: 'NAVIGATE_BACK' });
  }, []);

  const openPolicyDetail = useCallback((id: string) => {
    dispatchNav({ type: 'OPEN_POLICY_DETAIL', payload: { id } });
  }, []);

  const closePolicyDetail = useCallback(() => {
    dispatchNav({ type: 'CLOSE_POLICY_DETAIL' });
  }, []);

  const addMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    dispatch({ type: 'ADD_MESSAGE', payload: { message: msg } });
  }, []);

  const setPhase = useCallback((phase: ChatPhase) => {
    dispatch({ type: 'SET_PHASE', payload: { phase } });
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: { isLoading } });
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      const userMsg: ChatMessage = {
        type: 'user',
        content: content.trim(),
        id: '',
        timestamp: 0,
      };
      const updatedMessages: ChatMessage[] = [
        ...state.messages.map((m) => ({ type: m.type, content: m.content, id: '', timestamp: 0 })),
        userMsg,
      ];

      dispatch({ type: 'ADD_MESSAGE', payload: { message: userMsg } });
      dispatch({ type: 'SET_LOADING', payload: { isLoading: true } });

      try {
        // 先尝试从对话中提取画像更新，让 AI 回答基于最新画像
        let extractedUpdates: Partial<TalentProfile> = {};
        try {
          const extractRes = await extractProfileFromChat({
            messages: updatedMessages,
            currentProfile: state.profile,
          });
          if (extractRes.success) {
            extractedUpdates = extractRes.updates || {};
          }
        } catch (err) {
          console.error('Extract profile failed:', err);
        }

        const profileForChat = { ...state.profile, ...extractedUpdates };

        const { reply } = await chatWithAI({
          messages: updatedMessages,
          profile: profileForChat,
          quizAnswers: state.quizAnswers,
          matchResults: state.matchResults,
        });

        dispatch({ type: 'ADD_MESSAGE', payload: { message: { type: 'ai', content: reply } } });

        if (Object.keys(extractedUpdates).length > 0) {
          dispatch({ type: 'UPDATE_PROFILE', payload: { updates: extractedUpdates } });
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'AI 服务暂时不可用';
        dispatch({
          type: 'ADD_MESSAGE',
          payload: {
            message: {
              type: 'ai',
              content: `抱歉，智能服务暂时不可用：${errorMsg}。请检查后端服务是否启动。`,
            },
          },
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
      }
    },
    [state.messages, state.profile, state.quizAnswers, state.matchResults],
  );

  // 持久化个人中心数据
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const profileKeys: (keyof AppState)[] = [
      'account',
      'profileSection',
      'matchRecords',
      'resumes',
      'credentials',
      'favorites',
      'subscription',
      'notifications',
      'growthPlans',
      'appointments',
      'activities',
      'privacy',
    ];
    const toSave: Partial<AppState> = {};
    profileKeys.forEach((k) => {
      (toSave as any)[k] = state[k];
    });
    localStorage.setItem(PROFILE_STATE_KEY, JSON.stringify(toSave));
  }, [
    state.account,
    state.profileSection,
    state.matchRecords,
    state.resumes,
    state.credentials,
    state.favorites,
    state.subscription,
    state.notifications,
    state.growthPlans,
    state.appointments,
    state.activities,
    state.privacy,
  ]);

  // 个人中心便捷方法
  const setProfileSection = useCallback((section: ProfileSection) => {
    dispatch({ type: 'SET_PROFILE_SECTION', payload: { section } });
  }, []);

  const updateAccount = useCallback((updates: Partial<UserAccount>) => {
    dispatch({ type: 'UPDATE_ACCOUNT', payload: { updates } });
  }, []);

  const addMatchRecord = useCallback((results: MatchResult[], resumeName?: string) => {
    dispatch({ type: 'ADD_MATCH_RECORD', payload: { record: results, resumeName: resumeName || '未命名简历' } });
  }, []);

  const deleteMatchRecord = useCallback((id: string) => {
    dispatch({ type: 'DELETE_MATCH_RECORD', payload: { id } });
  }, []);

  const addResume = useCallback((resume: ResumeVersion) => {
    dispatch({ type: 'ADD_RESUME', payload: { resume } });
  }, []);

  const updateResume = useCallback((id: string, updates: Partial<ResumeVersion>) => {
    dispatch({ type: 'UPDATE_RESUME', payload: { id, updates } });
  }, []);

  const deleteResume = useCallback((id: string) => {
    dispatch({ type: 'DELETE_RESUME', payload: { id } });
  }, []);

  const setDefaultResume = useCallback((id: string) => {
    dispatch({ type: 'SET_DEFAULT_RESUME', payload: { id } });
  }, []);

  const addCredential = useCallback((credential: CredentialAttachment) => {
    dispatch({ type: 'ADD_CREDENTIAL', payload: { credential } });
  }, []);

  const deleteCredential = useCallback((id: string) => {
    dispatch({ type: 'DELETE_CREDENTIAL', payload: { id } });
  }, []);

  const addFavorite = useCallback((favorite: FavoritePolicy) => {
    dispatch({ type: 'ADD_FAVORITE', payload: { favorite } });
  }, []);

  const deleteFavorite = useCallback((id: string) => {
    dispatch({ type: 'DELETE_FAVORITE', payload: { id } });
  }, []);

  const updateSubscription = useCallback((subscription: SubscriptionSettings) => {
    dispatch({ type: 'UPDATE_SUBSCRIPTION', payload: { subscription } });
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: { id } });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_NOTIFICATIONS_READ' });
  }, []);

  const addGrowthPlan = useCallback((plan: GrowthPlan) => {
    dispatch({ type: 'ADD_GROWTH_PLAN', payload: { plan } });
  }, []);

  const deleteGrowthPlan = useCallback((id: string) => {
    dispatch({ type: 'DELETE_GROWTH_PLAN', payload: { id } });
  }, []);

  const toggleGrowthTask = useCallback((planId: string, taskId: string) => {
    dispatch({ type: 'TOGGLE_GROWTH_TASK', payload: { planId, taskId } });
  }, []);

  const addAppointment = useCallback((appointment: Appointment) => {
    dispatch({ type: 'ADD_APPOINTMENT', payload: { appointment } });
  }, []);

  const cancelAppointment = useCallback((id: string) => {
    dispatch({ type: 'CANCEL_APPOINTMENT', payload: { id } });
  }, []);

  const addActivityRegistration = useCallback((activity: ActivityRegistration) => {
    dispatch({ type: 'ADD_ACTIVITY_REGISTRATION', payload: { activity } });
  }, []);

  const cancelActivityRegistration = useCallback((id: string) => {
    dispatch({ type: 'CANCEL_ACTIVITY_REGISTRATION', payload: { id } });
  }, []);

  const updatePrivacy = useCallback((privacy: PrivacySettings) => {
    dispatch({ type: 'UPDATE_PRIVACY', payload: { privacy } });
  }, []);

  // 管理后台便捷方法
  const adminLogin = useCallback((user: AdminUser) => {
    dispatch({ type: 'ADMIN_LOGIN', payload: { user } });
  }, []);

  const adminLogout = useCallback(() => {
    dispatch({ type: 'ADMIN_LOGOUT' });
  }, []);

  const updateTalentStatus = useCallback((id: string, status: TalentStatus, note?: string) => {
    dispatch({ type: 'UPDATE_TALENT_STATUS', payload: { id, status, note } });
  }, []);

  const addFollowUp = useCallback(
    (talentId: string, content: string) => {
      dispatch({ type: 'ADD_FOLLOW_UP', payload: { talentId, content, operator: state.adminUser?.name || '系统' } });
    },
    [state.adminUser]
  );

  const updatePolicyRule = useCallback((id: string, updates: Partial<PolicyRule>) => {
    dispatch({ type: 'UPDATE_POLICY_RULE', payload: { id, updates } });
  }, []);

  const updateOrder = useCallback((id: string, updates: Partial<ServiceOrder>) => {
    dispatch({ type: 'UPDATE_ORDER', payload: { id, updates } });
  }, []);

  const authorizeToPool = useCallback((talent: AdminTalent) => {
    dispatch({ type: 'AUTHORIZE_TO_POOL', payload: { talent } });
  }, []);

  const exportTodoList = useCallback(
    (planId: string) => {
      const plan = state.growthPlans.find((p) => p.id === planId);
      if (!plan) return '';
      const lines = [
        `${plan.title} 待办清单`,
        `生成时间：${new Date(plan.generatedAt).toLocaleString('zh-CN')}`,
        '',
        ...plan.tasks.map((t, i) => `${i + 1}. ${t.completed ? '[已完成]' : '[待办]'} ${t.title}`),
        '',
        '办理渠道：',
        ...plan.tasks.map((t) => `- ${t.channelName}: ${t.channelUrl}`),
      ];
      return lines.join('\n');
    },
    [state.growthPlans],
  );

  const value: AppContextValue = {
    entered,
    enterApp,
    goHome,
    logout,
    state,
    nav,
    dispatch,
    dispatchNav,
    navigateTo,
    navigateBack,
    openPolicyDetail,
    closePolicyDetail,
    addMessage,
    setPhase,
    setLoading,
    sendMessage,
    showToast,
    toast: toastState,
    setProfileSection,
    updateAccount,
    addMatchRecord,
    deleteMatchRecord,
    addResume,
    updateResume,
    deleteResume,
    setDefaultResume,
    addCredential,
    deleteCredential,
    addFavorite,
    deleteFavorite,
    updateSubscription,
    markNotificationRead,
    markAllNotificationsRead,
    addGrowthPlan,
    deleteGrowthPlan,
    toggleGrowthTask,
    addAppointment,
    cancelAppointment,
    addActivityRegistration,
    cancelActivityRegistration,
    updatePrivacy,
    exportTodoList,
    adminLogin,
    adminLogout,
    updateTalentStatus,
    addFollowUp,
    updatePolicyRule,
    updateOrder,
    authorizeToPool,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ===================================================================
// Hook
// ===================================================================

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within AppProvider');
  }
  return ctx;
}

// ===================================================================
// Helper: create message object
// ===================================================================

export function createMessage(
  type: 'ai' | 'user',
  content: string,
  richContents?: RichContent[],
): ChatMessage {
  return {
    id: genId(),
    type,
    content,
    richContents,
    timestamp: Date.now(),
  };
}
