import { useCallback, useEffect } from 'react';
import socketService from '../services/socketService';
import { useCanvasUiStore } from '../store/canvasUiStore';
import { useAuthStore } from '../store/authStrore';

interface GameSocketProps {
  sourceCanvasRef: React.RefObject<HTMLCanvasElement>;
  draw: () => void;
  canvas_id: string;
  onCooldownReceived?: (cooldown: {
    cooldown: boolean;
    remaining: number;
  }) => void;
  onDeadPixels?: (data: {
    pixels: Array<{ x: number; y: number; color: string }>;
    username: string;
  }) => void;
}

export const useGameSocket = ({
  sourceCanvasRef,
  draw,
  canvas_id,
  onCooldownReceived,
  onDeadPixels,
}: GameSocketProps) => {
  // 쿨다운 상태 가져오기
  const cooldown = useCanvasUiStore(state => state.cooldown);
  const startCooldown = useCanvasUiStore(state => state.startCooldown);
  
  // 로그인 상태 확인
  const isLoggedIn = useAuthStore(state => state.isLoggedIn);
  const accessToken = useAuthStore(state => state.accessToken);

  // 소켓 연결 및 이벤트 리스너 등록
  useEffect(() => {
    if (!canvas_id) return;
    
    console.log('GameSocket 초기화:', { isLoggedIn, hasToken: !!accessToken });

    // 소켓 연결
    if (!socketService.socket) {
      socketService.connect(canvas_id);
    }

    // 픽셀 업데이트 이벤트 리스너
    const onPixelUpdate = (pixel: { x: number; y: number; color: string }) => {
      const sourceCtx = sourceCanvasRef.current?.getContext('2d');
      if (sourceCtx) {
        sourceCtx.fillStyle = pixel.color;
        sourceCtx.fillRect(pixel.x, pixel.y, 1, 1);
        draw();
      }
    };

    // 쿨다운 이벤트 리스너
    const onCooldown = (data: { cooldown: boolean; remaining: number }) => {
      if (onCooldownReceived) {
        onCooldownReceived(data);
      }
    };

    // 죽은 픽셀 이벤트 리스너
    const onDeadPixelsEvent = (data: any) => {
      if (onDeadPixels) {
        onDeadPixels(data);
      }
    };

    // 이벤트 리스너 등록
    if (socketService.socket) {
      socketService.socket.on('pixel_update', onPixelUpdate);
      socketService.socket.on('cooldown', onCooldown);
      socketService.socket.on('dead_pixels', onDeadPixelsEvent);
      
      // 에러 이벤트 리스너
      socketService.socket.on('connect_error', (error) => {
        console.error('소켓 연결 에러:', error.message);
      });
      
      socketService.socket.on('auth_error', (error) => {
        console.error('인증 에러:', error.message);
      });
    }

    // 클린업 함수
    return () => {
      if (socketService.socket) {
        socketService.socket.off('pixel_update', onPixelUpdate);
        socketService.socket.off('cooldown', onCooldown);
        socketService.socket.off('dead_pixels', onDeadPixelsEvent);
        socketService.socket.off('connect_error');
        socketService.socket.off('auth_error');
      }
    };
  }, [canvas_id, draw, onCooldownReceived, onDeadPixels, sourceCanvasRef, isLoggedIn, accessToken]);

  // 픽셀 전송 함수
  const sendPixel = useCallback(
    (pixel: { x: number; y: number; color: string }) => {
      if (!canvas_id || !socketService.socket || cooldown) return;
      
      console.log('픽셀 전송:', { ...pixel, canvas_id });
      socketService.socket.emit('draw_pixel', { ...pixel, canvas_id });
      startCooldown(3);
    },
    [canvas_id, cooldown, startCooldown]
  );

  // 게임 결과 전송 함수
  const sendGameResult = useCallback(
    (data: { x: number; y: number; color: string; result: boolean }) => {
      if (!canvas_id || !socketService.socket || cooldown) return;
      
      console.log('게임 결과 전송:', { ...data, canvas_id });
      socketService.socket.emit('send_result', { ...data, canvas_id });
      startCooldown(3);
    },
    [canvas_id, cooldown, startCooldown]
  );

  return { sendPixel, sendGameResult };
};