import { useEffect, useRef, useState } from 'react';
import socketService from '../services/socketService';
import { useAuthStore } from '../store/authStrore';
import { useCanvasStore } from '../store/canvasStore';
import { toast } from 'react-toastify';

interface PixelData {
  x: number;
  y: number;
  color: string;
}

export const useGameSocket = (
  onPixelReceived: (pixel: PixelData) => void,
  canvas_id: string | undefined,
  onDeadPixels?: (data: {
    pixels: Array<{ x: number; y: number; color: string }>;
    username: string;
  }) => void,
  onDeadNotice?: (data: { message: string }) => void
) => {
  // 디버깅: useGameSocket 후크에서 canvas_id 값 확인
  const { accessToken, user } = useAuthStore();
  const pixelCallbackRef = useRef(onPixelReceived);
  const deadPixelsCallbackRef = useRef(onDeadPixels);
  const deadNoticeCallbackRef = useRef(onDeadNotice);

  // 콜백 함수 업데이트
  pixelCallbackRef.current = onPixelReceived;
  deadPixelsCallbackRef.current = onDeadPixels;
  deadNoticeCallbackRef.current = onDeadNotice;

  useEffect(() => {
    // 스토어에서 최신 canvas_id 가져오기
    const storeCanvasId = useCanvasStore.getState().canvas_id;
    // props로 전달된 canvas_id가 없으면 스토어의 값 사용
    const effectiveCanvasId = canvas_id || storeCanvasId;

    socketService.disconnect();
    socketService.connect(effectiveCanvasId);

    // 픽셀 업데이트 이벤트 리스너
    socketService.onGamePixelUpdate((pixel) => {
      pixelCallbackRef.current(pixel);
    });

    // 죽은 픽셀 이벤트 리스너
    if (deadPixelsCallbackRef.current) {
      socketService.onDeadPixels((data) => {
        deadPixelsCallbackRef.current?.(data);
      });
    }
    
    // 사망 알림 이벤트 리스너
    if (deadNoticeCallbackRef.current) {
      socketService.onDeadNotice((data) => {
        deadNoticeCallbackRef.current?.(data);
      });
    }

    // 인증 에러 이벤트 리스너
    socketService.onAuthError((error) => {
      toast.error(`인증 오류: ${error.message}`);
    });

    // 픽셀 에러 이벤트 리스너
    socketService.onPixelError((error) => {
      if (error.remaining) {
        toast.warning(
          `픽셀 오류: ${error.message} (남은 시간: ${error.remaining}초)`
        );
      } else {
        toast.error(`픽셀 오류: ${error.message}`);
      }
    });

    // 컴포넌트 언마운트 시 이벤트 리스너 제거 및 소켓 연결 해제
    return () => {
      // 이벤트 리스너 제거
      socketService.offGamePixelUpdate(pixelCallbackRef.current);
      if (deadPixelsCallbackRef.current) {
        socketService.offDeadPixels(deadPixelsCallbackRef.current);
      }
      if (deadNoticeCallbackRef.current) {
        socketService.offDeadNotice(deadNoticeCallbackRef.current);
      }
      socketService.offAuthError(() => {});
      socketService.offPixelError(() => {});

      // 소켓 연결 해제
      socketService.disconnect();
    };
  }, [canvas_id, accessToken, user, useCanvasStore.getState().canvas_id]);

  const sendPixel = (pixel: PixelData) => {
    // 스토어에서 최신 canvas_id 가져오기
    const storeCanvasId = useCanvasStore.getState().canvas_id;
    // props로 전달된 canvas_id가 없으면 스토어의 값 사용
    const effectiveCanvasId = canvas_id || storeCanvasId;

    // 소켓이 연결되어 있는지 확인
    if (!socketService.socket) {
      socketService.connect(effectiveCanvasId);
      return;
    }
    socketService.drawPixel({ ...pixel, canvas_id: effectiveCanvasId });
  };

  const sendGameResult = (data: {
    x: number;
    y: number;
    color: string;
    result: boolean;
  }) => {
    // 스토어에서 최신 canvas_id 가져오기
    const storeCanvasId = useCanvasStore.getState().canvas_id;
    // props로 전달된 canvas_id가 없으면 스토어의 값 사용
    const effectiveCanvasId = canvas_id || storeCanvasId;

    // 소켓이 연결되어 있는지 확인
    if (!socketService.socket) {
      socketService.connect(effectiveCanvasId);
      return;
    }
    // socketService의 sendGameResult 메서드 사용
    socketService.sendGameResult({
      ...data,
      canvas_id: effectiveCanvasId,
    });
  };

  return { sendPixel, sendGameResult };
};
