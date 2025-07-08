import React from 'react';

interface FetchCanvasDataParams {
  id: string | null;
  setIsLoading: (loading: boolean) => void;
  setHasError: (error: boolean) => void;
  setCanvasId: (id: string) => void;
  setCanvasSize: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>;
  sourceCanvasRef: React.MutableRefObject<HTMLCanvasElement>;
  onLoadingChange?: (loading: boolean) => void;
  setShowCanvas: (show: boolean) => void;
  INITIAL_BACKGROUND_COLOR: string;
}

export const fetchCanvasData = async ({
  id,
  setIsLoading,
  setHasError,
  setCanvasId,
  setCanvasSize,
  sourceCanvasRef,
  onLoadingChange,
  setShowCanvas,
  INITIAL_BACKGROUND_COLOR,
}: FetchCanvasDataParams) => {
  setIsLoading(true);
  setHasError(false);
  const API_URL = import.meta.env.VITE_API_URL || 'https://pick-px.com/api';
  const url = id
    ? `${API_URL}/canvas/pixels?canvas_id=${id}`
    : `${API_URL}/canvas/pixels`;

  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!res.ok) throw new Error('잘못된 응답');
    const json = await res.json();
    if (!json.success) throw new Error('실패 응답');

    const {
      canvas_id: fetchedId,
      pixels,
      canvasSize: fetchedCanvasSize,
    } = json.data;

    setCanvasId(fetchedId);
    setCanvasSize(fetchedCanvasSize);

    const source = document.createElement('canvas');
    source.width = fetchedCanvasSize.width;
    source.height = fetchedCanvasSize.height;
    const ctx = source.getContext('2d');

    if (ctx) {
      ctx.fillStyle = INITIAL_BACKGROUND_COLOR;
      ctx.fillRect(0, 0, fetchedCanvasSize.width, fetchedCanvasSize.height);

      if (Array.isArray(pixels)) {
        pixels.forEach(({ x, y, color }: { x: number; y: number; color: string }) => {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
        });
      }
    }
    sourceCanvasRef.current = source;
  } catch (err) {
    console.error('캔버스 로딩 실패', err);
    setHasError(true);
  } finally {
    setIsLoading(false);
    onLoadingChange?.(false);
    setTimeout(() => setShowCanvas(true), 100);
  }
};