// src/components/modal/MyPageModalContent.tsx (새 파일)

import React from 'react';
import { useAuthStore } from '../../store/authStrore';
import { authService } from '../../services/authService';
import { useModalStore } from '../../store/modalStore';

export default function MyPageModalContent() {
  // ✨ 1. authStore에서 로그인 상태와 유저 정보, 로그아웃 함수를 가져옵니다.
  const { isLoggedIn, user, clearAuth } = useAuthStore();
  console.log(isLoggedIn);
  // 모달을 닫기 위한 함수
  const { closeMyPageModal } = useModalStore();

  const handleLogout = async () => {
    await authService.logout(); // 서버에 로그아웃 요청
    clearAuth(); // 클라이언트 상태(Zustand) 초기화
    closeMyPageModal(); // 로그아웃 후 모달 닫기
  };

  return (
    <div>
      <h2 className='mb-4 text-xl font-bold'>마이페이지</h2>
      {/* ✨ 2. isLoggedIn 상태에 따라 다른 UI를 보여줍니다. */}
      {isLoggedIn && user ? (
        // --- 로그인 된 경우 ---
        <div className='flex flex-col gap-4'>
          <p>
            안녕하세요,{' '}
            <span className='font-bold'>{user.nickname || user.userId}</span>님!
          </p>
          <p>환영합니다.</p>
          <button
            onClick={handleLogout}
            className='mt-4 w-full rounded bg-red-500 py-2 text-white'
          >
            로그아웃
          </button>
        </div>
      ) : (
        // --- 로그인 안 된 경우 ---
        <div>
          <p>로그인이 필요한 서비스입니다.</p>
        </div>
      )}
    </div>
  );
}
