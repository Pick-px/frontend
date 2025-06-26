import React, { useRef, useEffect, useState } from 'react';

const INITIAL_POSITION = { x: 0, y: 0 }; // 시작 위치
const MIN_SCALE = 0.1; // 최소 배율
const MAX_SCALE = 100; // 최대 배율
const SOURCE_WIDTH = 512;
const SOURCE_HEIGHT = 512;

function PixelCanvas() {
  const [color, setColor] = useState<string>('#ffffff'); // 픽샐별 color를 state로 관리?
  /*
    useRef를 사용한 이유 : 상태를 변경할때마다 컴포넌트의 리렌더링 방지.
    마우스 이벤트에서 draw 함수를 호출하여 다시 그리기때문.
   */
  const canvasRef = useRef<HTMLCanvasElement>(null); // 잦은 컴포넌트 리렌더링 방지 위한 useRef
  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null); //

  // 배율 정보, 시점 이동 정보, 좌표 정보 ref로 설정
  const scaleRef = useRef<number>(1); // 현재 확대/축소 배율 저장
  const viewPosRef = useRef<{ x: number; y: number }>(INITIAL_POSITION); // 현재 이미지 위치
  const startPosRef = useRef<{ x: number; y: number }>(INITIAL_POSITION); //마우스 드래그 시작 위치
  const isPanningRef = useRef<boolean>(false);
  const isDrawingRef = useRef<boolean>(false);

  // canvas에 그리는 함수
  const draw = () => {
    const canvas = canvasRef.current; // canvas 요소
    const sourceCanvas = sourceCanvasRef.current;
    if (!canvas || !sourceCanvas) return;
    const ctx = canvas.getContext('2d'); // 2D Context 정의
    if (!ctx) return;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    // canvas의 기본 확대, 경사도, 이동거리 설정 목적
    ctx.setTransform(
      scaleRef.current, // 수평 방향 확대/축소
      0, // 수직방향 경사율
      0, // 수평방향 경사율
      scaleRef.current, // 수직 방향 확대 축소 => 수직과 수평방향 동일하게 설정
      viewPosRef.current.x, // x축 이동거리
      viewPosRef.current.y // y축 이동거리
    );

    // 더 부드러운 픽셀 처리 진행하는 옵션, false로 해야 pixel 모양이 유지
    // true로 진행시 사각형 모양이 깨짐.
    ctx.imageSmoothingEnabled = false;
    // 그림그릴 이미지와 (0,0) => mdn docs 설정 참고
    ctx.drawImage(sourceCanvas, 0, 0);
  };

  // 컴포넌트가 처음 로딩(useEffect)시, 브라우저 창 크기 변경(resize)시 호출
  // 언제나 중앙 위치
  const resetAndCenter = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // 실제로 보이는 캔버스 영역의 높이와 너비 = 현재 브라우저 창크기에 맞게 계산
    const visibleWidth = canvas.clientWidth;
    const visibleHeight = canvas.clientHeight;
    // 어디서 그리기 시작할지를 설정
    // 사용자의 브라우저 중앙에 Canvas를 위치하기 위해 계산
    viewPosRef.current.x = (visibleWidth - SOURCE_WIDTH) / 2;
    viewPosRef.current.y = (visibleHeight - SOURCE_HEIGHT) / 2;
    scaleRef.current = 1; // 1배율로 설정
    draw(); // 화면을 다시 그림
  };

  // 사용자의 클릭한 마우스 위치를 Canvas 내 좌표로 변환
  const calculateMouseLocation = (screenX: number, screenY: number) => {
    // 마우스좌표(screenX) - Offset(viewPosRef.current.x) => 이동 효과 무시한 상대적 마우스 위치
    // 이를 배율로 나누어 확대/축소 효과 되돌려서 Canvas내 좌표 계산
    const worldX = (screenX - viewPosRef.current.x) / scaleRef.current;
    const worldY = (screenY - viewPosRef.current.y) / scaleRef.current;
    // 정수화 하여 정확한 픽셀 좌표로 설정
    // ⭐️ 근데 이러면 두개씩 찍힐 수도 있으려나...
    return { x: Math.floor(worldX), y: Math.floor(worldY) };
  };

  // 마우스 위치 계산하여 실제 픽셀의 색깔을 변경
  const drawPixelAt = (screenX: number, screenY: number) => {
    const worldPos = calculateMouseLocation(screenX, screenY);
    const sourceCtx = sourceCanvasRef.current?.getContext('2d');
    if (sourceCtx && worldPos.x >= 0 && worldPos.y >= 0) {
      sourceCtx.fillStyle = color;
      console.log(`Pixel 위치: { x: ${worldPos.x}, y: ${worldPos.y} }`);
      sourceCtx.fillRect(worldPos.x, worldPos.y, 1, 1);
      draw();
    }
  };

  // 마우스 클릭 이벤트 처리 함수
  const handleMouseClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // 마우스 오른쪽 버튼(e.button === 2): 시점이동
    if (e.button === 2) {
      isPanningRef.current = true;
      startPosRef.current = {
        x: e.nativeEvent.offsetX - viewPosRef.current.x,
        y: e.nativeEvent.offsetY - viewPosRef.current.y,
      };
    }
    // 마우스 왼쪽 버튼(e.button === 1): 그리기 시작
    // if (e.button === 0) {
    //   isDrawingRef.current = true;
    //   drawPixelAt(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    // }

    if (e.button === 0) {
      const canvas = canvasRef.current;
      const sourceCtx = sourceCanvasRef.current?.getContext('2d');
      if (!canvas || !sourceCtx) return;

      // 1. 클릭한 위치의 월드 좌표를 계산
      const worldPos = calculateMouseLocation(
        e.nativeEvent.offsetX,
        e.nativeEvent.offsetY
      );

      if (
        worldPos.x < 0 ||
        worldPos.x >= SOURCE_WIDTH ||
        worldPos.y < 0 ||
        worldPos.y >= SOURCE_HEIGHT
      ) {
        return;
      }

      sourceCtx.fillStyle = color;
      sourceCtx.fillRect(worldPos.x, worldPos.y, 1, 1);
      console.log(`Pixel 위치: { x: ${worldPos.x}, y: ${worldPos.y} }`);

      const centerX = canvas.clientWidth / 2;
      const centerY = canvas.clientHeight / 2;
      const scale = scaleRef.current;

      // 픽셀의 중심점(worldPos.x + 0.5)이 화면 중앙에 오도록 설정
      viewPosRef.current.x = centerX - (worldPos.x + 0.5) * scale;
      viewPosRef.current.y = centerY - (worldPos.y + 0.5) * scale;

      // 4. 변경된 내용으로 캔버스를 다시 그림
      draw();
    }
  };

  // 마우스 드래그 이벤트 처리 함수
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawingRef.current) {
      drawPixelAt(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    }
    if (isPanningRef.current) {
      viewPosRef.current = {
        x: e.nativeEvent.offsetX - startPosRef.current.x,
        y: e.nativeEvent.offsetY - startPosRef.current.y,
      };
      draw();
    }
  };

  // 유저가 Click하고 손 떼었을때 처리 함수
  const handleMouseUp = () => {
    isDrawingRef.current = false;
    isPanningRef.current = false;
  };

  /*
  리액트 컴포넌트가 리렌더링 될때만 Canvas 작업 진행하기 위한 Hook
  Canvas를 초기에 그리는 작업들을 useEffect로 처리
  즉 렌더링 후 딱 한번만 실행
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = SOURCE_WIDTH; // 512 px
    sourceCanvas.height = SOURCE_HEIGHT; // 512 px
    const sourceCtx = sourceCanvas.getContext('2d');
    if (sourceCtx) {
      sourceCtx.fillStyle = '#000000'; // Canvas 색상 검정색으로 칠하기
      // 사각형 형태로 그리기
      sourceCtx.fillRect(0, 0, sourceCanvas.width, sourceCanvas.height);
    }
    sourceCanvasRef.current = sourceCanvas;

    // Scroll 이벤트 처리 함수
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault(); // 브라우저 자체의 Scroll 기본 기능 동작 방지
      const { offsetX, offsetY } = e; // 마우스의 화면 좌표 확보
      const xs = (offsetX - viewPosRef.current.x) / scaleRef.current;
      const ys = (offsetY - viewPosRef.current.y) / scaleRef.current;
      const delta = -e.deltaY; // scroll 이벤트 계산(위로 돌리면 양수)
      const newScale =
        delta > 0 ? scaleRef.current * 1.2 : scaleRef.current / 1.2;
      // 과도한 확대와 축소 방지
      if (newScale >= MIN_SCALE && newScale <= MAX_SCALE) {
        scaleRef.current = newScale;
        viewPosRef.current.x = offsetX - xs * scaleRef.current;
        viewPosRef.current.y = offsetY - ys * scaleRef.current;
        draw();
      }
    };

    resetAndCenter(); // 초기 렌더링시 호출

    canvas.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('resize', resetAndCenter);

    return () => {
      // 컴포넌트가 사라질때 메모리 누수 방지 위한 CleanUp
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', resetAndCenter);
    };
    // 의존성 배열 빈배열로 비워두어 useEffect 훅 한번만 실행
  }, []);

  return (
    <div className='flex flex-col items-center'>
      <div className='mb-4 flex items-center gap-6 text-white'>
        <label htmlFor='color-picker' className='text-sm font-medium'>
          Color:
        </label>
        <input
          id='color-picker'
          type='color'
          className='h-8 w-8 cursor-pointer border-none bg-transparent p-0'
          value={color}
          // Color Palette 색깔 변화 감지
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setColor(e.target.value)
          }
        />
        <span className='text-xs text-slate-400'>
          (Left Click: Draw | Middle Click: Pan | Wheel: Zoom)
        </span>
      </div>
      <canvas
        ref={canvasRef} // 순수 JS 로직으로 DOM 컨트롤
        className='border-red cursor-crosshair border'
        style={{ width: '90vw', height: '90vh' }}
        onMouseDown={handleMouseClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}

export default PixelCanvas;
