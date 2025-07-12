import { create } from 'zustand';

interface chatState {
  leader: string;
  setLeader: (id: string) => void;
  isSyncEnabled: boolean;
  setIsSyncEnabled: (enabled: boolean) => void;
}

export const useChatStore = create<chatState>((set) => ({
  leader: '',
  setLeader: (id) => set({ leader: id }),
  isSyncEnabled: false,
  setIsSyncEnabled: (enabled) => set({ isSyncEnabled: enabled }),
}));
