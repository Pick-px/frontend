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
  const isGame = isGameCanvasById(canvas_id); // canvas_id로 게임 캔버스 여부 확인

  const {
    isLoginModalOpen,
    closeLoginModal,
    isMyPageModalOpen,
    closeMyPageModal,
    isGroupModalOpen,
    closeGroupModal,
    isCanvasModalOpen,
    closeCanvasModal,
    isAlbumModalOpen,
    closeAlbumModal,
    isHelpModalOpen,
    closeHelpModal,
    isCanvasEndedModalOpen, // isCanvasEndedModalOpen 상태 가져오기
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
      <Modal isOpen={isHelpModalOpen} onClose={closeHelpModal}>
        <HelpModalContent />
      </Modal>
      {isCanvasEndedModalOpen && <CanvasEndedModal />}{' '}
      {/* 캔버스 종료 모달 렌더링 */}
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
