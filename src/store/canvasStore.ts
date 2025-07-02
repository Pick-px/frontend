import { create } from 'zustand';

interface CanvasState {
  canvas_id: string;
  setCanvasId: (id: string) => void;
}

export const useCanvasStore = create<CanvasState>((set) => ({
  canvas_id: '',
  setCanvasId: (id) => set({ canvas_id: id }),
}));
