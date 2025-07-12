import React, { useRef, useEffect, useCallback, useState } from 'react';
import GameStarfieldCanvas from './GameStarfieldCanvas';
import { useCanvasUiStore } from '../../store/canvasUiStore';
import Preloader from '../Preloader';
import { useCanvasStore } from '../../store/canvasStore';
import { toast } from 'react-toastify';
import { fetchCanvasData as fetchCanvasDataUtil } from '../../api/canvasFetch';
import NotFoundPage from '../../pages/NotFoundPage';
import { useCanvasInteraction } from '../../hooks/useCanvasInteraction';
import useSound from 'use-sound';
import { useGameSocket } from '../../hooks/useGameSocket';

import {
  INITIAL_POSITION,
  MIN_SCALE,
  MAX_SCALE,
  INITIAL_BACKGROUND_COLOR,
  VIEWPORT_BACKGROUND_COLOR,
} from './canvasConstants';

// 게임 문제 타입 정의
interface GameQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
}

// 게임 문제 목록 (실제로는 별도 파일이나 API에서 가져올 예정)
const GAME_QUESTIONS: GameQuestion[] = [
  {
    id: '1',
    question: '다음 중 JavaScript의 원시 타입이 아닌 것은?',
    options: ['String', 'Number', 'Boolean', 'Array'],
    answer: 3,
  },
  {
    id: '2',
    question: 'React의 핵심 개념이 아닌 것은?',
    options: ['Component', 'Props', 'State', 'Database'],
    answer: 3,
  },
  {
    id: '3',
    question: 'HTML에서 CSS를 연결하는 태그는?',
    options: ['<script>', '<link>', '<style>', '<css>'],
    answer: 1,
  },
];

type GameCanvasProps = {
  canvas_id: string;
  onLoadingChange?: (loading: boolean) => void;
};

function GameCanvas({
  canvas_id: initialCanvasId,
  onLoadingChange,
}: GameCanvasProps) {
  const { canvas_id, setCanvasId } = useCanvasStore();
  const [userColor, setUserColor] = useState<string>('#FF5733'); // 사용자 색상 (서버에서 받아올 예정)

  const rootRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const renderCanvasRef = useRef<HTMLCanvasElement>(null);
  const interactionCanvasRef = useRef<HTMLCanvasElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null!);
  const scaleRef = useRef<number>(1);
  const viewPosRef = useRef<{ x: number; y: number }>(INITIAL_POSITION);
  const DRAG_THRESHOLD = 5; // 5px 이상 움직이면 드래그로 간주
  const fixedPosRef = useRef<{ x: number; y: number; color: string } | null>(
    null
  );
  const previewPixelRef = useRef<{
    x: number;
    y: number;
    color: string;
  } | null>(null);
  const flashingPixelRef = useRef<{ x: number; y: number } | null>(null);

  // 상태 관리
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [hasError, setHasError] = useState(false);
  const [canvasType, setCanvasType] = useState<string | null>(null);
  const [endedAt, setEndedAt] = useState<string | null>(null); // 추가: 캔버스 종료 시간
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(
    null
  );
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(3);
  const [currentPixel, setCurrentPixel] = useState<{
    x: number;
    y: number;
    color: string;
  } | null>(null);
  const [playCountDown] = useSound('/count_down.mp3', { volume: 0.3 });

  const cooldown = useCanvasUiStore((state) => state.cooldown);
  const setHoverPos = useCanvasUiStore((state) => state.setHoverPos);
  const startCooldown = useCanvasUiStore((state) => state.startCooldown);
  const isLoading = useCanvasUiStore((state) => state.isLoading);
  const setIsLoading = useCanvasUiStore((state) => state.setIsLoading);
  const showCanvas = useCanvasUiStore((state) => state.showCanvas);
  const setShowCanvas = useCanvasUiStore((state) => state.setShowCanvas);

  // 그라디언트 애니메이션을 위한 상태
  const [gradientOffset, setGradientOffset] = useState(0);

  // 그라디언트 애니메이션 효과
  useEffect(() => {
    const interval = setInterval(() => {
      setGradientOffset((prev) => (prev + 0.01) % 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

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

      // 회전하는 그라디언트 효과
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvasSize.width,
        canvasSize.height
      );

      // 애니메이션을 위해 오프셋 적용
      gradient.addColorStop((0 + gradientOffset) % 1, 'rgba(34, 197, 94, 0.8)');
      gradient.addColorStop(
        (0.25 + gradientOffset) % 1,
        'rgba(59, 130, 246, 0.8)'
      );
      gradient.addColorStop(
        (0.5 + gradientOffset) % 1,
        'rgba(168, 85, 247, 0.8)'
      );
      gradient.addColorStop(
        (0.75 + gradientOffset) % 1,
        'rgba(236, 72, 153, 0.8)'
      );
      gradient.addColorStop((1 + gradientOffset) % 1, 'rgba(34, 197, 94, 0.8)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 5 / scaleRef.current; // 더 굵은 테두리
      ctx.strokeRect(-1, -1, canvasSize.width + 2, canvasSize.height + 2);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1 / scaleRef.current;
      ctx.strokeRect(0, 0, canvasSize.width, canvasSize.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(src, 0, 0);

      // 격자 그리기
      ctx.strokeStyle = 'rgba(255,255,255, 0.5)';
      ctx.lineWidth = 1 / scaleRef.current;
      ctx.beginPath();
      for (let x = 0; x <= canvasSize.width; x++) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasSize.height);
      }
      for (let y = 0; y <= canvasSize.height; y++) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvasSize.width, y);
      }
      ctx.stroke();

      ctx.restore();
    }

    const preview = previewCanvasRef.current;
    const pctx = preview?.getContext('2d');
    if (pctx && preview) {
      pctx.save();
      pctx.clearRect(0, 0, preview.width, preview.height);
      pctx.translate(viewPosRef.current.x, viewPosRef.current.y);
      pctx.scale(scaleRef.current, scaleRef.current);

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

    // Flashing pixel effect
    if (flashingPixelRef.current) {
      const { x, y } = flashingPixelRef.current;
      const currentTime = Date.now();
      const isVisible = Math.floor(currentTime / 500) % 2 === 0; // Blink every 500ms

      if (isVisible) {
        const flashCtx = previewCanvasRef.current?.getContext('2d');
        if (flashCtx) {
          flashCtx.save();
          flashCtx.translate(viewPosRef.current.x, viewPosRef.current.y);
          flashCtx.scale(scaleRef.current, scaleRef.current);
          flashCtx.strokeStyle = 'rgba(255, 0, 0, 0.9)'; // Red border
          flashCtx.lineWidth = 4 / scaleRef.current;
          flashCtx.strokeRect(x, y, 1, 1);
          flashCtx.restore();
        }
      }
    }
  }, [canvasSize, gradientOffset]);

  // 게임 소켓 연결
  const { sendPixel, sendGameResult } = useGameSocket({
    sourceCanvasRef,
    draw,
    canvas_id,
    onCooldownReceived: (cooldownData) => {
      if (cooldownData.cooldown) {
        startCooldown(cooldownData.remaining);
      }
    },
    onDeadPixels: (data) => {
      // 죽은 픽셀 처리
      const { pixels, username } = data;

      // 소스 캔버스에 픽셀 업데이트
      const sourceCtx = sourceCanvasRef.current?.getContext('2d');
      if (sourceCtx) {
        pixels.forEach((pixel: { x: number; y: number; color: string }) => {
          sourceCtx.fillStyle = pixel.color;
          sourceCtx.fillRect(pixel.x, pixel.y, 1, 1);
        });
        draw();
      }

      // 토스트 메시지 표시
      toast.error(`${username} 사망!`, {
        position: 'top-center',
        autoClose: 3000,
      });
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
    [canvasSize, setHoverPos]
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

    // 화면 크기에 맞게 스케일 계산 - 더 크게 표시
    const viewportWidth = canvas.clientWidth;
    const viewportHeight = canvas.clientHeight;

    // 스케일 팩터를 크게 설정하여 캔버스를 크게 표시 (10x10 유지하면서)
    const scaleFactor = 2.0; // 더 큰 값으로 변경
    const scaleX = (viewportWidth / canvasSize.width) * scaleFactor;
    const scaleY = (viewportHeight / canvasSize.height) * scaleFactor;
    scaleRef.current = Math.max(Math.min(scaleX, scaleY), MIN_SCALE);
    scaleRef.current = Math.min(scaleRef.current, MAX_SCALE * 2); // MAX_SCALE 제한도 늘림

    // 캔버스를 화면 중앙에 배치
    viewPosRef.current.x =
      (viewportWidth - canvasSize.width * scaleRef.current) / 2;
    viewPosRef.current.y =
      (viewportHeight - canvasSize.height * scaleRef.current) / 2;

    draw();
    clearOverlay();
  }, [draw, clearOverlay, canvasSize]);

  // 픽셀 확정 처리
  const handleConfirm = useCallback(() => {
    const pos = fixedPosRef.current;
    if (!pos) return;

    // 현재 픽셀 색상 확인
    const sourceCtx = sourceCanvasRef.current?.getContext('2d');
    if (!sourceCtx) return;

    const pixelData = sourceCtx.getImageData(pos.x, pos.y, 1, 1).data;
    const currentColor = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;
    const isBlack =
      pixelData[0] === 0 && pixelData[1] === 0 && pixelData[2] === 0;

    if (isBlack) {
      // 검은색 픽셀이면 바로 그리기 (기존 로직과 동일)
      startCooldown(3);

      // 소스 캔버스에 직접 그리기 (소켓 응답을 기다리지 않고 즉시 표시)
      sourceCtx.fillStyle = userColor;
      sourceCtx.fillRect(pos.x, pos.y, 1, 1);

      previewPixelRef.current = { x: pos.x, y: pos.y, color: userColor };
      flashingPixelRef.current = { x: pos.x, y: pos.y };
      draw();

      // 소켓으로 전송
      sendPixel({ x: pos.x, y: pos.y, color: userColor });

      setTimeout(() => {
        previewPixelRef.current = null;
        // 확정 버튼이 사라지지 않도록 fixedPosRef 유지
        // if (fixedPosRef.current) {
        //   fixedPosRef.current.color = 'transparent';
        // }
        draw();
      }, 3000);
    } else {
      // 검은색이 아니면 문제 모달 표시
      setCurrentPixel({ x: pos.x, y: pos.y, color: userColor });
      const randomQuestion =
        GAME_QUESTIONS[Math.floor(Math.random() * GAME_QUESTIONS.length)];
      setCurrentQuestion(randomQuestion);
      setSelectedAnswer(null);
      setTimeLeft(3);
      setShowQuestionModal(true);
      playCountDown();
    }
  }, [userColor, draw, sendPixel, startCooldown, playCountDown]);

  // 문제 답변 제출
  const submitAnswer = useCallback(() => {
    if (!currentQuestion || selectedAnswer === null || !currentPixel) return;

    const isCorrect = selectedAnswer === currentQuestion.answer;
    setShowQuestionModal(false);

    if (isCorrect) {
      toast.success('정답입니다!');

      // 픽셀 그리기
      startCooldown(3);

      // 소스 캔버스에 직접 그리기
      const sourceCtx = sourceCanvasRef.current?.getContext('2d');
      if (sourceCtx) {
        sourceCtx.fillStyle = currentPixel.color;
        sourceCtx.fillRect(currentPixel.x, currentPixel.y, 1, 1);
      }

      previewPixelRef.current = {
        x: currentPixel.x,
        y: currentPixel.y,
        color: currentPixel.color,
      };
      flashingPixelRef.current = { x: currentPixel.x, y: currentPixel.y };
      draw();

      // 결과 전송 - 정답일 경우 result: true
      console.log('게임 결과 전송 (정답):', {
        x: currentPixel.x,
        y: currentPixel.y,
        color: currentPixel.color,
        result: true,
      });
      sendGameResult({
        x: currentPixel.x,
        y: currentPixel.y,
        color: currentPixel.color,
        result: true,
      });

      setTimeout(() => {
        previewPixelRef.current = null;
        // 확정 버튼이 사라지지 않도록 fixedPosRef 유지
        // if (fixedPosRef.current) {
        //   fixedPosRef.current.color = 'transparent';
        // }
        draw();
      }, 3000);
    } else {
      toast.error('오답입니다!');

      // 오답 결과 전송 - 오답일 경우 result: false
      sendGameResult({
        x: currentPixel.x,
        y: currentPixel.y,
        color: currentPixel.color,
        result: false,
      });
    }

    setCurrentPixel(null);
  }, [
    currentQuestion,
    selectedAnswer,
    currentPixel,
    draw,
    sendGameResult,
    startCooldown,
  ]);

  // 타이머 효과
  useEffect(() => {
    let timerId: number;

    if (showQuestionModal && timeLeft > 0) {
      timerId = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && showQuestionModal) {
      // 시간 초과 시 자동 제출
      submitAnswer();
    }

    return () => {
      clearInterval(timerId);
    };
  }, [showQuestionModal, timeLeft, submitAnswer]);

  // 캔버스 데이터 가져오기
  useEffect(() => {
    fetchCanvasDataUtil({
      id: initialCanvasId,
      setIsLoading,
      setHasError,
      setCanvasId,
      setCanvasSize,
      sourceCanvasRef,
      onLoadingChange,
      setShowCanvas,
      INITIAL_BACKGROUND_COLOR,
      setCanvasType,
      setEndedAt,
    });

    // 사용자 색상 가져오기 (실제로는 API에서 가져올 예정)
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    setUserColor(randomColor);
  }, [
    initialCanvasId,
    setCanvasId,
    setIsLoading,
    onLoadingChange,
    setShowCanvas,
  ]);

  useEffect(() => {
    if (initialCanvasId && initialCanvasId !== canvas_id) {
      setCanvasId(initialCanvasId);
    }
  }, [initialCanvasId, canvas_id, setCanvasId]);

  // 애니메이션 루프 - 항상 실행하도록 수정
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      draw();
      animationFrameId = requestAnimationFrame(animate);
    };

    // 항상 애니메이션 루프 실행 (쿨다운이나 깜박임 여부와 관계없이)
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [draw]);

  // 캔버스 크기 조정
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

  // 캔버스 상호작용 훅
  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useCanvasInteraction({
    viewPosRef,
    scaleRef,
    imageCanvasRef: { current: null }, // 이미지 캔버스 없음
    interactionCanvasRef,
    fixedPosRef,
    canvasSize,
    imageMode: false,
    isImageFixed: true,
    isDraggingImage: false,
    setIsDraggingImage: () => {},
    dragStart: { x: 0, y: 0 },
    setDragStart: () => {},
    isResizing: false,
    setIsResizing: () => {},
    resizeHandle: null,
    setResizeHandle: () => {},
    resizeStart: { x: 0, y: 0, width: 0, height: 0 },
    setResizeStart: () => {},
    imagePosition: { x: 0, y: 0 },
    setImagePosition: () => {},
    imageSize: { width: 0, height: 0 },
    setImageSize: () => {},
    draw,
    updateOverlay,
    clearOverlay,
    centerOnPixel: () => {}, // 픽셀 중앙 이동 기능 비활성화
    getResizeHandle: () => null,
    handleImageScale: () => {},
    setShowPalette: () => {},
    DRAG_THRESHOLD,
    handleConfirm,
    isGameMode: true, // 게임 모드 활성화
  });

  if (hasError) {
    return <NotFoundPage />;
  }

  return (
    <div
      ref={rootRef}
      className='relative h-full w-full transition-all duration-300'
      style={{
        backgroundColor: VIEWPORT_BACKGROUND_COLOR,
        boxShadow: cooldown
          ? 'inset 0 0 50px rgba(239, 68, 68, 0.3), 0 0 100px rgba(239, 68, 68, 0.2)'
          : 'inset 0 0 50px rgba(59, 130, 246, 0.3), 0 0 100px rgba(168, 85, 247, 0.2)',
        animation: 'gradientBG 8s ease infinite',
      }}
    >
      <style jsx>{`
        @keyframes gradientBG {
          0% {
            box-shadow:
              inset 0 0 50px rgba(59, 130, 246, 0.3),
              0 0 100px rgba(168, 85, 247, 0.2);
          }
          25% {
            box-shadow:
              inset 0 0 50px rgba(168, 85, 247, 0.3),
              0 0 100px rgba(236, 72, 153, 0.2);
          }
          50% {
            box-shadow:
              inset 0 0 50px rgba(236, 72, 153, 0.3),
              0 0 100px rgba(34, 197, 94, 0.2);
          }
          75% {
            box-shadow:
              inset 0 0 50px rgba(34, 197, 94, 0.3),
              0 0 100px rgba(59, 130, 246, 0.2);
          }
          100% {
            box-shadow:
              inset 0 0 50px rgba(59, 130, 246, 0.3),
              0 0 100px rgba(168, 85, 247, 0.2);
          }
        }
      `}</style>
      <GameStarfieldCanvas viewPosRef={viewPosRef} />
      {cooldown && (
        <>
          <div className='pointer-events-none absolute inset-0 border-4 border-red-500/30' />
          <div className='pointer-events-none absolute inset-2 border-2 border-red-400/20' />
          <div className='pointer-events-none absolute inset-4 border border-red-300/10' />
          <div className='pointer-events-none fixed bottom-[20px] left-1/2 z-[9999] -translate-x-1/2 transform'>
            <div className='relative'>
              {/* 외부 링 */}
              <div
                className='h-16 w-16 animate-spin rounded-full border-4 border-red-500/60'
                style={{ animationDuration: '2s' }}
              ></div>
              {/* 중간 링 */}
              <div
                className='absolute inset-1 animate-spin rounded-full border-2 border-orange-400/50'
                style={{
                  animationDuration: '1.5s',
                  animationDirection: 'reverse',
                }}
              ></div>
              {/* 내부 원 */}
              <div className='absolute inset-3 flex animate-pulse items-center justify-center rounded-full border border-red-400/60 bg-gradient-to-br from-red-900/80 to-black/70 shadow-2xl backdrop-blur-xl'>
                <span className='animate-pulse font-mono text-xl font-bold tracking-wider text-red-300'>
                  {timeLeft}
                </span>
              </div>
              {/* 글로우 효과 */}
              <div className='absolute inset-0 animate-ping rounded-full bg-red-500/15'></div>
              <div
                className='absolute inset-0 animate-ping rounded-full bg-orange-400/10'
                style={{ animationDelay: '1s' }}
              ></div>
            </div>
          </div>
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
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        />
      </div>

      {isLoading ? (
        <Preloader />
      ) : (
        <div className='fixed right-4 bottom-4 z-10'>
          {/* 확정 버튼 - 항상 표시 */}
          <button
            onClick={handleConfirm}
            disabled={cooldown}
            className={`transform rounded-lg px-6 py-3 text-base font-medium text-white shadow-lg transition-all ${cooldown 
              ? 'cursor-not-allowed border border-red-500/30 bg-red-500/20 text-red-400' 
              : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-105 hover:from-green-600 hover:to-emerald-600 active:scale-95'}`}
          >
            {cooldown ? (
              <div className="flex items-center gap-2">
                <svg
                  className='h-5 w-5 animate-spin'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                <span className="font-medium">{timeLeft}초 대기</span>
              </div>
            ) : (
              '확정'
            )}
          </button>
        </div>
      )}

      {/* 문제 모달 */}
      {showQuestionModal && currentQuestion && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'>
          <div className='w-full max-w-md rounded-xl bg-gray-900 p-6 shadow-2xl'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-xl font-bold text-white'>문제</h3>
              <div className='rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white'>
                {timeLeft}초
              </div>
            </div>

            <p className='mb-6 text-lg text-white'>
              {currentQuestion.question}
            </p>

            <div className='space-y-3'>
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  className={`w-full rounded-lg border border-gray-700 p-3 text-left transition-all ${
                    selectedAnswer === index
                      ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                  onClick={() => setSelectedAnswer(index)}
                >
                  {option}
                </button>
              ))}
            </div>

            <button
              className={`mt-6 w-full rounded-lg py-3 text-center font-bold ${
                selectedAnswer !== null
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}
              onClick={submitAnswer}
              disabled={selectedAnswer === null}
            >
              제출하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameCanvas;
