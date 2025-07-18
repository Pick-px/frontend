import React, { useRef, useEffect } from 'react';
import './StarfieldCanvas.css';
import { Star, createStars, createStarImage } from '../../utils/starfieldUtils';

type StarfieldCanvasProps = {
  viewPosRef: React.RefObject<{ x: number; y: number }>;
};

const StarfieldCanvas = ({ viewPosRef }: StarfieldCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number>(0);
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- 초기 설정 ---
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const starImage = createStarImage();
    starsRef.current = createStars(canvas.width, canvas.height);

    // --- 애니메이션 루프 ---
    const animate = () => {
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.globalCompositeOperation = 'lighter';

      const currentViewPos = viewPosRef.current ?? { x: 0, y: 0 };
      starsRef.current.forEach((star) => {
        star.update();
        star.draw(ctx, starImage, currentViewPos);
      });

      animationFrameIdRef.current = window.requestAnimationFrame(animate);
    };

    animate();

    // --- 이벤트 핸들러 ---
    const handleResize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // 화면 크기가 변하면 별들을 다시 생성하여 자연스럽게 분포시킵니다.
      starsRef.current = createStars(canvas.width, canvas.height);
    };

    window.addEventListener('resize', handleResize);

    // --- 클린업 ---
    return () => {
      window.cancelAnimationFrame(animationFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [viewPosRef]); // viewPosRef는 ref 객체이므로 한번만 실행됩니다.

  return <canvas ref={canvasRef} id='starfield-canvas' />;
};

export default StarfieldCanvas;
