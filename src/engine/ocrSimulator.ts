import { TalentProfile, DEMO_PROFILE } from '../types';

const OCR_STEPS = [
  'AI正在解析简历...',
  '正在识别学历背景...',
  '正在提取项目成果...',
  '正在生成人才画像...',
];

const STEP_DURATION = 600; // ms per step

export interface OcrProgressInfo {
  step: number;
  progress: number;
  text: string;
}

/**
 * OCR 模拟器：4 步动画，每步 600ms，总 2.4s。
 * @param onProgress 每步回调
 * @param onComplete 完成回调，返回 demo profile
 * @returns cancel 函数，可用于取消模拟
 */
export function startOcrSimulator(
  onProgress: (info: OcrProgressInfo) => void,
  onComplete: (profile: TalentProfile) => void,
): () => void {
  let cancelled = false;
  let timers: ReturnType<typeof setTimeout>[] = [];

  for (let i = 0; i < OCR_STEPS.length; i++) {
    const timer = setTimeout(() => {
      if (cancelled) return;
      onProgress({
        step: i + 1,
        progress: Math.round(((i + 1) / OCR_STEPS.length) * 100),
        text: OCR_STEPS[i],
      });

      if (i === OCR_STEPS.length - 1) {
        // Final step — small delay then complete
        const completeTimer = setTimeout(() => {
          if (cancelled) return;
          onComplete(getDemoProfile());
        }, 200);
        timers.push(completeTimer);
      }
    }, STEP_DURATION * (i + 1));
    timers.push(timer);
  }

  return () => {
    cancelled = true;
    timers.forEach((t) => clearTimeout(t));
  };
}

/**
 * 获取模拟解析出的人才画像。
 */
export function getDemoProfile(): TalentProfile {
  return { ...DEMO_PROFILE, achievements: [...DEMO_PROFILE.achievements] };
}

export { OCR_STEPS };
