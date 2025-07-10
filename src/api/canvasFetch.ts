import React from 'react';

interface FetchCanvasDataParams {
  id: string | null;
  setIsLoading: (loading: boolean) => void;
  setHasError: (error: boolean) => void;
  setCanvasId: (id: string) => void;
  setCanvasSize: React.Dispatch<
    React.SetStateAction<{ width: number; height: number }>
  >;
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

    if (!res.ok) {
      if (res.status === 404) {
        console.error('Canvas not found (404). The API returned a 404 error.');
      }
      // 다른 종류의 HTTP 에러도 여기서 잡힙니다.
      throw new Error(`API responded with status: ${res.status}`);
    }

    const json = await res.json();
    // API가 200 OK를 반환했지만, 응답 내용에 에러가 있는 경우 (e.g. { success: false, message: '...' })
    if (!json.success) {
      throw new Error(json.message || 'API request was not successful');
    }

    const {
      canvas_id: fetchedId,
      pixels,
      canvasSize: fetchedCanvasSize,
    } = json.data;

    // console.log('Fetched pixels:', pixels);

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
        pixels.forEach(
          ({ x, y, color }: { x: number; y: number; color: string }) => {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
          }
        );
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
