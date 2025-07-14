import { create } from 'zustand';

interface ToastState {
  isOpen: boolean;
  message: string;
  canvasId: string | null;
  timeoutId: number | null; // setTimeout ID 저장

  showToast: (
    message: string,
    canvasId: string | null,
    duration?: number
  ) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
  isOpen: false,
  message: '',
  canvasId: null,
  timeoutId: null,

  showToast: (message, canvasId, duration) => {
    // 기존 타임아웃이 있다면 클리어
    if (get().timeoutId) {
      clearTimeout(get().timeoutId!);
    }

    set({ isOpen: true, message, canvasId });

    if (duration) {
      const id = setTimeout(() => {
        get().hideToast();
      }, duration);
      set({ timeoutId: id });
    }
  },

  hideToast: () => {
    // 토스트를 숨길 때 타임아웃도 클리어
    if (get().timeoutId) {
      clearTimeout(get().timeoutId!);
    }
    set({ isOpen: false, message: '', canvasId: null, timeoutId: null });
  },
}));
