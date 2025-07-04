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
  openLoginModal: () =>
    set({
      isLoginModalOpen: true,
      isCanvasModalOpen: false,
      isAlbumModalOpen: false,
      isMyPageModalOpen: false,
      isGroupModalOpen: false,
    }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),

  isCanvasModalOpen: false,
  openCanvasModal: () =>
    set({
      isLoginModalOpen: false,
      isCanvasModalOpen: true,
      isAlbumModalOpen: false,
      isMyPageModalOpen: false,
      isGroupModalOpen: false,
    }),
  closeCanvasModal: () => set({ isCanvasModalOpen: false }),

  isAlbumModalOpen: false,
  openAlbumModal: () =>
    set({
      isLoginModalOpen: false,
      isCanvasModalOpen: false,
      isAlbumModalOpen: true,
      isMyPageModalOpen: false,
      isGroupModalOpen: false,
    }),
  closeAlbumModal: () => set({ isAlbumModalOpen: false }),

  isMyPageModalOpen: false,
  openMyPageModal: () =>
    set({
      isLoginModalOpen: false,
      isCanvasModalOpen: false,
      isAlbumModalOpen: false,
      isMyPageModalOpen: true,
      isGroupModalOpen: false,
    }),
  closeMyPageModal: () => set({ isMyPageModalOpen: false }),

  isGroupModalOpen: false,
  openGroupModal: () =>
    set({
      isLoginModalOpen: false,
      isCanvasModalOpen: false,
      isAlbumModalOpen: false,
      isMyPageModalOpen: false,
      isGroupModalOpen: true,
    }),
  closeGroupModal: () => set({ isGroupModalOpen: false }),
}));
