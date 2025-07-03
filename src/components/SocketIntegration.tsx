import { useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';
import { useChatSocket as useChatSocketHook } from '../hooks/useChatSocket';

interface SocketIntegrationProps {
  sourceCanvasRef: React.RefObject<HTMLCanvasElement>;
  draw: () => void;
  canvas_id: string;
}

interface ChatSocketProps {
  onMessageReceived: (message: {
    id: number;
    user: { id: number; user_name: string };
    message: string;
    created_at: string;
  }) => void;
  group_id: string;
  user_id: string;
}

export const usePixelSocket = ({
  sourceCanvasRef,
  draw,
  canvas_id,
}: SocketIntegrationProps) => {
  const handlePixelReceived = useCallback(
    (pixel: { x: number; y: number; color: string }) => {
      const sourceCtx = sourceCanvasRef.current?.getContext('2d');
      if (sourceCtx) {
        sourceCtx.fillStyle = pixel.color;
        sourceCtx.fillRect(pixel.x, pixel.y, 1, 1);
        draw();
      }
    },
    [sourceCanvasRef, draw]
  );

  const { sendPixel } = useSocket(handlePixelReceived, canvas_id);

  return { sendPixel };
};

export const useChatSocket = ({
  onMessageReceived,
  group_id,
  user_id,
}: ChatSocketProps) => {
  const handleChatError = useCallback((error: any) => {
    console.error('채팅 에러:', error);
  }, []);

  const { sendMessage } = useChatSocketHook(
    onMessageReceived,
    handleChatError,
    group_id,
    user_id
  );

  return { sendMessage };
};
