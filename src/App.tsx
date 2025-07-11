// App.tsx

import PixelCanvas from './components/canvas/PixelCanvas';

import React, { useRef, useEffect, useCallback, useState } from 'react'; // UI 상태 관리를 위해 import
import { useLocation } from 'react-router-dom';

import { useModalStore } from './store/modalStore';

import Modal from './components/modal/Modal';
import { useAuthStore } from './store/authStrore';
import apiClient from './services/apiClient';
import Chat from './components/chat/Chat';
import MyPageModalContent from './components/modal/MyPageModalContent';
import LoginModalContent from './components/modal/LoginModalContent';
import GroupModalContent from './components/modal/GroupModalContent';
import CanvasModalContent from './components/modal/CanvasModalContent';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';

type DecodedToken = {
  sub: {
    userId: string;
    nickName: string;
  };
  jti: string;
  exp: number;
  iat: number;
};

function App() {
  // URL에서 ?canvas_id= 값을 읽어온다
  const { search } = useLocation();
  const canvas_id = new URLSearchParams(search).get('canvas_id') || '';

  const {
    isLoginModalOpen,
    closeLoginModal,
    isMyPageModalOpen,
    closeMyPageModal,
    isGroupModalOpen,
    closeGroupModal,
    isCanvasModalOpen,
    closeCanvasModal,
  } = useModalStore();

  // if (!canvas_id) {
  //   return <div className='text-red-500'> canvas_id 쿼리가 필요합니다.</div>;
  // }

  const { isLoggedIn, setAuth, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [canvasLoading, setCanvasLoading] = useState(true);

  useEffect(() => {
    //=======canvas_id 파싱
    const { search } = window.location;
    const newId = new URLSearchParams(search).get('canvas_id') || '';
    console.log('initial_canvas_id:', canvas_id);
    //=======로그인========
    const authResultString = sessionStorage.getItem('authResult');

    if (authResultString) {
      sessionStorage.removeItem('authResult');
      const { accessToken, user } = JSON.parse(authResultString);
      setAuth(accessToken, user);

      setIsLoading(false);
    } else {
      const checkLoginStatus = async () => {
        try {
          const response = await apiClient.post('/auth/refresh');
          const authHeader = response.headers['authorization'];
          const newAccessToken = authHeader?.split(' ')[1];
          const decodedToken = jwtDecode<DecodedToken>(newAccessToken);
          const user = {
            userId: decodedToken.sub.userId,
            nickname: decodedToken.sub.nickName,
          };
          console.log(user);
          setAuth(newAccessToken, user);
        } catch (error) {
          // 실패 시 (유효한 RT 없음) 로그아웃 상태

          clearAuth();
        } finally {
          setIsLoading(false);
        }
      };
      checkLoginStatus();
    }
  }, [setAuth, clearAuth]);

  return (
    <main className='flex h-screen w-screen items-center justify-center bg-[#2d3748]'>
      <PixelCanvas
        canvas_id={canvas_id}
        key={canvas_id}
        onLoadingChange={setCanvasLoading}
      />
      <Modal isOpen={isLoginModalOpen} onClose={closeLoginModal}>
        <LoginModalContent onClose={closeLoginModal} />
      </Modal>
      <Modal isOpen={isMyPageModalOpen} onClose={closeMyPageModal}>
        <MyPageModalContent />
      </Modal>
      <Modal isOpen={isGroupModalOpen} onClose={closeGroupModal}>
        <GroupModalContent />
      </Modal>
      <Modal isOpen={isCanvasModalOpen} onClose={closeCanvasModal}>
        <CanvasModalContent onClose={closeCanvasModal} />
      </Modal>
      {/* 로딩 완료 후 채팅 컴포넌트 표시 */}
      {!isLoading &&
        !canvasLoading &&
        (() => {
          try {
            return <Chat />;
          } catch (error) {
            console.error('Chat 컴포넌트 에러:', error);
            return (
              <div className='fixed bottom-5 left-5 text-red-500'>
                채팅 로드 실패
              </div>
            );
          }
        })()}
    </main>
  );
}

export default App;
