//
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { usePixelSocket } from './SocketIntegration';
import CanvasUI from './CanvasUI';

// --- 상수 정의 ---
const INITIAL_POSITION = { x: 0, y: 0 };
const MIN_SCALE = 0.1;
const MAX_SCALE = 30;
//캔버스 크기 동적으로 관리
// const SOURCE_WIDTH = 512;
// const SOURCE_HEIGHT = 512;

const INITIAL_BACKGROUND_COLOR = '#000000'; // 아트보드 배경색
const VIEWPORT_BACKGROUND_COLOR = '#2d3748'; // 캔버스 바깥 공간 색

// --- 타입 정의 ---
// props를 외부에서 받아 컴포넌트 간 결합도 낮추기
type HoverPos = { x: number; y: number } | null;
type PixelCanvasProps = {
  canvas_id: string;
};

function PixelCanvas({ canvas_id: initialCanvasId }: PixelCanvasProps) {
  const [canvas_id, setCanvasId] = useState(initialCanvasId);
  // --- Ref 정의 ---
  const rootRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null); // 반투명 오버레이용 캔버스
  const renderCanvasRef = useRef<HTMLCanvasElement>(null); // 색상 칠하는 아래층 Canvas
  const interactionCanvasRef = useRef<HTMLCanvasElement>(null); // 이벤트 레이어
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null!); // 비가시 캔버스 (실제 데이터 저장소)

  const scaleRef = useRef<number>(1);
  const viewPosRef = useRef<{ x: number; y: number }>(INITIAL_POSITION);
  const startPosRef = useRef<{ x: number; y: number }>(INITIAL_POSITION);
  const isPanningRef = useRef<boolean>(false);

  // --- 고정 픽셀 정의 ---
  //테두리 고정 픽셀
  const fixedPosRef = useRef<{ x: number; y: number; color: string } | null>(
    null
  );
  //색칠 픽셀
  const previewPixelRef = useRef<{
    x: number;
    y: number;
    color: string;
  } | null>(null);

  // 쿨다운 관련 상태
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [cooldown, setCooldown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [color, setColor] = useState('#ffffff');
  const [hoverPos, setHoverPos] = useState<HoverPos>(null);
  const colors = ['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff'];
  // --- pixel 로딩 관련 상태
  const [isLoading, setIsLoading] = useState(true);

  const [hasError, setHasError] = useState(false);

  // //--- 캔버스 로딩 에러
  // if (isLoading)
  //   return (
  //     <div className='mt-10 text-center text-xl text-white'>
  //       로딩 중입니다...
  //     </div>
  //   );

  // if (hasError)
  //   return (
  //     <div className='mt-10 text-center text-xl text-red-500'>
  //       캔버스를 불러오는 데 실패했습니다.
  //     </div>
  //   );

  // --- 렌더링 함수 ---
  const draw = useCallback(() => {
    const src = sourceCanvasRef.current;
    if (!src) return;

    // renderCanvas 그리기
    const canvas = renderCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 배경 + pan/zoom + 픽셀 데이터
      // ctx.fillStyle = VIEWPORT_BACKGROUND_COLOR;
      // ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.translate(viewPosRef.current.x, viewPosRef.current.y);
      ctx.scale(scaleRef.current, scaleRef.current);
      ctx.fillStyle = INITIAL_BACKGROUND_COLOR;
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      ctx.strokeStyle = 'rgba(0,192,0,0.9)';
      ctx.lineWidth = 0.1;
      ctx.strokeRect(0, 0, canvasSize.width, canvasSize.width);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(src, 0, 0);
      ctx.restore();
    }

    // previewCanvas 그리기 (투명 유지)
    const preview = previewCanvasRef.current;
    const pctx = preview?.getContext('2d');
    if (pctx && preview) {
      pctx.save();
      // 투명 배경 유지하므로 clearRect 후 바로 draw
      pctx.clearRect(0, 0, preview.width, preview.height);
      pctx.translate(viewPosRef.current.x, viewPosRef.current.y);
      pctx.scale(scaleRef.current, scaleRef.current);
      pctx.imageSmoothingEnabled = false;
      pctx.drawImage(src, 0, 0);

      // fixedPosRef에 색이 있으면(투명 - 'transparent') 채우기
      if (fixedPosRef.current && fixedPosRef.current.color !== 'transparent') {
        const { x, y, color: fx } = fixedPosRef.current;
        pctx.fillStyle = fx;
        pctx.fillRect(x, y, 1, 1);
      }

      // 고정 픽셀 테두리(노란)
      if (fixedPosRef.current) {
        const { x, y } = fixedPosRef.current;
        pctx.strokeStyle = 'rgba(255,255,0,0.9)';
        pctx.lineWidth = 3 / scaleRef.current;
        pctx.strokeRect(x, y, 1, 1);
      }
      //확정된 것
      if (previewPixelRef.current) {
        const { x, y, color: px } = previewPixelRef.current;
        pctx.fillStyle = px;
        pctx.fillRect(x, y, 1, 1);
      }

      pctx.restore();
    }
  }, [canvasSize]);

  // 소켓 연결 및 픽셀 전송
  const { sendPixel } = usePixelSocket({ sourceCanvasRef, draw, canvas_id });

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
        } else {
          updateOverlay(screenX, screenY);
        }
      };

      requestAnimationFrame(animate);
    },
    [draw, updateOverlay, canvasSize]
  );

  //===== 쿨타임 핸들러 : 시작함수
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

  //===== 쿨타임 핸들러 : 메인
  const handleCooltime = useCallback(() => {
    // 20초 쿨타임 시작
    startCooldown(20);
  }, [startCooldown]);

  //===== 확정 버튼 클릭 핸들러
  const handleConfirm = useCallback(() => {
    const pos = fixedPosRef.current;
    if (!pos) return;

    // 쿨타임 함수 호출
    handleCooltime();
    //previewPixelRef에 임시 픽셀 정보 저장
    previewPixelRef.current = { x: pos.x, y: pos.y, color };
    // 즉시 그리기
    draw();
    //서버로 픽셀 전송
    sendPixel({ x: pos.x, y: pos.y, color });
    // 4초 뒤에 previewPixelRef 비우고 다시 그리기
    setTimeout(() => {
      previewPixelRef.current = null;
      pos.color = 'transparent';
      draw();
    }, 4000);
  }, [color, draw, sendPixel, handleCooltime]);

  // 팔레트 변경 시 미리보기 픽셀 업데이트 - fixed pixel 색만 바꿔주고 draw()
  const handleSelectColor = useCallback(
    (newColor: string) => {
      if (!fixedPosRef.current) return;
      fixedPosRef.current.color = newColor;
      draw();
    },
    [draw]
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
        const sx = e.nativeEvent.offsetX;
        const sy = e.nativeEvent.offsetY;
        const wx = Math.floor((sx - viewPosRef.current.x) / scaleRef.current);
        const wy = Math.floor((sy - viewPosRef.current.y) / scaleRef.current);
        // 고정 픽셀 세팅 - fixedPosRef에 저장함. - 투명으로
        if (
          wx >= 0 &&
          wx < canvasSize.width &&
          wy >= 0 &&
          wy < canvasSize.height
        ) {
          fixedPosRef.current = { x: wx, y: wy, color: 'transparent' };
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

  // ===== useEffect =======
  // --- canvas 전체 픽셀 데이터 요청

  const API_URL = import.meta.env.VITE_API_URL || 'https://pick-px.com/api';
  useEffect(() => {
    const url = canvas_id
      ? `${API_URL}/canvas/pixels?canvas_id=${canvas_id}`
      : `${API_URL}/canvas/pixels`;

    // API 요청 후, 자동 압축해제 및 sourceCanvas 재구성
    fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('잘못된 응답');
        return res.json();
      })

      .then((json) => {
        if (json.success) {
          if (!json.success) throw new Error('실패 응답');
          const { canvas_id: fetchedId, pixels, canvasSize } = json.data;
          // 받아온 데이터로 대체
          setCanvasId(fetchedId);
          setCanvasSize(canvasSize);

          const source = document.createElement('canvas');
          source.width = canvasSize.width;
          source.height = canvasSize.height;

          const ctx = source.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

            if (!Array.isArray(pixels))
              throw new Error('픽셀 데이터 형식 오류');
            pixels.forEach(({ x, y, color }) => {
              ctx.fillStyle = color;
              ctx.fillRect(x, y, 1, 1);
            });
          }
          sourceCanvasRef.current = source;
          draw();
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('캔버스 로딩 실패', err);
        setHasError(true);
        setIsLoading(false);
      });
  }, [canvas_id]);

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
          // 실제 픽셀 개수인 버퍼 사이즈 설정
          canvas.width = Math.round(width * dpr);
          canvas.height = Math.round(height * dpr);
          // CSS를 통한 표시 사이즈 설정
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
  }, []);

  return (
    <div
      ref={rootRef}
      className='relative h-full w-full'
      style={{
        backgroundImage: `url('/Creatives.png')`, // 이 배경 이미지가 이제 보일 것입니다.
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundColor: '#2d3748', // 캔버스 바깥 공간의 색상도 div에서 담당하도록 추가
      }}
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

      <CanvasUI
        color={color}
        setColor={setColor}
        hoverPos={hoverPos}
        colors={colors}
        onConfirm={handleConfirm}
        onSelectColor={handleSelectColor}
        cooldown={cooldown}
        timeLeft={timeLeft}
      />
    </div>
  );
}

export default PixelCanvas;
