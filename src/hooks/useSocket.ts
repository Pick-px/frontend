import { useEffect, useRef } from 'react';
import socketService from '../services/socketService';
import { useAuthStore } from '../store/authStrore';

interface PixelData {
  x: number;
  y: number;
  color: string;
}

interface CooldownData {
  cooldown: string;
  remaining: string;
}

export const useSocket = (
  onPixelReceived: (pixel: PixelData) => void,
  canvas_id: string | undefined,
  onCooldownReceived?: (cooldown: CooldownData) => void
) => {
  const { accessToken, user } = useAuthStore();
  
  useEffect(() => {
    if (!canvas_id) return;
    
    // 토큰이나 user 정보가 변경되면 소켓 재연결
    socketService.disconnect();
    socketService.connect(canvas_id);
    socketService.onPixelUpdate(onPixelReceived);
    
    if (onCooldownReceived) {
      socketService.onCooldownInfo(onCooldownReceived);
    }
  }, [canvas_id, accessToken, user, onPixelReceived, onCooldownReceived]);

  const sendPixel = (pixel: PixelData) => {
    if (!canvas_id) return;
    socketService.drawPixel({ ...pixel, canvas_id });
  };

  return { sendPixel };
};
