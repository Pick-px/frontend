import { create } from 'zustand';

interface chatState {
  leader: string;
  setLeader: (id: string) => void;
}

export const useChatStore = create<chatState>((set) => ({
  leader: '',
  setLeader: (id) => set({ leader: id }),
}));
