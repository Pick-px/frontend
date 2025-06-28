// 중앙 저장소
import { create } from 'zustand';
type ModalState = {
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;

  // isConfirmModalOpen: boolean;
  // openConfirmModal: () => void;
};

// 2. 스토어를 생성합니다.
export const useModalStore = create<ModalState>((set) => ({
  // 초기 상태
  isLoginModalOpen: false,

  // 상태를 변경하는 액션들
  openLoginModal: () => set({ isLoginModalOpen: true }),
  closeLoginModal: () => set({ isLoginModalOpen: false }),
}));
