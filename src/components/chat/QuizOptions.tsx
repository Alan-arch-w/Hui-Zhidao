import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { QuizQuestion } from '../../types';
import { useApp } from '../../store/AppContext';
import { QUIZ_QUESTIONS } from '../../types';

interface QuizOptionsProps {
  question: QuizQuestion;
  index: number;
}

export const QuizOptions: React.FC<QuizOptionsProps> = ({ question, index }) => {
  const { state, dispatch, addMessage } = useApp();
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const handleSelect = (option: string) => {
    if (submitted) return;
    if (question.multi) {
      setSelected((prev) =>
        prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option],
      );
    } else {
      // Single select — submit immediately
      setSelected([option]);
      setSubmitted(true);
      submitAnswer([option]);
    }
  };

  const handleConfirmMulti = () => {
    if (selected.length === 0) return;
    setSubmitted(true);
    submitAnswer(selected);
  };

  const submitAnswer = (answer: string[]) => {
    const answerText = answer.join('、');
    addMessage({ type: 'user', content: answerText });

    const isLast = state.currentQuizIndex >= QUIZ_QUESTIONS.length - 1;
    dispatch({ type: 'QUIZ_ANSWER', payload: { questionId: question.id, answer } });

    if (isLast) {
      addMessage({
        type: 'ai',
        content: '信息收集完成！基于你的画像，我正在为你匹配相关政策…',
      });
    } else {
      const nextIndex = state.currentQuizIndex + 1;
      const nextQ = QUIZ_QUESTIONS[nextIndex];
      setTimeout(() => {
        addMessage({
          type: 'ai',
          content: nextQ.question,
          richContents: [{ type: 'quiz_options', data: { question: nextQ, index: nextIndex } }],
        });
      }, 300);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 max-w-md space-y-2"
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0f3a32]/10 text-[10px] font-bold text-[#2e7066]">
          {index + 1}
        </span>
        <span className="text-xs text-slate-400">
          第 {index + 1} / {QUIZ_QUESTIONS.length} 题
        </span>
      </div>

      <div className="space-y-2">
        {question.options.map((option) => {
          const isSelected = selected.includes(option);
          const showSelected = submitted && isSelected;
          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={submitted}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                showSelected
                  ? 'border-[#2e7066] bg-[#0f3a32]/5 text-[#2e7066]'
                  : isSelected
                    ? 'border-[#2e7066]/40 bg-[#0f3a32]/5 text-[#2e7066]'
                    : submitted
                      ? 'border-slate-200 bg-white text-slate-400'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-[#2e7066]/30 hover:bg-[#0f3a32]/5'
              }`}
            >
              <span>{option}</span>
              {isSelected && <Check className="h-4 w-4 text-[#2e7066]" />}
            </button>
          );
        })}
      </div>

      {question.multi && !submitted && (
        <button
          onClick={handleConfirmMulti}
          disabled={selected.length === 0}
          className="w-full rounded-xl bg-[#2e7066] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#1a4f47] disabled:cursor-not-allowed disabled:opacity-50"
        >
          确认选择 {selected.length > 0 && `(${selected.length})`}
        </button>
      )}

      {submitted && (
        <p className="text-xs text-slate-400">已选择：{selected.join('、')}</p>
      )}
    </motion.div>
  );
};
