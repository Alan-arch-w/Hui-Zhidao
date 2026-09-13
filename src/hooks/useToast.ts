import { useCallback, useRef, useState } from 'react';

export interface ToastState {
  id: number;
  message: string;
  visible: boolean;
}

/**
 * Toast 通知 hook，管理一条自动消失的提示消息。
 */
export function useToast() {
  const [toast, setToast] = useState<ToastState>({ id: 0, message: '', visible: false });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((message: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setToast({ id: Date.now(), message, visible: true });
    timerRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2500);
  }, []);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setToast((prev) => ({ ...prev, visible: false }));
  }, []);

  return { toast, showToast, hideToast };
}
