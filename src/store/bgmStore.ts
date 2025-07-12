import { create } from 'zustand';

interface BgmState {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
}

export const useBgmStore = create<BgmState>((set) => ({
  isPlaying: true,
  setIsPlaying: (isPlaying) => set({ isPlaying }),
}));
