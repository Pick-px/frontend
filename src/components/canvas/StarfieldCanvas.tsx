import React, { useRef, useEffect } from 'react';
import './StarfieldCanvas.css';
import { createStarImage } from '../../utils/starfieldUtils';

type StarfieldCanvasProps = {
  viewPosRef: React.RefObject<{ x: number; y: number }>;
};

const StarfieldCanvas = ({ viewPosRef }: StarfieldCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number>(0);
  const workerRef = useRef<Worker | null>(null);
  const starImageRef = useRef<HTMLCanvasElement | null>(null);
  const lastViewPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const starPositionsRef = useRef<
    Array<{
      x: number;
      y: number;
      radius: number;
      alpha: number;
    }>
  >([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- 초기 설정 ---
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 별 이미지 생성
    starImageRef.current = createStarImage();

    // Web Worker 생성
    workerRef.current = new Worker(
      new URL('../../workers/starfield.worker.ts', import.meta.url),
      {
        type: 'module',
      }
    );

    // Worker 메시지 처리
    workerRef.current.onmessage = (e) => {
      const { type, starCount, positions } = e.data;

      switch (type) {
        case 'worker_ready':
          console.log('Starfield Worker 준비됨');
          // Worker 초기화
          workerRef.current?.postMessage({
            type: 'init',
            canvasWidth: canvas.width,
            canvasHeight: canvas.height,
            maxStars: 400,
          });
          break;

        case 'initialized':
          console.log(`Starfield Worker 초기화 완료: ${starCount}개 별 생성`);
          break;

        case 'positions':
          starPositionsRef.current = positions;
          break;

        case 'resized':
          console.log(
            `Starfield Worker 리사이즈 완료: ${starCount}개 별 재생성`
          );
          break;
      }
    };

    // --- 최적화된 애니메이션 루프 ---
    const animate = () => {
      const currentViewPos = viewPosRef.current ?? { x: 0, y: 0 };

      // 뷰 위치가 변경되었는지 확인
      const viewPosChanged =
        currentViewPos.x !== lastViewPosRef.current.x ||
        currentViewPos.y !== lastViewPosRef.current.y;

      if (viewPosChanged) {
        // Worker에 업데이트 요청
        workerRef.current?.postMessage({
          type: 'update',
          viewPos: currentViewPos,
        });
        lastViewPosRef.current = { ...currentViewPos };
      }

      // 화면 클리어
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 별들 그리기
      ctx.globalCompositeOperation = 'lighter';
      const positions = starPositionsRef.current;

      if (positions.length > 0 && starImageRef.current) {
        positions.forEach(({ x, y, radius, alpha }) => {
          ctx.globalAlpha = alpha;
          ctx.drawImage(
            starImageRef.current!,
            x - radius / 2,
            y - radius / 2,
            radius,
            radius
          );
        });
      }

      animationFrameIdRef.current = window.requestAnimationFrame(animate);
    };

    animate();

    // --- 이벤트 핸들러 ---
    const handleResize = () => {
      if (!canvas) return;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Worker에 리사이즈 알림
      workerRef.current?.postMessage({
        type: 'resize',
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
      });
    };

    window.addEventListener('resize', handleResize);

    // --- 클린업 ---
    return () => {
      window.cancelAnimationFrame(animationFrameIdRef.current);
      window.removeEventListener('resize', handleResize);

      // Worker 종료
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [viewPosRef]); // viewPosRef는 ref 객체이므로 한번만 실행됩니다.

  return <canvas ref={canvasRef} id='starfield-canvas' />;
};

export default StarfieldCanvas;
