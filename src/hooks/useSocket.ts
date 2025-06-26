import { useEffect, useRef } from 'react';
import socketService from '../services/socketService';

interface PixelData {
  x: number;
  y: number;
  color: string;
}

export const useSocket = (
  onPixelReceived: (pixel: PixelData) => void,
  onCanvasReceived: (canvasData: string) => void
) => {
  const isConnected = useRef(false);

  useEffect(() => {
    if (!isConnected.current) {
      socketService.connect();
      socketService.onPixelUpdate(onPixelReceived);
      socketService.onCanvasData(onCanvasReceived);
      socketService.requestCanvasData();
      isConnected.current = true;
    }

    return () => {
      socketService.disconnect();
      isConnected.current = false;
    };
  }, [onPixelReceived, onCanvasReceived]);

  const sendPixel = (pixel: PixelData) => {
    socketService.drawPixel(pixel);
  };

  return { sendPixel };
};