import { useEffect, useRef } from 'react';
import socketService from '../services/socketService';

interface PixelData {
  x: number;
  y: number;
  color: string;
}

export const useSocket = (
  onPixelReceived: (pixel: PixelData) => void,
  canvas_id: string | undefined
) => {
  useEffect(() => {
    if (!canvas_id) return;
    socketService.connect(canvas_id);
    socketService.onPixelUpdate(onPixelReceived);
  }, [canvas_id]);

  const sendPixel = (pixel: PixelData) => {
    if (!canvas_id) return;
    socketService.drawPixel({ ...pixel, canvas_id });
  };

  return { sendPixel };
};
