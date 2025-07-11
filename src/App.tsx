import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useModalStore } from './store/modalStore';
import { useCanvasStore } from './store/canvasStore'; // useCanvasStore import 추가

import Modal from './components/modal/Modal';
import { useAuthStore } from './store/authStrore';
import apiClient from './services/apiClient';
import Chat from './components/chat/Chat';
import MyPageModalContent from './components/modal/MyPageModalContent';
import LoginModalContent from './components/modal/LoginModalContent';
import GroupModalContent from './components/modal/GroupModalContent';
import CanvasModalContent from './components/modal/CanvasModalContent';
import CanvasEndedModalContent from './components/modal/CanvasEndedModalContent'; // CanvasEndedModalContent import 추가
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import PixelCanvas from './components/canvas/PixelCanvas';

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

  const { isCanvasEnded, setIsCanvasEnded } = useCanvasStore(); // isCanvasEnded 상태 가져오기

  const { isLoggedIn, setAuth, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // 캔버스 종료 모달 닫기 핸들러
  const closeCanvasEndedModal = () => {
    setIsCanvasEnded(false);
  };

  useEffect(() => {
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
          setAuth(newAccessToken, user);
        } catch (error) {
          clearAuth();
        } finally {
          setIsLoading(false);
        }
      };
      checkLoginStatus();
    }
  }, [setAuth, clearAuth]);

  return (
    <main className='touch-action-none flex h-screen w-screen items-center justify-center bg-[#2d3748]'>
      <PixelCanvas canvas_id={canvas_id} key={canvas_id} />
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
      {/* 캔버스 종료 모달 */}
      <Modal isOpen={isCanvasEnded} onClose={closeCanvasEndedModal} disableOutsideClick={true}>
        <CanvasEndedModalContent onClose={closeCanvasEndedModal} />
      </Modal>
      {!isLoading && (
        <Chat />
      )}
    </main>
  );
}

export default App;
