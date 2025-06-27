import React, { useRef, useEffect, useState } from 'react';

const INITIAL_POSITION = { x: 0, y: 0 };
const MIN_SCALE = 0.1;
const MAX_SCALE = 50;
const SOURCE_WIDTH = 512;
const SOURCE_HEIGHT = 512;

function PixelCanvas() {
  const [color, setColor] = useState<string>('#ffffff');

  // --- Ref 이름을 역할에 맞게 명확히 분리 ---
  const renderCanvasRef = useRef<HTMLCanvasElement>(null); // 아래층: 최종 결과물을 보여주는 캔버스
  const interactionCanvasRef = useRef<HTMLCanvasElement>(null); // 위층: 마우스 이벤트와 미리보기를 담당
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null); // 메모리: 실제 픽셀 데이터 원본

  // --- 상태 Ref ---
  const scaleRef = useRef<number>(1);
  const viewPosRef = useRef<{ x: number; y: number }>(INITIAL_POSITION);
  const startPosRef = useRef<{ x: number; y: number }>(INITIAL_POSITION);
  const isPanningRef = useRef<boolean>(false);
  const isDrawingRef = useRef<boolean>(false);

  // --- 렌더링 함수 ---
  const draw = () => {
    const canvas = renderCanvasRef.current; // 이제 이름이 명확한 renderCanvas를 사용
    const sourceCanvas = sourceCanvasRef.current;
    if (!canvas || !sourceCanvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    ctx.setTransform(
      scaleRef.current,
      0,
      0,
      scaleRef.current,
      viewPosRef.current.x,
      viewPosRef.current.y
    );

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(sourceCanvas, 0, 0);
  };

  const updateOverlay = (screenX: number, screenY: number) => {
    const overlayCanvas = interactionCanvasRef.current;
    if (!overlayCanvas) return;
    const overlayCtx = overlayCanvas.getContext('2d');
    if (!overlayCtx) return;

    overlayCanvas.width = overlayCanvas.clientWidth;
    overlayCanvas.height = overlayCanvas.clientHeight;

    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    const worldPos = calculateMouseLocation(screenX, screenY);

    if (
      worldPos.x >= 0 &&
      worldPos.x < SOURCE_WIDTH &&
      worldPos.y >= 0 &&
      worldPos.y < SOURCE_HEIGHT
    ) {
      overlayCtx.setTransform(
        scaleRef.current,
        0,
        0,
        scaleRef.current,
        viewPosRef.current.x,
        viewPosRef.current.y
      );

      overlayCtx.strokeStyle = 'rgba(0, 255, 0, 0.9)'; // 녹색으로 변경하여 구별
      overlayCtx.lineWidth = 2 / scaleRef.current;
      overlayCtx.strokeRect(worldPos.x, worldPos.y, 1, 1);
    }
  };

  const clearOverlay = () => {
    const overlayCanvas = interactionCanvasRef.current;
    if (!overlayCanvas) return;
    const overlayCtx = overlayCanvas.getContext('2d');
    overlayCtx?.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  };

  const resetAndCenter = () => {
    const canvas = renderCanvasRef.current; // 크기 기준은 어떤 캔버스든 상관 없음
    if (!canvas) return;
    const visibleWidth = canvas.clientWidth;
    const visibleHeight = canvas.clientHeight;
    viewPosRef.current.x = (visibleWidth - SOURCE_WIDTH) / 2;
    viewPosRef.current.y = (visibleHeight - SOURCE_HEIGHT) / 2;
    scaleRef.current = 1;
    draw();
    clearOverlay(); // 리셋 시 오버레이도 클리어
  };

  const calculateMouseLocation = (screenX: number, screenY: number) => {
    const worldX = (screenX - viewPosRef.current.x) / scaleRef.current;
    const worldY = (screenY - viewPosRef.current.y) / scaleRef.current;
    return { x: Math.floor(worldX), y: Math.floor(worldY) };
  };

  const drawPixelAt = (screenX: number, screenY: number) => {
    const worldPos = calculateMouseLocation(screenX, screenY);
    const sourceCtx = sourceCanvasRef.current?.getContext('2d');
    if (sourceCtx) {
      if (
        worldPos.x >= 0 &&
        worldPos.x < SOURCE_WIDTH &&
        worldPos.y >= 0 &&
        worldPos.y < SOURCE_HEIGHT
      ) {
        sourceCtx.fillStyle = color;
        sourceCtx.fillRect(worldPos.x, worldPos.y, 1, 1);
        draw();
      }
    }
  };

  // --- 이벤트 핸들러 ---
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // 오른쪽 버튼(e.button === 2): 시점 이동(패닝) 시작
    if (e.button === 2) {
      isPanningRef.current = true;
      startPosRef.current = {
        x: e.nativeEvent.offsetX - viewPosRef.current.x,
        y: e.nativeEvent.offsetY - viewPosRef.current.y,
      };
      return;
    }

    // ★★★ 수정된 부분: 왼쪽 클릭 시 그리기 및 중앙 정렬 로직 활성화 ★★★
    if (e.button === 0) {
      const canvas = renderCanvasRef.current;
      const sourceCtx = sourceCanvasRef.current?.getContext('2d');
      if (!canvas || !sourceCtx) return;

      // 1. 클릭한 위치의 월드 좌표를 계산
      const worldPos = calculateMouseLocation(
        e.nativeEvent.offsetX,
        e.nativeEvent.offsetY
      );

      // 2. 경계 확인: 아트보드 바깥에서는 동작 안함
      if (
        worldPos.x < 0 ||
        worldPos.x >= SOURCE_WIDTH ||
        worldPos.y < 0 ||
        worldPos.y >= SOURCE_HEIGHT
      ) {
        return;
      }

      // 3. 해당 위치에 픽셀을 그림 (sourceCanvas에만)
      // sourceCtx.fillStyle = color;
      // sourceCtx.fillRect(worldPos.x, worldPos.y, 1, 1);
      console.log(`Pixel 위치: { x: ${worldPos.x}, y: ${worldPos.y} }`);

      // 4. 방금 찍은 픽셀이 화면 중앙에 오도록 viewPos를 새로 계산
      const centerX = canvas.clientWidth / 2;
      const centerY = canvas.clientHeight / 2;
      const scale = scaleRef.current;

      // 픽셀의 중심점(worldPos.x + 0.5)이 화면 중앙에 오도록 설정
      viewPosRef.current.x = centerX - (worldPos.x + 0.5) * scale;
      viewPosRef.current.y = centerY - (worldPos.y + 0.5) * scale;

      // 5. 변경된 내용으로 캔버스를 다시 그림
      // draw();
      // drawPixelAt(centerX, centerY);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const worldPos = calculateMouseLocation(offsetX, offsetY);

    if (isDrawingRef.current) {
      drawPixelAt(offsetX, offsetY);
    }
    if (isPanningRef.current) {
      viewPosRef.current = {
        x: offsetX - startPosRef.current.x,
        y: offsetY - startPosRef.current.y,
      };
      draw();
    }
    updateOverlay(offsetX, offsetY);
  };

  const handleMouseUp = () => {
    isDrawingRef.current = false;
    isPanningRef.current = false;
  };

  const handleMouseLeave = () => {
    handleMouseUp();
    clearOverlay();
  };

  useEffect(() => {
    const viewCanvas = renderCanvasRef.current;
    const interactionCanvas = interactionCanvasRef.current;
    if (!viewCanvas || !interactionCanvas) return;

    const syncCanvasSizes = () => {
      const parent = viewCanvas.parentElement;
      if (!parent) return;
      const width = parent.clientWidth;
      const height = parent.clientHeight;
      viewCanvas.width = width;
      viewCanvas.height = height;
      interactionCanvas.width = width;
      interactionCanvas.height = height;
    };

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = SOURCE_WIDTH;
    sourceCanvas.height = SOURCE_HEIGHT;
    const sourceCtx = sourceCanvas.getContext('2d');
    if (sourceCtx) {
      sourceCtx.fillStyle = '#000000';
      sourceCtx.fillRect(0, 0, sourceCanvas.width, sourceCanvas.height);
    }
    sourceCanvasRef.current = sourceCanvas;

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

    const handleResize = () => {
      syncCanvasSizes();
      resetAndCenter();
    };

    syncCanvasSizes();
    resetAndCenter();

    interactionCanvas.addEventListener('wheel', handleWheel, {
      passive: false,
    });
    window.addEventListener('resize', handleResize);

    return () => {
      interactionCanvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const colors = [
    '#000000',
    '#ffffff',
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffff00',
    '#ff00ff',
    '#00ffff',
    '#ffa500',
    '#800080',
  ];

  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(
    null
  );

  return (
    <div>
      <div
        style={{
          position: 'fixed',
          top: '10px',
          left: '10px',
          zIndex: 9999,
          pointerEvents: 'auto',
        }}
      >
        <input
          type='color'
          value={color}
          onChange={(e) => setColor(e.target.value)}
          style={{
            width: '40px',
            height: '40px',
            padding: '0',
            border: '2px solid white',
            borderRadius: '4px',
          }}
        />
      </div>
      {/* 좌표위치 */}
      <div
        style={{
          position: 'fixed',
          top: '50px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '10px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          borderRadius: '8px',
          pointerEvents: 'none',
        }}
        className='fixed left-1/2 top-16 z-50 -translate-x-1/2 transform rounded bg-black bg-opacity-75 px-3 py-1 text-white'
      >
        {hoverPos
          ? `Cursor at: (${hoverPos.x}, ${hoverPos.y})`
          : 'Cursor outside'}
      </div>
      {/* 팔레트 위치 */}
      <div
        style={{
          position: 'fixed',
          top: '100px',
          right: '20px',
          zIndex: 9999,
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '10px',
          backgroundColor: 'rgba(0,0,0,0.8)',
          borderRadius: '8px',
        }}
      >
        {colors.map((c, index) => (
          <button
            key={index}
            onClick={() => setColor(c)}
            style={{
              width: '40px',
              height: '40px',
              backgroundColor: c,
              border: color === c ? '3px solid white' : '1px solid #666',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>

      <div className='flex w-full flex-col items-center'>
        <div className='relative h-[80vh] w-[90vw] overflow-visible border border-white bg-slate-900'>
          <canvas
            ref={renderCanvasRef}
            style={{
              width: '90vw',
              height: '80vh',
              position: 'absolute',
              top: '0px',
              left: '0px',
            }}
            className='pointer-events-none'
          />
          <canvas
            ref={interactionCanvasRef}
            style={{
              width: '90vw',
              height: '80vh',
              position: 'absolute',
              top: '0px',
              left: '0px',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>
      </div>
    </div>
  );
}

export default PixelCanvas;
