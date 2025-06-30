import { useEffect, useRef } from 'react';
import socketService from '../services/socketService';

interface PixelData {
  x: number;
  y: number;
  color: string;
}

export const useSocket = (
  onPixelReceived: (pixel: PixelData) => void,
  canvas_id: string
) => {
  const isConnected = useRef(false);

  useEffect(() => {
    if (!isConnected.current) {
      socketService.connect(canvas_id);
      socketService.onPixelUpdate(onPixelReceived);
      isConnected.current = true;
    }

    return () => {
      socketService.disconnect();
      isConnected.current = false;
    };
  }, [onPixelReceived, canvas_id]);

  const sendPixel = (pixel: PixelData) => {
    socketService.drawPixel({ ...pixel, canvas_id });
  };

  return { sendPixel };
};
