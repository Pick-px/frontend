import { useEffect, useRef } from 'react';
import socketService from '../services/socketService';
import { useAuthStore } from '../store/authStrore';

interface PixelData {
  x: number;
  y: number;
  color: string;
}

interface CooldownData {
  cooldown: boolean;
  remaining: number;
}

export const useSocket = (
  onPixelReceived: (pixel: PixelData) => void,
  canvas_id: string | undefined,
  onCooldownReceived?: (cooldown: CooldownData) => void
) => {
  const { accessToken, user } = useAuthStore();
  const pixelCallbackRef = useRef(onPixelReceived);
  const cooldownCallbackRef = useRef(onCooldownReceived);

  // 콜백 함수 업데이트
  pixelCallbackRef.current = onPixelReceived;
  cooldownCallbackRef.current = onCooldownReceived;

  useEffect(() => {
    if (!canvas_id) return;

    console.log('소켓 연결 시도:', canvas_id);

    // 토큰이나 user 정보가 변경되면 소켓 재연결
    socketService.disconnect();
    socketService.connect(canvas_id);
    socketService.onPixelUpdate((pixel) => {
      pixelCallbackRef.current(pixel);
    });

    if (cooldownCallbackRef.current) {
      socketService.onCooldownInfo((cooldown) => {
        cooldownCallbackRef.current?.(cooldown);
      });
    } else {
      console.log('쿨다운 콜백 없음');
    }
  }, [canvas_id, accessToken, user]);

  const sendPixel = (pixel: PixelData) => {
    if (!canvas_id) return;
    socketService.drawPixel({ ...pixel, canvas_id });
  };

  return { sendPixel };
};
