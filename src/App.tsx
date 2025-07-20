// App.tsx

import PixelCanvas from './components/canvas/PixelCanvas';
import GameCanvas from './components/game/GameCanvas';
import { isGameCanvas, isGameCanvasById } from './utils/canvasTypeUtils';

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
import AlbumModalContent from './components/modal/AlbumModalContent';
import HelpModalContent from './components/modal/HelpModalContent';
import CanvasEndedModal from './components/modal/CanvasEndedModal'; // CanvasEndedModal import 추가
import NotificationToast from './components/toast/NotificationToast'; // NotificationToast import 추가
import { useToastStore } from './store/toastStore'; // useToastStore import 추가
import GameModalContent from './components/modal/GameModalContent';

type DecodedToken = {
  sub: {
    userId: string;
    nickName: string;
    email?: string;
    role?: string;
  };
  jti: string;
  exp: number;
  iat: number;
};

function App() {
  // URL에서 ?canvas_id= 값을 읽어온다
  const { search, state } = useLocation(); // state도 함께 가져옴
  const canvas_id = new URLSearchParams(search).get('canvas_id') || '';

  // state에서 isGame 정보를 가져오거나, 기존 isGameCanvasById로 판단
  const isGameFromState = state?.isGame || false;
  // const isGame = isGameFromState || isGameCanvasById(canvas_id); // state 정보 우선 사용
  const isGame = isGameFromState;

  const {
    isLoginModalOpen,
    closeLoginModal,
    isMyPageModalOpen,
    closeMyPageModal,
    isGroupModalOpen,
    closeGroupModal,
    isGameModalOpen,
    closeGameModal,
    isCanvasModalOpen,
    closeCanvasModal,
    isAlbumModalOpen,
    closeAlbumModal,
    isHelpModalOpen, // 스토어의 isHelpModalOpen을 직접 사용
    closeHelpModal,
    isCanvasEndedModalOpen, // isCanvasEndedModalOpen 상태 가져오기
    openHelpModal, // openHelpModal 액션 가져오기
  } = useModalStore();

  useEffect(() => {
    const hasSeenHelpModal = localStorage.getItem('hasSeenHelpModal');
    if (hasSeenHelpModal === null || hasSeenHelpModal === 'false') {
      openHelpModal(); // 첫 접속 시 또는 명시적으로 false인 경우 모달 열기
      localStorage.setItem('hasSeenHelpModal', 'true');
    }
  }, [openHelpModal]);

  const handleCloseHelpModal = useCallback(() => {
    closeHelpModal(); // 스토어의 상태만 업데이트
  }, [closeHelpModal]);

  const { isLoggedIn, setAuth, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [canvasLoading, setCanvasLoading] = useState(true);

  // useToastStore 훅 사용
  const showToast = useToastStore((state) => state.showToast);

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
            email: decodedToken.sub.email,
            role: decodedToken.sub.role,
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

  if (isLoading) {
    return (
      <main className='flex h-screen w-screen items-center justify-center bg-[#2d3748]'>
        <div className='h-16 w-16 animate-spin rounded-full border-t-4 border-b-4 border-cyan-400'></div>
      </main>
    );
  }

  return (
    <main className='touch-action-none flex h-screen w-screen items-center justify-center bg-[#2d3748]'>
      {isGame ? (
        <GameCanvas
          canvas_id={canvas_id}
          key={canvas_id}
          onLoadingChange={setCanvasLoading}
        />
      ) : (
        <PixelCanvas
          canvas_id={canvas_id}
          key={canvas_id}
          onLoadingChange={setCanvasLoading}
        />
      )}
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
      <Modal isOpen={isAlbumModalOpen} onClose={closeAlbumModal}>
        <AlbumModalContent onClose={closeAlbumModal} />
      </Modal>
      <Modal isOpen={isHelpModalOpen} onClose={handleCloseHelpModal} fullWidth={true}>
        <HelpModalContent />
      </Modal>
      <Modal isOpen={isGameModalOpen} onClose={closeGameModal}>
        <GameModalContent onClose={closeGameModal} />
      </Modal>
      {isCanvasEndedModalOpen && <CanvasEndedModal />}
      {/* NotificationToast 컴포넌트 추가 */}
      <NotificationToast />
      {/* 로딩 완료 후 채팅 컴포넌트 표시 */}
      {!isLoading &&
        !canvasLoading &&
        !isGame &&
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
