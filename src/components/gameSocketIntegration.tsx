import { useCallback, useEffect, useRef } from 'react';
import { useGameSocket } from '../hooks/useGameSocket';

interface GameSocketProps {
  sourceCanvasRef: React.RefObject<HTMLCanvasElement>;
  draw: () => void;
  canvas_id: string;
  onDeadPixels?: (data: {
    pixels: Array<{ x: number; y: number; color: string }>;
    username: string;
  }) => void;
  onDeadNotice?: (data: { message: string }) => void;
}

export const useGameSocketIntegration = ({
  sourceCanvasRef,
  draw,
  canvas_id,
  onDeadPixels,
  onDeadNotice,
}: GameSocketProps) => {
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

  const { sendPixel, sendGameResult } = useGameSocket(
    handlePixelReceived,
    canvas_id,
    onDeadPixels,
    onDeadNotice
  );

  return { sendPixel, sendGameResult };
};
