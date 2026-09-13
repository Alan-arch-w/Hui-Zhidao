import { ChatPhase, ChatMessage, QUIZ_QUESTIONS, MatchResult } from '../types';

export interface PhaseTransitionResult {
  nextPhase: ChatPhase;
  messages: Omit<ChatMessage, 'id' | 'timestamp'>[];
}

/**
 * 根据当前阶段和触发动作，返回下一阶段以及需要追加的消息（含富组件）。
 * @param current 当前阶段
 * @param action 触发动作名称
 * @param context 上下文信息（currentQuizIndex、profile、matchResults 等）
 */
export function advancePhase(
  current: ChatPhase,
  action: string,
  context: {
    currentQuizIndex?: number;
    profile?: any;
    matchResults?: MatchResult[];
    fileName?: string;
  } = {},
): PhaseTransitionResult {
  switch (current) {
    case 'welcome':
      if (action === 'start') {
        return {
          nextPhase: 'upload_guide',
          messages: [
            {
              type: 'ai',
              content: '太好了！请上传你的简历（PDF、Word 或图片格式），我来为你解析人才画像。',
              richContents: [{ type: 'upload', data: {} }],
            },
          ],
        };
      }
      break;

    case 'upload_guide':
      if (action === 'file_selected') {
        return {
          nextPhase: 'ocr_parsing',
          messages: [
            {
              type: 'user',
              content: `已上传简历：${context.fileName || '简历文件'}`,
            },
            {
              type: 'ai',
              content: '收到！正在解析你的简历…',
              richContents: [{ type: 'ocr_progress', data: {} }],
            },
          ],
        };
      }
      break;

    case 'ocr_parsing':
      if (action === 'complete') {
        const profile = context.profile;
        return {
          nextPhase: 'profile_generated',
          messages: [
            {
              type: 'ai',
              content: `简历解析完成！我提取到了以下关键信息，你属于「${profile?.talentType || '人才'}」。信息完整度 70%，还有几个关键问题需要确认。`,
              richContents: [
                { type: 'profile_card', data: { profile } },
                { type: 'progress_badge', data: { completeness: 70 } },
              ],
            },
          ],
        };
      }
      break;

    case 'profile_generated':
      if (action === 'continue') {
        const q = QUIZ_QUESTIONS[0];
        return {
          nextPhase: 'quiz',
          messages: [
            {
              type: 'ai',
              content: q.question,
              richContents: [{ type: 'quiz_options', data: { question: q, index: 0 } }],
            },
          ],
        };
      }
      break;

    case 'quiz':
      if (action === 'answer') {
        const nextIndex = (context.currentQuizIndex ?? 0) + 1;
        if (nextIndex >= QUIZ_QUESTIONS.length) {
          // Last question answered → matching
          return {
            nextPhase: 'matching',
            messages: [
              {
                type: 'ai',
                content: '信息收集完成！基于你的画像，我正在为你匹配相关政策…',
                richContents: [],
              },
            ],
          };
        }
        const q = QUIZ_QUESTIONS[nextIndex];
        return {
          nextPhase: 'quiz',
          messages: [
            {
              type: 'ai',
              content: q.question,
              richContents: [{ type: 'quiz_options', data: { question: q, index: nextIndex } }],
            },
          ],
        };
      }
      break;

    case 'matching':
      if (action === 'done') {
        const results = context.matchResults || [];
        return {
          nextPhase: 'results',
          messages: [
            {
              type: 'ai',
              content: '匹配完成！基于你的画像，我为你匹配到以下政策，按匹配度排序：',
              richContents: [
                { type: 'match_result', data: { results: results.slice(0, 3) } },
                { type: 'disclaimer', data: {} },
              ],
            },
          ],
        };
      }
      break;

    case 'results':
      if (action === 'suggestion') {
        return {
          nextPhase: 'suggestion',
          messages: [
            {
              type: 'ai',
              content:
                '基于你的完整画像，我建议你优先关注人才租房补贴，其次关注U30科创极客召集令。需要我帮你整理材料清单吗？',
              richContents: [{ type: 'suggestion', data: { results: context.matchResults || [] } }],
            },
          ],
        };
      }
      break;

    case 'suggestion':
      if (action === 'done') {
        return {
          nextPhase: 'completed',
          messages: [],
        };
      }
      break;

    default:
      break;
  }

  // No transition
  return { nextPhase: current, messages: [] };
}
