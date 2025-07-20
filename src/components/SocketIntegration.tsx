import { useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useChatSocket as useChatSocketHook } from '../hooks/useChatSocket';

interface SocketIntegrationProps {
  sourceCanvasRef: React.RefObject<HTMLCanvasElement>;
  draw: () => void;
  canvas_id: string;
  onPixelReceived?: (data: {
    pixels: Array<{ x: number; y: number; color: string }>;
  }) => void;
  onCooldownReceived?: (cooldown: {
    cooldown: boolean;
    remaining: number;
  }) => void;
}

interface ChatSocketProps {
  onMessageReceived: (message: {
    id: number;
    user: { id: number; user_name: string };
    message: string;
    created_at: string;
  }) => void;
  onImageReceived?: (imageData: any) => void;
  group_id: string;
  user_id: string;
}

export const usePixelSocket = ({
  sourceCanvasRef,
  draw,
  canvas_id,
  onPixelReceived,
  onCooldownReceived,
}: SocketIntegrationProps) => {
  const handlePixelReceived = useCallback(
    (data: any) => {
      // 외부에서 제공된 onPixelReceived 콜백이 있으면 사용
      if (onPixelReceived) {
        onPixelReceived(data);
        return;
      }

      // 기본 동작: 소스 캔버스에 직접 그리기
      const { pixels } = data;
      const sourceCtx = sourceCanvasRef.current?.getContext('2d');
      if (sourceCtx) {
        // 각 픽셀에 대해 그리기
        pixels.forEach((pixel: { x: number; y: number; color: string }) => {
          // 소스 캔버스에 픽셀 그리기
          sourceCtx.fillStyle = pixel.color;
          sourceCtx.fillRect(pixel.x, pixel.y, 1, 1);
        });

        // 캔버스 다시 그리기
        draw();
      }
    },
    [sourceCanvasRef, draw, onPixelReceived]
  );

  const { sendPixel } = useSocket(
    canvas_id,
    handlePixelReceived,
    onCooldownReceived
  );

  return { sendPixel };
};

export const useChatSocket = ({
  onMessageReceived,
  onImageReceived,
  group_id,
  user_id,
}: ChatSocketProps) => {
  const handleChatError = useCallback((error: any) => {
    console.error('채팅 에러:', error);
  }, []);

  const { sendMessage, sendImageMessage, leaveChat } = useChatSocketHook(
    onMessageReceived,
    handleChatError,
    group_id,
    user_id,
    onImageReceived
  );

  return { sendMessage, sendImageMessage, leaveChat };
};
