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

  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;

  isHelpModalOpen: boolean;
  openHelpModal: () => void;
  closeHelpModal: () => void;
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
      isChatOpen: false,
      isHelpModalOpen: false,
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
      isChatOpen: false,
      isHelpModalOpen: false,
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
      isChatOpen: false,
      isHelpModalOpen: false,
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
      isChatOpen: false,
      isHelpModalOpen: false,
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
      isChatOpen: false,
      isHelpModalOpen: false,
    }),
  closeGroupModal: () => set({ isGroupModalOpen: false }),

  // 채팅 모달 상태 추가
  isChatOpen: false,
  openChat: () =>
    set({
      isLoginModalOpen: false,
      isCanvasModalOpen: false,
      isAlbumModalOpen: false,
      isMyPageModalOpen: false,
      isGroupModalOpen: false,
      isChatOpen: true,
      isHelpModalOpen: false,
    }),
  closeChat: () => set({ isChatOpen: false }),

  // 도움말 모달 상태 추가
  isHelpModalOpen: false,
  openHelpModal: () =>
    set({
      isLoginModalOpen: false,
      isCanvasModalOpen: false,
      isAlbumModalOpen: false,
      isMyPageModalOpen: false,
      isGroupModalOpen: false,
      isChatOpen: false,
      isHelpModalOpen: true,
    }),
  closeHelpModal: () => set({ isHelpModalOpen: false }),
}));
