import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';
import { ChatMessage, RichContent } from '../../types';
import { UploadArea } from './UploadArea';
import { OcrProgress } from './OcrProgress';
import { ProfileCard } from './ProfileCard';
import { ProgressBadge } from './ProgressBadge';
import { QuizOptions } from './QuizOptions';
import { MatchResultCard } from './MatchResultCard';
import { SuggestionCard } from './SuggestionCard';

interface ChatMessageItemProps {
  message: ChatMessage;
}

const RichContentRenderer: React.FC<{ content: RichContent }> = ({ content }) => {
  switch (content.type) {
    case 'upload':
      return <UploadArea />;

    case 'ocr_progress':
      return <OcrProgress />;

    case 'profile_card':
      return <ProfileCard profile={content.data.profile} />;

    case 'progress_badge':
      return <ProgressBadge completeness={content.data.completeness} />;

    case 'quiz_options':
      return (
        <QuizOptions
          question={content.data.question}
          index={content.data.index}
        />
      );

    case 'match_result':
      return <MatchResultCard results={content.data.results} />;

    case 'suggestion':
      return <SuggestionCard results={content.data.results} />;

    case 'disclaimer':
      return null;

    default:
      return null;
  }
};

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const isAI = message.type === 'ai';

  if (isAI) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3"
      >
        {/* Avatar */}
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#0f3a32] shadow-sm">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="inline-block rounded-[16px_16px_16px_4px] bg-[#0f3a32]/5 px-4 py-2.5">
            <p className="text-sm leading-relaxed text-slate-800">{message.content}</p>
          </div>

          {/* Rich contents */}
          {message.richContents && message.richContents.length > 0 && (
            <div className="space-y-0">
              {message.richContents.map((rc, index) => (
                <RichContentRenderer key={index} content={rc} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  // User message
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-end"
    >
      <div className="inline-block max-w-[80%] rounded-[16px_16px_4px_16px] bg-[#2e7066] px-4 py-2.5">
        <p className="text-sm leading-relaxed text-white">{message.content}</p>
      </div>
    </motion.div>
  );
};
