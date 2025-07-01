import { useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';

interface SocketIntegrationProps {
  sourceCanvasRef: React.RefObject<HTMLCanvasElement>;
  draw: () => void;
  canvas_id: string; //[*]
}

export const usePixelSocket = ({
  sourceCanvasRef,
  draw,
  canvas_id,
}: SocketIntegrationProps) => {
  //[*]
  // 다른 사용자 픽셀 수신
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

  const { sendPixel } = useSocket(handlePixelReceived, canvas_id); //[*]

  return { sendPixel };
};
