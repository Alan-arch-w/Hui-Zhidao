import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  RefreshCw,
  Lightbulb,
  Send,
  Paperclip,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { SUGGESTED_QUESTIONS } from '../../types';
import { parseResume } from '../../services/api';
import { calculate as calcCompleteness } from '../../utils/completeness';
import { getMissingProfileFields, getClarifyFieldDef } from '../../utils/clarification';

export const ChatInput: React.FC = () => {
  const { state, dispatch, addMessage, setPhase, navigateTo, sendMessage, showToast } = useApp();
  const { phase, isLoading } = state;
  const [inputValue, setInputValue] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const submitText = async (content: string) => {
    if (!content.trim() || isLoading) return;
    if (phase === 'clarifying' && state.currentClarifyField) {
      addMessage({ type: 'user', content: content.trim() });
      dispatch({
        type: 'CLARIFY_ANSWER',
        payload: { fieldKey: state.currentClarifyField, answer: content.trim() },
      });
      return;
    }
    // 直接提问模式：交给大模型回答，并自动从对话中提取画像
    await sendMessage(content.trim());
  };

  const handleSend = () => {
    submitText(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleViewSuggestion = () => {
    addMessage({ type: 'user', content: '查看申报建议' });
    setPhase('suggestion');
    addMessage({
      type: 'ai',
      content:
        '基于你的完整画像，我建议你优先关注人才租房补贴，其次关注U30科创极客召集令。需要我帮你整理材料清单吗？',
      richContents: [{ type: 'suggestion', data: { results: state.matchResults } }],
    });
  };

  const handleViewResults = () => {
    navigateTo('results');
  };

  const handleRestart = () => {
    dispatch({ type: 'RESET_ALL' });
    showToast('已重置，可以重新开始咨询');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    addMessage({
      type: 'user',
      content: `已上传简历：${file.name}`,
    });
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
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isUploading = uploading || isLoading;
  // 在自由对话阶段始终保留引导问题气泡，固定流程阶段（简历补齐、追问、匹配等）不显示
  const showSuggestions = ['welcome', 'upload_guide', 'profile_generated'].includes(phase);

  return (
    <div className="border-t border-slate-200 bg-white px-4 py-3 md:px-6 md:py-4">
      <div className="mx-auto max-w-3xl space-y-3">
        {/* Quick actions for guided flow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-2"
        >
          {phase === 'results' && (
            <>
              <button
                onClick={handleViewSuggestion}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0f3a32] px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0d2e27]"
              >
                <Lightbulb className="h-4 w-4" />
                查看申报建议
              </button>
              <button
                onClick={handleViewResults}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                <ClipboardCheck className="h-4 w-4" />
                完整结果
              </button>
            </>
          )}

          {phase === 'completed' && (
            <button
              onClick={handleRestart}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              重新咨询
            </button>
          )}
        </motion.div>

        {/* Suggested question chips */}
        {showSuggestions && (
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => submitText(q)}
                disabled={isLoading}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-[#2e7066]/40 hover:bg-[#0f3a32]/5 hover:text-[#2e7066] disabled:opacity-50 md:px-3.5"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Free text input */}
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 transition-colors focus-within:border-[#2e7066] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#2e7066]/10">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title="上传简历"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-white hover:text-[#2e7066] disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
            onChange={handleFileSelect}
          />
          <input
            data-chat-input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isUploading}
            placeholder={
              phase === 'clarifying' && state.currentClarifyField
                ? `回答：${getClarifyFieldDef(state.currentClarifyField).placeholder}`
                : phase === 'welcome'
                  ? '输入你的问题，或直接上传简历…'
                  : '继续输入问题，会基于你的画像给出建议…'
            }
            className="flex-1 bg-transparent px-1 text-sm text-ink placeholder:text-slate-400 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isUploading}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#0f3a32] text-white transition-colors hover:bg-[#0d2e27] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
