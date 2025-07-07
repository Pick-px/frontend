import React, { useRef, useEffect, useCallback, useState } from 'react';
import { usePixelSocket } from './SocketIntegration';
import CanvasUI from './CanvasUI';
import Preloader from './Preloader';
import { useCanvasStore } from '../store/canvasStore';

const INITIAL_POSITION = { x: 0, y: 0 };
const MIN_SCALE = 0.1;
const MAX_SCALE = 30;
const INITIAL_BACKGROUND_COLOR = '#000000';
const VIEWPORT_BACKGROUND_COLOR = '#2d3748';

type HoverPos = { x: number; y: number } | null;
type PixelCanvasProps = {
  canvas_id: string;
  onLoadingChange?: (loading: boolean) => void;
};

function PixelCanvas({
  canvas_id: initialCanvasId,
  onLoadingChange,
}: PixelCanvasProps) {
  const { canvas_id, setCanvasId } = useCanvasStore();

  // props로 받은 canvas_id를 store에 설정
  useEffect(() => {
    if (initialCanvasId && initialCanvasId !== canvas_id) {
      setCanvasId(initialCanvasId);
    }
    console.log(`zustadn:${initialCanvasId}`);
  }, [initialCanvasId, canvas_id, setCanvasId]);

  const rootRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const renderCanvasRef = useRef<HTMLCanvasElement>(null);
  const interactionCanvasRef = useRef<HTMLCanvasElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null!);

  const scaleRef = useRef<number>(1);
  const viewPosRef = useRef<{ x: number; y: number }>(INITIAL_POSITION);
  const startPosRef = useRef<{ x: number; y: number }>(INITIAL_POSITION);
  const isPanningRef = useRef<boolean>(false);

  const fixedPosRef = useRef<{ x: number; y: number; color: string } | null>(
    null
  );
  const previewPixelRef = useRef<{
    x: number;
    y: number;
    color: string;
  } | null>(null);

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [cooldown, setCooldown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [color, setColor] = useState('#ffffff');
  const [hoverPos, setHoverPos] = useState<HoverPos>(null);
  const colors = [
    '#ffffff',
    '#c0c0c0',
    '#808080',
    '#000000',
    '#ff0000',
    '#ff8000',
    '#ffff00',
    '#80ff00',
    '#00ff00',
    '#00ff80',
    '#00ffff',
    '#0080ff',
    '#0000ff',
    '#8000ff',
    '#ff00ff',
    '#ff0080',
    '#ffa07a',
    '#f08080',
    '#ffd700',
    '#87cefa',
  ];

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [showCanvas, setShowCanvas] = useState(false);

  const draw = useCallback(() => {
    const src = sourceCanvasRef.current;
    if (!src) return;

    const canvas = renderCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate(viewPosRef.current.x, viewPosRef.current.y);
      ctx.scale(scaleRef.current, scaleRef.current);
      ctx.fillStyle = INITIAL_BACKGROUND_COLOR;
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      // 캔버스 테두리 그라데이션 효과
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvasSize.width,
        canvasSize.height
      );
      gradient.addColorStop(0, 'rgba(34, 197, 94, 0.8)');
      gradient.addColorStop(0.25, 'rgba(59, 130, 246, 0.8)');
      gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.8)');
      gradient.addColorStop(0.75, 'rgba(236, 72, 153, 0.8)');
      gradient.addColorStop(1, 'rgba(34, 197, 94, 0.8)');

      // 외곽 테두리 (두껋게)
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 1;
      ctx.strokeRect(-1, -1, canvasSize.width + 2, canvasSize.height + 2);

      // 내부 테두리 (연하게)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(0, 0, canvasSize.width, canvasSize.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(src, 0, 0);
      ctx.restore();
    }

    const preview = previewCanvasRef.current;
    const pctx = preview?.getContext('2d');
    if (pctx && preview) {
      pctx.save();
      pctx.clearRect(0, 0, preview.width, preview.height);
      pctx.translate(viewPosRef.current.x, viewPosRef.current.y);
      pctx.scale(scaleRef.current, scaleRef.current);
      pctx.imageSmoothingEnabled = false;
      pctx.drawImage(src, 0, 0);

      if (fixedPosRef.current && fixedPosRef.current.color !== 'transparent') {
        const { x, y, color: fx } = fixedPosRef.current;
        pctx.fillStyle = fx;
        pctx.fillRect(x, y, 1, 1);
      }

      if (fixedPosRef.current) {
        const { x, y } = fixedPosRef.current;
        pctx.strokeStyle = 'rgba(255,255,0,0.9)';
        pctx.lineWidth = 3 / scaleRef.current;
        pctx.strokeRect(x, y, 1, 1);
      }
      if (previewPixelRef.current) {
        const { x, y, color: px } = previewPixelRef.current;
        pctx.fillStyle = px;
        pctx.fillRect(x, y, 1, 1);
      }

      pctx.restore();
    }
  }, [canvasSize]);

  const { sendPixel } = usePixelSocket({
    sourceCanvasRef,
    draw,
    canvas_id,
    onCooldownReceived: (cooldownData) => {
      console.log('쿨다운 정보 수신:', cooldownData);
      // console.log('쿨다운 체크:', cooldownData.cooldown === 'true');

      if (cooldownData.cooldown) {
        console.log(`쿨다운 시작: ${cooldownData.remaining}초`);
        startCooldown(cooldownData.remaining);
      } else {
        console.log('쿨다운 없음');
      }
    },
  });

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

      const isInBounds =
        worldX >= 0 &&
        worldX < canvasSize.width &&
        worldY >= 0 &&
        worldY < canvasSize.height;

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
    [setHoverPos, canvasSize]
  );

  const clearOverlay = useCallback(() => {
    setHoverPos(null);
    const overlayCanvas = interactionCanvasRef.current;
    if (!overlayCanvas) return;
    const overlayCtx = overlayCanvas.getContext('2d');
    overlayCtx?.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  }, [setHoverPos]);

  const resetAndCenter = useCallback(() => {
    const canvas = renderCanvasRef.current;
    if (!canvas || canvas.clientWidth === 0 || canvasSize.width === 0) return;

    scaleRef.current = 2;
    viewPosRef.current.x =
      (canvas.clientWidth - canvasSize.width * scaleRef.current) / 2;
    viewPosRef.current.y =
      (canvas.clientHeight - canvasSize.height * scaleRef.current) / 2;

    draw();
    clearOverlay();
  }, [draw, clearOverlay, canvasSize]);

  const centerOnPixel = useCallback(
    (screenX: number, screenY: number) => {
      const canvas = renderCanvasRef.current;
      if (!canvas) return;

      const worldX = Math.floor(
        (screenX - viewPosRef.current.x) / scaleRef.current
      );
      const worldY = Math.floor(
        (screenY - viewPosRef.current.y) / scaleRef.current
      );

      if (
        worldX < 0 ||
        worldX >= canvasSize.width ||
        worldY < 0 ||
        worldY >= canvasSize.height
      ) {
        return;
      }

      const viewportCenterX = canvas.clientWidth / 2;
      const viewportCenterY = canvas.clientHeight / 2;

      const targetX = viewportCenterX - (worldX + 0.5) * scaleRef.current;
      const targetY = viewportCenterY - (worldY + 0.5) * scaleRef.current;

      const startX = viewPosRef.current.x;
      const startY = viewPosRef.current.y;
      const duration = 1000;
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const eased = 1 - Math.pow(1 - progress, 3);

        viewPosRef.current.x = startX + (targetX - startX) * eased;
        viewPosRef.current.y = startY + (targetY - startY) * eased;

        draw();

        if (progress < 1) {
          requestAnimationFrame(animate);
          updateOverlay(screenX, screenY);
        } else {
          updateOverlay(screenX, screenY);
        }
      };
      requestAnimationFrame(animate);
    },
    [draw, updateOverlay, canvasSize]
  );

  const startCooldown = useCallback((seconds: number) => {
    setCooldown(true);
    setTimeLeft(seconds);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCooldown(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const handleCooltime = useCallback(() => {
    startCooldown(20);
  }, [startCooldown]);

  const handleConfirm = useCallback(() => {
    const pos = fixedPosRef.current;
    if (!pos) return;

    handleCooltime();
    previewPixelRef.current = { x: pos.x, y: pos.y, color };
    draw();
    sendPixel({ x: pos.x, y: pos.y, color });
    setTimeout(() => {
      previewPixelRef.current = null;
      pos.color = 'transparent';
      draw();
    }, 4000);
  }, [color, draw, sendPixel, handleCooltime]);

  const handleSelectColor = useCallback(
    (newColor: string) => {
      if (!fixedPosRef.current) return;
      fixedPosRef.current.color = newColor;
      draw();
    },
    [draw]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (e.button === 2) {
        // 기본 브라우저 동작 방지 코드 추가
        e.preventDefault();
        isPanningRef.current = true;
        startPosRef.current = {
          x: e.nativeEvent.offsetX - viewPosRef.current.x,
          y: e.nativeEvent.offsetY - viewPosRef.current.y,
        };
        return;
      }
      if (e.button === 0) {
        const sx = e.nativeEvent.offsetX;
        const sy = e.nativeEvent.offsetY;
        const wx = Math.floor((sx - viewPosRef.current.x) / scaleRef.current);
        const wy = Math.floor((sy - viewPosRef.current.y) / scaleRef.current);
        if (
          wx >= 0 &&
          wx < canvasSize.width &&
          wy >= 0 &&
          wy < canvasSize.height
        ) {
          fixedPosRef.current = { x: wx, y: wy, color: 'transparent' };
          setShowPalette(true);
          centerOnPixel(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        }
      }
    },
    [centerOnPixel, canvasSize]
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
      updateOverlay(offsetX, offsetY);
    },
    [draw, updateOverlay]
  );

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
  }, []);

  const handleMouseLeave = useCallback(() => {
    handleMouseUp();
    clearOverlay();
  }, [handleMouseUp, clearOverlay]);

  const fetchCanvasData = useCallback(async (id: string | null) => {
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

      console.log(`fetchedID : ${fetchedId}`);
      console.log(`pixels : ${pixels.length}`);

      setCanvasId(fetchedId);
      setCanvasSize(fetchedCanvasSize);

      const source = document.createElement('canvas');
      source.width = fetchedCanvasSize.width;
      source.height = fetchedCanvasSize.height;
      const ctx = source.getContext('2d');

      if (ctx) {
        ctx.fillStyle = INITIAL_BACKGROUND_COLOR;
        ctx.fillRect(0, 0, fetchedCanvasSize.width, fetchedCanvasSize.height);

        if (!Array.isArray(pixels)) throw new Error('픽셀 데이터 형식 오류');
        pixels.forEach(({ x, y, color }) => {
          ctx.fillStyle = color;
          ctx.fillRect(x, y, 1, 1);
        });
      }
      sourceCanvasRef.current = source;
    } catch (err) {
      console.error('캔버스 로딩 실패', err);
      setHasError(true);
    } finally {
      setIsLoading(false);
      onLoadingChange?.(false);
      // 짧은 딩레이 후 캔버스 애니메이션 시작
      setTimeout(() => setShowCanvas(true), 100);
    }
  }, []);

  useEffect(() => {
    // 최초 마운트 시 props로 받은 id로만 fetch
    fetchCanvasData(initialCanvasId);
  }, [initialCanvasId, fetchCanvasData]);

  useEffect(() => {
    const rootElement = rootRef.current;
    if (!rootElement) return;

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width === 0 || height === 0) return;

      [
        renderCanvasRef.current,
        previewCanvasRef.current,
        interactionCanvasRef.current,
      ].forEach((canvas) => {
        if (canvas) {
          const dpr = window.devicePixelRatio || 1;
          canvas.width = Math.round(width * dpr);
          canvas.height = Math.round(height * dpr);
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;

          const ctx = canvas.getContext('2d');
          ctx?.scale(dpr, dpr);
        }
      });

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
    <div
      ref={rootRef}
      className='relative h-full w-full transition-all duration-300'
      style={{
        backgroundImage: `url('/Creatives.png')`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundColor: VIEWPORT_BACKGROUND_COLOR,
        boxShadow: cooldown
          ? 'inset 0 0 50px rgba(239, 68, 68, 0.3), 0 0 100px rgba(239, 68, 68, 0.2)'
          : 'none',
      }}
    >
      {/* 쿨다운 중 빨간 경계선 효과 */}
      {cooldown && (
        <>
          <div className='pointer-events-none absolute inset-0 border-4 border-red-500/30' />
          <div className='pointer-events-none absolute inset-2 border-2 border-red-400/20' />
          <div className='pointer-events-none absolute inset-4 border border-red-300/10' />
        </>
      )}
      <div
        className={`transition-all duration-1000 ease-out ${
          showCanvas
            ? 'scale-100 transform opacity-100'
            : 'scale-50 transform opacity-0'
        }`}
      >
        <canvas
          ref={renderCanvasRef}
          className='pointer-events-none absolute top-0 left-0'
        />
        <canvas
          ref={previewCanvasRef}
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

      {/* 로딩 중이면 모든 UI 숨기고 프리로더만 표시 */}
      {isLoading ? (
        <Preloader />
      ) : (
        <CanvasUI
          color={color}
          setColor={setColor}
          hoverPos={hoverPos}
          colors={colors}
          onConfirm={handleConfirm}
          onSelectColor={handleSelectColor}
          cooldown={cooldown}
          timeLeft={timeLeft}
          showPalette={showPalette}
          setShowPalette={setShowPalette}
        />
      )}
    </div>
  );
}

export default PixelCanvas;
