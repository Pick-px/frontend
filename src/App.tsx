// App.tsx

import PixelCanvas from './components/PixelCanvas';

import React, { useState, useEffect } from 'react'; // UI 상태 관리를 위해 import
import { useLocation } from 'react-router-dom';

import { useModalStore } from './store/modalStore';
import LoginModalContent from './components/modal/LoginModalContent';
import Modal from './components/modal/Modal';
import { useAuthStore } from './store/authStrore';
import apiClient from './services/apiClient';
import Chat from './components/chat/ChatUI';
import MyPageModalContent from './components/modal/MyPageModalContent';

type HoverPos = { x: number; y: number } | null;

function App() {
  // URL에서 ?canvas_id= 값을 읽어온다
  const { search } = useLocation();
  const canvas_id = new URLSearchParams(search).get('canvas_id') || '';

  // UI와 캔버스가 공유해야 할 상태들을 App에서 관리 => 색상 정보 및 cursor 가 가리키는 픽셀 정보
  const [color, setColor] = useState('#ffffff');
  const [hoverPos, setHoverPos] = useState<HoverPos>(null);
  const colors = ['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff']; // 예시 색상
  const {
    isLoginModalOpen,
    closeLoginModal,
    isMyPageModalOpen,
    closeMyPageModal,
  } = useModalStore();
  // if (!canvas_id) {
  //   return <div className='text-red-500'> canvas_id 쿼리가 필요합니다.</div>;
  // }

  const { isLoggedIn, setAuth, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authResultString = sessionStorage.getItem('authResult');

    if (authResultString) {
      sessionStorage.removeItem('authResult');

      const { accessToken, user } = JSON.parse(authResultString);

      setAuth(accessToken, user);

      setIsLoading(false);
    } else {
      // const checkLoginStatus = async () => {
      //   try {
      //     const response = await apiClient.post('/auth/refresh');
      //     setAuth(response.data.accessToken, response.data.user);
      //   } catch (error) {
      //     // 실패 시 (유효한 RT 없음) 로그아웃 상태
      //     clearAuth();
      //   } finally {
      //     setIsLoading(false);
      //   }
      // };
      // checkLoginStatus();
    }
  }, [setAuth, clearAuth]);

  return (
    <main className='flex h-screen w-screen items-center justify-center bg-[#2d3748]'>
      <PixelCanvas
        color={color}
        setColor={setColor}
        hoverPos={hoverPos}
        setHoverPos={setHoverPos}
        colors={colors}
        canvas_id={canvas_id}
      />
      <Modal isOpen={isLoginModalOpen} onClose={closeLoginModal}>
        <LoginModalContent onClose={closeLoginModal} />
      </Modal>
      <Modal isOpen={isMyPageModalOpen} onClose={closeMyPageModal}>
        <MyPageModalContent />
      </Modal>
      <Chat />
    </main>
  );
}

export default App;
