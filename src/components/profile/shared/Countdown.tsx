import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownProps {
  targetTime: number;
}

export const Countdown: React.FC<CountdownProps> = ({ targetTime }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = targetTime - Date.now();
      if (diff <= 0) {
        setText('已截止');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (days > 0) {
        setText(`剩余 ${days} 天`);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        setText(`剩余 ${hours} 小时`);
      }
    };
    update();
    const timer = setInterval(update, 1000 * 60);
    return () => clearInterval(timer);
  }, [targetTime]);

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">
      <Clock className="h-3 w-3" />
      {text}
    </span>
  );
};
