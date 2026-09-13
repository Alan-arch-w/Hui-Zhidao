import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Upload, MessageCircle, ScanLine, ArrowRight } from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { ChatMessageItem } from './ChatMessageItem';
import { ChatInput } from './ChatInput';
import { runMatch } from '../../engine/matchEngine';
import { parseResume } from '../../services/api';
import { ChatPhase, QUIZ_QUESTIONS } from '../../types';
import { calculate as calcCompleteness } from '../../utils/completeness';
import { getMissingProfileFields, getClarifyFieldDef } from '../../utils/clarification';

const WelcomeScreen: React.FC = () => {
  const { dispatch, addMessage, setPhase, showToast } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsing, setParsing] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsing(true);
    setPhase('upload_guide');
    addMessage({ type: 'user', content: `已上传简历：${file.name}` });
    dispatch({ type: 'FILE_SELECTED', payload: { fileName: file.name } });
    addMessage({
      type: 'ai',
      content: '收到！正在解析你的简历，提取人才画像…',
      richContents: [{ type: 'ocr_progress', data: {} }],
    });

    try {
      const { profile } = await parseResume(file);
      const completeness = calcCompleteness(profile);
      dispatch({ type: 'OCR_COMPLETE', payload: { profile } });
      const missing = getMissingProfileFields(profile);
      const clarifyText =
        missing.length > 0
          ? `简历解析完成！已提取到基础信息，但还有 ${missing.length} 项关键信息需要确认，我会逐一向你提问。`
          : `简历解析完成！信息完整度 ${completeness}%，接下来请回答几个与政策匹配相关的问题。`;
      addMessage({
        type: 'ai',
        content: clarifyText,
        richContents: [
          { type: 'profile_card', data: { profile } },
          { type: 'progress_badge', data: { completeness } },
        ],
      });
      showToast('简历解析完成');
    } catch (err) {
      const message = err instanceof Error ? err.message : '解析失败';
      addMessage({
        type: 'ai',
        content: `简历解析失败：${message}。请检查文件是否可读取，或直接输入文字告诉我你的情况。`,
      });
      showToast('简历解析失败：' + message);
      dispatch({ type: 'SET_PHASE', payload: { phase: 'upload_guide' } });
    } finally {
      setParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="mb-8 text-center">
            <h2 className="mb-2 text-xl font-semibold text-slate-800 md:text-2xl">你好，欢迎来到汇知道</h2>
            <p className="text-xs text-slate-500 md:text-sm">
            上传简历或输入问题，即可获取徐汇区人才政策建议
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={parsing}
            className="group flex flex-col items-start rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-[#2e7066]/30 hover:shadow-md md:p-6"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f3a32]/5 text-[#2e7066] transition group-hover:bg-[#2e7066] group-hover:text-white md:h-11 md:w-11">
              <Upload className="h-5 w-5" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-ink">上传简历</h3>
            <p className="text-xs text-slate-500">支持 PDF、Word、图片格式，自动解析人才画像</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#2e7066]">
              {parsing ? '解析中…' : '开始上传'}
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              onChange={handleFileSelect}
            />
          </button>

          <button
            onClick={() => {
              addMessage({
                type: 'ai',
                content: '你好，请直接描述你的情况，例如年龄、学历、工作经历或政策需求，我会一边回答一边帮你完善人才画像。',
              });
              setPhase('upload_guide');
              const input = document.querySelector<HTMLInputElement>('[data-chat-input]');
              setTimeout(() => input?.focus(), 100);
            }}
            className="group flex flex-col items-start rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-[#2e7066]/30 hover:shadow-md md:p-6"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[#0f3a32]/5 text-[#2e7066] transition group-hover:bg-[#2e7066] group-hover:text-white md:h-11 md:w-11">
              <MessageCircle className="h-5 w-5" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-ink">直接提问</h3>
            <p className="text-xs text-slate-500">用文字描述你的情况，政策顾问会即时回复</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[#2e7066]">
              去提问
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const ChatView: React.FC = () => {
  const { state, dispatch, addMessage } = useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const lastClarifyFieldRef = useRef<string | null>(null);
  const lastPhaseRef = useRef<ChatPhase>(state.phase);
  const isEmpty = state.messages.length === 0 && state.phase === 'welcome';

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [state.messages]);

  // Ask the next missing profile field when in clarifying phase
  useEffect(() => {
    if (
      state.phase === 'clarifying' &&
      state.currentClarifyField &&
      state.currentClarifyField !== lastClarifyFieldRef.current
    ) {
      const def = getClarifyFieldDef(state.currentClarifyField);
      addMessage({
        type: 'ai',
        content: `为了更精准地匹配政策，${def.question}`,
      });
      lastClarifyFieldRef.current = state.currentClarifyField;
    }
  }, [state.phase, state.currentClarifyField, addMessage]);

  // Auto-advance to first quiz question when profile is complete
  useEffect(() => {
    const prevPhase = lastPhaseRef.current;
    if (state.phase === 'quiz' && prevPhase !== 'quiz') {
      const q = QUIZ_QUESTIONS[0];
      addMessage({
        type: 'ai',
        content: '画像信息已补齐。接下来请回答几个与政策匹配相关的问题：',
        richContents: [{ type: 'quiz_options', data: { question: q, index: 0 } }],
      });
    }
    lastPhaseRef.current = state.phase;
  }, [state.phase, addMessage]);

  // Matching effect: triggered when phase becomes 'matching'
  useEffect(() => {
    if (state.phase !== 'matching') return;

    const timer = setTimeout(() => {
      const results = runMatch(state.profile, state.quizAnswers);
      dispatch({ type: 'MATCH_COMPLETE', payload: { results } });
      addMessage({
        type: 'ai',
        content: '匹配完成！基于你的画像，我为你匹配到以下政策，按匹配度排序：',
        richContents: [
          { type: 'match_result', data: { results: results.slice(0, 3) } },
          { type: 'disclaimer', data: {} },
        ],
      });
    }, 1500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase]);

  return (
    <div className="flex h-full flex-col bg-surface">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5 md:px-6 md:py-3">
        <div className="flex items-center gap-2.5 md:gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0f3a32] md:h-8 md:w-8">
            <MessageSquare className="h-3.5 w-3.5 text-white md:h-4 md:w-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-800 md:text-base">汇知道</h1>
            <p className="text-[10px] text-slate-500">徐汇区人才政策智能顾问</p>
          </div>
        </div>

        {/* Completeness indicator */}
        {state.completeness > 0 && (
          <div className="flex items-center gap-2">
            <span className="hidden text-xs text-slate-500 md:inline">信息完整度</span>
            <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100 md:w-24">
              <motion.div
                className={`h-full rounded-full ${
                  state.completeness >= 80
                    ? 'bg-green-600'
                    : state.completeness >= 50
                      ? 'bg-amber-500'
                      : 'bg-red-500'
                }`}
                animate={{ width: `${state.completeness}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-xs font-bold text-slate-800">{state.completeness}%</span>
          </div>
        )}
      </header>

      {isEmpty ? (
        <WelcomeScreen />
      ) : (
        <>
          {/* Messages area */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
            <div className="mx-auto max-w-3xl space-y-4">
              {state.messages.map((message) => (
                <ChatMessageItem key={message.id} message={message} />
              ))}

              {/* Typing indicator for loading or matching phase */}
              {(state.isLoading || state.phase === 'matching') && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0f3a32]">
                    <ScanLine className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex items-center gap-1.5 rounded-[16px_16px_16px_4px] bg-[#0f3a32]/5 px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#2e7066] [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#2e7066] [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-[#2e7066]" />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input area */}
          <ChatInput />
        </>
      )}
    </div>
  );
};
