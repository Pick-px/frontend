import { create } from 'zustand';

// 🚨LOGIN 시 서버에서 반환하는 내용 맞게 추후 수정 예정
// Login 정보를 전역적으로 중앙저장소에서 관리 => 로그인 상태 확인 위한 Props 전달과정의 간소화 목적

type User = {
  userId: string;
  // nickname: string;
  // email: string;
};

type AuthState = {
  isLoggedIn: boolean;
  accessToken: string | null;
  user: User | null;
  setAuth: (token: string, userData: User) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  accessToken: null, // JS의 메모리 안에 저장(Private 변수)
  user: null,
  setAuth: (token, userData) =>
    set({
      isLoggedIn: true,
      accessToken: token,
      user: userData,
    }),
  clearAuth: () =>
    set({
      isLoggedIn: false,
      accessToken: null,
      user: null,
    }),
}));
