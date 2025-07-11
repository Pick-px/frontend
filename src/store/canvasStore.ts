import { create } from 'zustand';

interface CanvasState {
  canvas_id: string;
  isCanvasEnded: boolean;
  setCanvasId: (id: string) => void;
  setIsCanvasEnded: (isEnded: boolean) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  canvas_id: '',
  isCanvasEnded: false,
  setCanvasId: (id) => set({ canvas_id: id }),
  setIsCanvasEnded: (isEnded) => set({ isCanvasEnded: isEnded }),
}));
