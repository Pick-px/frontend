// App.tsx

import PixelCanvas from './components/PixelCanvas';

import { useState, useEffect } from 'react'; // UI 상태 관리를 위해 import
import { useModalStore } from './store/modalStore';
import LoginModalContent from './components/modal/LoginModalContent';
import Modal from './components/modal/Modal';
import { useAuthStore } from './store/authStrore';
import apiClient from './services/apiClient';

type HoverPos = { x: number; y: number } | null;

function App() {
  // UI와 캔버스가 공유해야 할 상태들을 App에서 관리 => 색상 정보 및 cursor 가 가리키는 픽셀 정보
  const [color, setColor] = useState('#ffffff');
  const [hoverPos, setHoverPos] = useState<HoverPos>(null);
  const colors = ['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff']; // 예시 색상
  const { isLoginModalOpen, closeLoginModal } = useModalStore();

  const { isLoggedIn, setAuth, clearAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // 첫 로딩시 렌더링 상태 확인
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await apiClient.post('/auth/refresh');
        setAuth(response.data.accessToken, response.data.user);
      } catch (error) {
        // 실패 시 (유효한 RT 없음) 로그아웃 상태
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };
    checkLoginStatus();
  }, [setAuth, clearAuth]);

  return (
    <main className='flex h-screen w-screen items-center justify-center bg-[#2d3748]'>
      <PixelCanvas
        color={color}
        setColor={setColor}
        hoverPos={hoverPos}
        setHoverPos={setHoverPos}
        colors={colors}
        canvas_id={''}
      />
      <Modal isOpen={isLoginModalOpen} onClose={closeLoginModal}>
        <LoginModalContent onClose={closeLoginModal} />
      </Modal>
    </main>
  );
}

export default App;
