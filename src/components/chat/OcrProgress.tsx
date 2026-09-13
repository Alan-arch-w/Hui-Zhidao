import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { OCR_STEPS } from '../../engine/ocrSimulator';

export const OcrProgress: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    for (let i = 0; i < OCR_STEPS.length; i++) {
      const timer = setTimeout(() => {
        setCurrentStep(i + 1);
      }, 600 * (i + 1));
      timers.push(timer);
    }
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  const progress = Math.round((currentStep / OCR_STEPS.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3 max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="mb-4 flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-[#2e7066]" />
        <span className="text-sm font-medium text-slate-700">简历解析中</span>
        <span className="ml-auto text-sm font-bold text-[#2e7066]">{progress}%</span>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-[#2e7066] to-[#1a4f47]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {OCR_STEPS.map((step, index) => {
          const done = index < currentStep;
          const active = index === currentStep;
          return (
            <div
              key={index}
              className={`flex items-center gap-2 text-sm transition-colors ${
                done ? 'text-slate-600' : active ? 'text-[#2e7066]' : 'text-slate-300'
              }`}
            >
              {done ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : active ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="h-4 w-4 rounded-full border-2 border-slate-200" />
              )}
              <span className={active ? 'animate-pulse-soft font-medium' : ''}>{step}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
