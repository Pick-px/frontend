//
import React, { useRef, useEffect, useCallback } from 'react';

// --- 상수 정의 ---
const INITIAL_POSITION = { x: 0, y: 0 };
const MIN_SCALE = 0.1;
const MAX_SCALE = 30;
const SOURCE_WIDTH = 512;
const SOURCE_HEIGHT = 512;
const INITIAL_BACKGROUND_COLOR = '#000000'; // 아트보드 배경색
const VIEWPORT_BACKGROUND_COLOR = '#2d3748'; // 캔버스 바깥 공간 색

// --- 타입 정의 ---
// props를 외부에서 받아 컴포넌트 간 결합도 낮추기
type HoverPos = { x: number; y: number } | null;
type PixelCanvasProps = {
  color: string;
  setHoverPos: React.Dispatch<React.SetStateAction<HoverPos>>;
};

function PixelCanvas({ color, setHoverPos }: PixelCanvasProps) {
  // --- Ref 정의 ---
  const rootRef = useRef<HTMLDivElement>(null);
  const renderCanvasRef = useRef<HTMLCanvasElement>(null); // 색상 칠하는 아래층 Canvas
  const interactionCanvasRef = useRef<HTMLCanvasElement>(null); // 마우스 이벤트 받는 위층 Canvas
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const scaleRef = useRef<number>(1);
  const viewPosRef = useRef<{ x: number; y: number }>(INITIAL_POSITION);
  const startPosRef = useRef<{ x: number; y: number }>(INITIAL_POSITION);
  const isPanningRef = useRef<boolean>(false);
  const isDrawingRef = useRef<boolean>(false);

  // --- 렌더링 함수 --- => useCallback 사용으로 매번 새로운 인스턴스 생성 방지
  // 최종 화면 렌더링, clearRect로 캔버스 비우고 drawImage로 다시 그림
  const draw = useCallback(() => {
    const canvas = renderCanvasRef.current;
    const sourceCanvas = sourceCanvasRef.current;
    if (!canvas || !sourceCanvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();

    // 캔버스 전체를 바깥 공간 색으로 칠합니다.
    ctx.fillStyle = VIEWPORT_BACKGROUND_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 변환 적용 (Pan, Zoom)
    ctx.translate(viewPosRef.current.x, viewPosRef.current.y);
    ctx.scale(scaleRef.current, scaleRef.current);

    // 512x512 아트보드의 배경색을 칠합니다.
    ctx.fillStyle = INITIAL_BACKGROUND_COLOR;
    ctx.fillRect(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);

    // 아트보드 위에 픽셀 데이터를 그립니다.
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sourceCanvas, 0, 0);

    ctx.restore();
  }, []);

  // cursor pointer 위치 updatae
  const updateOverlay = useCallback(
    (screenX: number, screenY: number) => {
      const worldX = Math.floor(
        (screenX - viewPosRef.current.x) / scaleRef.current
      );
      const worldY = Math.floor(
        (screenY - viewPosRef.current.y) / scaleRef.current
      );

      const overlayCanvas = interactionCanvasRef.current;
      if (!overlayCanvas) return;
      const overlayCtx = overlayCanvas.getContext('2d');
      if (!overlayCtx) return;

      overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

      // 좌표가 pixel Canvas 안에 있는지 확인하는 flag
      const isInBounds =
        worldX >= 0 &&
        worldX < SOURCE_WIDTH &&
        worldY >= 0 &&
        worldY < SOURCE_HEIGHT;

      if (isInBounds) {
        setHoverPos({ x: worldX, y: worldY });

        overlayCtx.save();
        overlayCtx.translate(viewPosRef.current.x, viewPosRef.current.y);
        overlayCtx.scale(scaleRef.current, scaleRef.current);
        overlayCtx.strokeStyle = 'rgba(0, 255, 0, 0.9)';
        overlayCtx.lineWidth = 2 / scaleRef.current;
        overlayCtx.strokeRect(worldX, worldY, 1, 1);
        overlayCtx.restore();
      } else {
        setHoverPos(null);
      }
    },
    [setHoverPos]
  );

  // cursor pointer 지우는 함수
  const clearOverlay = useCallback(() => {
    setHoverPos(null);
    const overlayCanvas = interactionCanvasRef.current;
    if (!overlayCanvas) return;
    const overlayCtx = overlayCanvas.getContext('2d');
    overlayCtx?.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  }, [setHoverPos]);

  // resize시 Canvas 가운데로 위치하는 함수
  const resetAndCenter = useCallback(() => {
    const canvas = renderCanvasRef.current;
    if (!canvas || canvas.clientWidth === 0) return;

    scaleRef.current = 1;
    viewPosRef.current.x = (canvas.clientWidth - SOURCE_WIDTH) / 2;
    viewPosRef.current.y = (canvas.clientHeight - SOURCE_HEIGHT) / 2;

    draw();
    clearOverlay();
  }, [draw, clearOverlay]);

  // fillRect로 1*1 픽셀 찍기
  // 마우스 좌표를 인자로 받음
  // 사용자가 그릴때 호춣 => 원본 데이터 변경
  const drawPixelAt = useCallback(
    (screenX: number, screenY: number) => {
      const sourceCtx = sourceCanvasRef.current?.getContext('2d');
      if (!sourceCtx) return;

      const worldX = Math.floor(
        (screenX - viewPosRef.current.x) / scaleRef.current
      );
      const worldY = Math.floor(
        (screenY - viewPosRef.current.y) / scaleRef.current
      );

      if (
        worldX >= 0 &&
        worldX < SOURCE_WIDTH &&
        worldY >= 0 &&
        worldY < SOURCE_HEIGHT
      ) {
        sourceCtx.fillStyle = color;
        sourceCtx.fillRect(worldX, worldY, 1, 1);
        draw(); // 변경 내용 그리기 요청
      }
    },
    [color, draw]
  );

  // ====== 마우스 이벤트 관련 함수 ========
  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (e.button === 2) {
        isPanningRef.current = true;
        startPosRef.current = {
          x: e.nativeEvent.offsetX - viewPosRef.current.x,
          y: e.nativeEvent.offsetY - viewPosRef.current.y,
        };
        return;
      }
      if (e.button === 0) {
        isDrawingRef.current = true;
        drawPixelAt(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
      }
    },
    [drawPixelAt]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { offsetX, offsetY } = e.nativeEvent;

      if (isPanningRef.current) {
        viewPosRef.current = {
          x: offsetX - startPosRef.current.x,
          y: offsetY - startPosRef.current.y,
        };
        draw();
      }
      if (isDrawingRef.current) {
        drawPixelAt(offsetX, offsetY);
      }
      updateOverlay(offsetX, offsetY);
    },
    [draw, drawPixelAt, updateOverlay]
  );

  const handleMouseUp = useCallback(() => {
    isDrawingRef.current = false;
    isPanningRef.current = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    handleMouseUp();
    clearOverlay();
  }, [handleMouseUp, clearOverlay]);

  // ===== useEffect =======

  useEffect(() => {
    const source = document.createElement('canvas');
    source.width = SOURCE_WIDTH;
    source.height = SOURCE_HEIGHT;
    const sourceCtx = source.getContext('2d');
    if (sourceCtx) {
      sourceCtx.fillStyle = INITIAL_BACKGROUND_COLOR;
      sourceCtx.fillRect(0, 0, SOURCE_WIDTH, SOURCE_HEIGHT);
    }
    sourceCanvasRef.current = source;

    const rootElement = rootRef.current;
    if (!rootElement) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width === 0 || height === 0) return;

      [renderCanvasRef.current, interactionCanvasRef.current].forEach(
        (canvas) => {
          if (canvas) {
            const dpr = window.devicePixelRatio || 1;
            // 실제 픽셀 개수인 버퍼 사이즈 설정
            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            // CSS를 통한 표시 사이즈 설정
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            const ctx = canvas.getContext('2d');
            ctx?.scale(dpr, dpr);
          }
        }
      );

      resetAndCenter();
    });

    observer.observe(rootElement);
    return () => observer.disconnect();
  }, [resetAndCenter]);

  useEffect(() => {
    const interactionCanvas = interactionCanvasRef.current;
    if (!interactionCanvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { offsetX, offsetY } = e;
      const xs = (offsetX - viewPosRef.current.x) / scaleRef.current;
      const ys = (offsetY - viewPosRef.current.y) / scaleRef.current;
      const delta = -e.deltaY;
      const newScale =
        delta > 0 ? scaleRef.current * 1.2 : scaleRef.current / 1.2;

      if (newScale >= MIN_SCALE && newScale <= MAX_SCALE) {
        scaleRef.current = newScale;
        viewPosRef.current.x = offsetX - xs * scaleRef.current;
        viewPosRef.current.y = offsetY - ys * scaleRef.current;
        draw();
        updateOverlay(offsetX, offsetY);
      }
    };

    interactionCanvas.addEventListener('wheel', handleWheel, {
      passive: false,
    });
    return () => interactionCanvas.removeEventListener('wheel', handleWheel);
  }, [draw, updateOverlay]);

  return (
    <div ref={rootRef} className='relative h-full w-full'>
      <canvas
        ref={renderCanvasRef}
        className='pointer-events-none absolute top-0 left-0'
      />
      <canvas
        ref={interactionCanvasRef}
        className='absolute top-0 left-0'
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}

export default PixelCanvas;
