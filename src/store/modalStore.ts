// src/stores/modalStore.ts

import { create } from 'zustand';

type ModalState = {
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;

  isCanvasModalOpen: boolean;
  openCanvasModal: () => void;
  closeCanvasModal: () => void;

  isAlbumModalOpen: boolean;
  openAlbumModal: () => void;
  closeAlbumModal: () => void;

  isMyPageModalOpen: boolean;
  openMyPageModal: () => void;
  closeMyPageModal: () => void;

  isGroupModalOpen: boolean;
  openGroupModal: () => void;
  closeGroupModal: () => void;
};

export const useModalStore = create<ModalState>((set) => ({
  // 기존 로그인 모달 상태
  isLoginModalOpen: false,
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),

  isCanvasModalOpen: false,
  openCanvasModal: () => set({ isCanvasModalOpen: true }),
  closeCanvasModal: () => set({ isCanvasModalOpen: false }),

  isAlbumModalOpen: false,
  openAlbumModal: () => set({ isAlbumModalOpen: true }),
  closeAlbumModal: () => set({ isAlbumModalOpen: false }),

  isMyPageModalOpen: false,
  openMyPageModal: () => set({ isMyPageModalOpen: true }),
  closeMyPageModal: () => set({ isMyPageModalOpen: false }),

  isGroupModalOpen: false,
  openGroupModal: () => set({ isGroupModalOpen: true }),
  closeGroupModal: () => set({ isGroupModalOpen: false }),
}));
