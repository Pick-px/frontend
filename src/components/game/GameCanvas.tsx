import React, { useState, useEffect, useRef, useCallback } from 'react';

import GameStarfieldCanvas from './GameStarfieldCanvas';
import { useCanvasUiStore } from '../../store/canvasUiStore';
import Preloader from '../Preloader';
import { useCanvasStore } from '../../store/canvasStore';
import { useAuthStore } from '../../store/authStrore';
import { toast } from 'react-toastify';
import { GameAPI } from '../../api/GameAPI';
import type { WaitingRoomData } from '../../api/GameAPI';
import { useTimeSyncStore } from '../../store/timeSyncStore';
import NotFoundPage from '../../pages/NotFoundPage';
import { useCanvasInteraction } from '../../hooks/useCanvasInteraction';
import useSound from 'use-sound';
import { useGameSocketIntegration } from '../gameSocketIntegration';
import { useNavigate } from 'react-router-dom';
import GameTimer from './GameTimer'; // GameTimer import 추가
import GameResultModal from './GameResultModal'; // 게임 결과 모달 import
import DeathModal from '../modal/DeathModal'; // 사망 모달 import
import QuestionModal from './QuestionModal'; // 문제 모달 import
import ExitModal from '../modal/ExitModal'; // 나가기 모달 import

import {
  INITIAL_POSITION,
  MIN_SCALE,
  MAX_SCALE,
  INITIAL_BACKGROUND_COLOR,
  VIEWPORT_BACKGROUND_COLOR,
} from '../canvas/canvasConstants';
import GameReadyModal from './GameReadyModal';
import { useViewport } from '../../hooks/useViewport';
import LifeIndicator from './LifeIndicator';

// 게임 문제 타입 정의
interface GameQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
}

type GameCanvasProps = {
  canvas_id: string;
  onLoadingChange?: (loading: boolean) => void;
};

function GameCanvas({
  canvas_id: initialCanvasId,
  onLoadingChange,
}: GameCanvasProps) {
  const [waitingData, setWaitingData] = useState<WaitingRoomData | null>(null); // API에서 가져온 게임 데이터
  const [isGameStarted, setIsGameStarted] = useState(false); // 게임 시작 상태
  const [isReadyModalOpen, setIsReadyModalOpen] = useState(true); // 모달 표시 상태
  const [assignedColor, setAssignedColor] = useState<string | undefined>(
    undefined
  );
  const [readyTime, setReadyTime] = useState<number | undefined>(undefined); // 대기 모달 카운트다운
  const [gameTime, setGameTime] = useState<number>(90); // 실제 게임 시간 (초)
  const [totalGameDuration, setTotalGameDuration] = useState<number>(90); // 전체 게임 시간 (초)
  const [lives, setLives] = useState(2); // 사용자 생명 (2개)
  const [isLifeDecreasing, setIsLifeDecreasing] = useState(false); // 생명 차감 애니메이션 상태

  const navigate = useNavigate();
  const { canvas_id, setCanvasId } = useCanvasStore();
  const { user } = useAuthStore(); // 현재 사용자 정보 가져오기
  const [showDeathModal, setShowDeathModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false); // 나가기 모달 상태
  const [isGameEnded, setIsGameEnded] = useState(false); // 게임 종료 상태
  const [isWaitingForResults, setIsWaitingForResults] = useState(false); // 결과 대기 상태
  const [gameResults, setGameResults] = useState<Array<{
    username: string;
    rank: number;
    own_count: number;
    try_count: number;
    dead: boolean;
  }> | null>(null); // 게임 결과
  const [userColor, setUserColor] = useState<string>('#FF5733'); // 사용자 색상 (서버에서 받아올 예정)
  const [playExplosion] = useSound('/explosion.mp3', {
    volume: 0.2,
  });

  // 게임 대기 모달창 배경음악
  const [playAdventureMusic, { stop: stopAdventureMusic }] = useSound(
    '/adventure.mp3',
    {
      volume: 0.15,
      loop: true,
    }
  );

  // 게임 시작 배경음악
  const [playGameMusic, { stop: stopGameMusic }] = useSound('/game.mp3', {
    volume: 0.25,
    loop: true,
  });
  const [playClick] = useSound('/click.mp3', { volume: 0.7 });

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

  const { width } = useViewport();
  const isMobile = width <= 768;

  // 상태 관리
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [hasError, setHasError] = useState(false);
  const [canvasType, setCanvasType] = useState<string | null>(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<GameQuestion | null>(
    null
  );
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(10); // 문제 타이머 (10초)
  const [questionTimeDisplay, setQuestionTimeDisplay] = useState(10); // 문제 타이머 표시용
  const [showResult, setShowResult] = useState(false); // 문제 결과 표시 상태
  const [isCorrect, setIsCorrect] = useState(false); // 정답 여부
  const [currentPixel, setCurrentPixel] = useState<{
    x: number;
    y: number;
    color: string;
  } | null>(null);

  const cooldown = useCanvasUiStore((state) => state.cooldown);
  const timeLeft = useCanvasUiStore((state) => state.timeLeft);
  const setHoverPos = useCanvasUiStore((state) => state.setHoverPos);
  const startCooldown = useCanvasUiStore((state) => state.startCooldown);
  const isLoading = useCanvasUiStore((state) => state.isLoading);
  const setIsLoading = useCanvasUiStore((state) => state.setIsLoading);
  const showCanvas = useCanvasUiStore((state) => state.showCanvas);
  const setShowCanvas = useCanvasUiStore((state) => state.setShowCanvas);
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

      // 테두리 그리기 - PixelCanvas 스타일
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

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3 / scaleRef.current;
      ctx.strokeRect(-1, -1, canvasSize.width + 2, canvasSize.height + 2);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1 / scaleRef.current;
      ctx.strokeRect(0, 0, canvasSize.width, canvasSize.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(src, 0, 0);

      // 격자 그리기
      ctx.strokeStyle = 'rgba(255,255,255, 0.3)';
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
  }, [canvasSize, isGameStarted]);

  // 게임 소켓 연결
  // 다른 유저의 사망 처리 (dead_user 이벤트)
  const onDeadPixels = useCallback(
    (data: any) => {
      playExplosion();
      const { pixels, username } = data;

      // 소스 캔버스에 죽은 픽셀 표시
      const sourceCtx = sourceCanvasRef.current?.getContext('2d');
      if (sourceCtx && pixels && pixels.length > 0) {
        // 각 픽셀에 대해 폭발 효과 생성
        pixels.forEach((pixel: { x: number; y: number; color: string }) => {
          // 소스 캔버스에 픽셀 그리기
          sourceCtx.fillStyle = pixel.color;
          sourceCtx.fillRect(pixel.x, pixel.y, 1, 1);

          // 폭발 효과 생성
          createExplosionEffect(pixel.x, pixel.y);
        });

        // 캔버스 다시 그리기
        draw();
      }

      // 다른 플레이어 사망시 작은 알림 표시
      const deathMessage = document.createElement('div');
      deathMessage.className =
        'fixed z-50 top-4 right-4 bg-gradient-to-b from-red-900/90 to-black/90 text-white px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm border border-red-500 text-sm max-w-[200px]';

      // 애니메이션 적용
      deathMessage.animate(
        [
          { opacity: 0, transform: 'translateY(-20px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        {
          duration: 300,
          easing: 'ease-out',
          fill: 'forwards',
        }
      );

      deathMessage.innerHTML = `
      <div class="flex items-center gap-2">
        <div class="text-xl">☠️</div>
        <div>
          <div class="text-lg font-bold text-red-400">${username} 전사!</div>
          <div class="text-xs text-white opacity-80">상대의 색이 사라졌습니다!</div>
          <div class="text-xs opacity-70">지금이 기회! 빈 공간을 차지하세요!</div>
        </div>
      </div>
    `;
      document.body.appendChild(deathMessage);

      // 화면 진동 효과
      const shakeScreen = () => {
        const root = rootRef.current;
        if (!root) return;

        root.animate(
          [
            { transform: 'translate(0, 0)' },
            { transform: 'translate(-5px, 5px)' },
            { transform: 'translate(5px, -5px)' },
            { transform: 'translate(-5px, -5px)' },
            { transform: 'translate(5px, 5px)' },
            { transform: 'translate(0, 0)' },
          ],
          { duration: 500, easing: 'ease-in-out' }
        );
      };

      shakeScreen();

      // 3초 후 메시지 제거 (페이드 아웃 효과 추가)
      setTimeout(() => {
        deathMessage.animate(
          [
            { opacity: 1, transform: 'translateY(0)' },
            { opacity: 0, transform: 'translateY(-20px)' },
          ],
          { duration: 300, easing: 'ease-in', fill: 'forwards' }
        );

        setTimeout(() => {
          if (document.body.contains(deathMessage)) {
            document.body.removeChild(deathMessage);
          }
        }, 300);
      }, 3000);
    },
    [draw]
  );

  const onDeadNotice = useCallback(
    (data: { message: string }) => {
      playExplosion();
      stopGameMusic();
      // React로 모달 열기
      setShowDeathModal(true);
    },
    [playExplosion, stopGameMusic]
  );

  // 폭발 효과 생성 함수
  const createExplosionEffect = useCallback((x: number, y: number) => {
    // 폭발 효과를 더 화려하게 개선
    // 1. 큰 폭발 원 생성
    const explosion = document.createElement('div');
    explosion.className = 'absolute rounded-full z-40';

    // 위치 계산 (캔버스 좌표계에서 화면 좌표계로 변환)
    const screenX = x * scaleRef.current + viewPosRef.current.x;
    const screenY = y * scaleRef.current + viewPosRef.current.y;

    explosion.style.left = `${screenX}px`;
    explosion.style.top = `${screenY}px`;
    explosion.style.transform = 'translate(-50%, -50%)';
    explosion.style.boxShadow = '0 0 10px 2px rgba(255, 100, 50, 0.8)';

    // 폭발 애니메이션
    explosion.animate(
      [
        {
          width: '0px',
          height: '0px',
          backgroundColor: 'rgba(255, 255, 200, 1)',
          opacity: 1,
        },
        {
          width: '80px',
          height: '80px',
          backgroundColor: 'rgba(255, 100, 50, 0.8)',
          opacity: 0.8,
        },
        {
          width: '120px',
          height: '120px',
          backgroundColor: 'rgba(255, 50, 0, 0)',
          opacity: 0,
        },
      ],
      { duration: 600, easing: 'ease-out', fill: 'forwards' }
    );

    document.body.appendChild(explosion);

    // 2. 파티클 수 증가
    const particleCount = 20;

    // 3. 파티클 생성
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');

      const isCircle = Math.random() > 0.3;
      particle.className = `absolute z-40 ${isCircle ? 'rounded-full' : ''}`;

      // 랜덤 크기 (3px ~ 10px)
      const size = Math.floor(Math.random() * 8) + 3;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      // 더 다양한 색상
      const colors = [
        '#ff4444',
        '#ff7700',
        '#ffaa00',
        '#ff0000',
        '#ffff00',
        '#ffcc00',
        '#ff5500',
        '#ff2200',
        '#ffddaa',
        '#ffffff',
      ];
      particle.style.backgroundColor =
        colors[Math.floor(Math.random() * colors.length)];

      // 반짝임 효과 추가
      if (Math.random() > 0.7) {
        particle.style.boxShadow =
          '0 0 3px 1px ' + particle.style.backgroundColor;
      }

      particle.style.left = `${screenX}px`;
      particle.style.top = `${screenY}px`;
      particle.style.transform = 'translate(-50%, -50%)';

      // 애니메이션 설정
      const angle = Math.random() * Math.PI * 2; // 랜덤 방향
      const speed = Math.random() * 100 + 50; // 더 빠른 속도
      const duration = Math.random() * 1500 + 800; // 더 긴 지속시간

      // 회전 추가
      const rotation = Math.random() * 720 - 360; // -360도 ~ 360도

      // 애니메이션 적용
      particle.animate(
        [
          {
            opacity: 1,
            transform: 'translate(-50%, -50%) scale(1) rotate(0deg)',
          },
          {
            opacity: 0.8,
            transform: `translate(calc(-50% + ${Math.cos(angle) * speed * 0.5}px), calc(-50% + ${Math.sin(angle) * speed * 0.5}px)) scale(1.5) rotate(${rotation * 0.5}deg)`,
            offset: 0.4,
          },
          {
            opacity: 0,
            transform: `translate(calc(-50% + ${Math.cos(angle) * speed}px), calc(-50% + ${Math.sin(angle) * speed}px)) scale(0) rotate(${rotation}deg)`,
          },
        ],
        { duration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' }
      );

      // DOM에 추가
      document.body.appendChild(particle);

      // 애니메이션 종료 후 제거
      setTimeout(() => {
        if (document.body.contains(particle)) {
          document.body.removeChild(particle);
        }
      }, duration);
    }

    // 폭발 원 제거
    setTimeout(() => {
      if (document.body.contains(explosion)) {
        document.body.removeChild(explosion);
      }
    }, 600);
  }, []);

  // 게임 결과 처리
  const onGameResult = useCallback(
    (data: {
      results: Array<{
        username: string;
        rank: number;
        own_count: number;
        try_count: number;
        dead: boolean;
      }>;
    }) => {
      // 배경음악 중지
      stopGameMusic();

      // 결과 저장 및 결과 모달 표시
      setGameResults(data.results);
      setIsWaitingForResults(false);
      setIsGameEnded(true);
    },
    [stopGameMusic]
  );

  const { sendGameResult } = useGameSocketIntegration({
    sourceCanvasRef,
    draw,
    canvas_id,
    onDeadPixels,
    onDeadNotice,
    onGameResult,
    onCanvasCloseAlarm: useCallback(
      (data: {
        canvas_id: number;
        title: string;
        ended_at: string;
        server_time: string;
        remain_time: number;
      }) => {
        setGameTime(data.remain_time);
      },
      []
    ),
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

    const viewportWidth = canvas.clientWidth;
    const viewportHeight = canvas.clientHeight;

    // 모바일 (480px 이하)과 데스크탑에 따라 다른 스케일 팩터 적용
    const isMobile = viewportWidth <= 480;
    const scaleFactor = isMobile ? 1.0 : 2.0; // 모바일에서는 1.0, 데스크탑에서는 2.0
    const maxScaleLimit = isMobile ? MAX_SCALE : MAX_SCALE * 2; // 모바일에서는 MAX_SCALE, 데스크탑에서는 MAX_SCALE * 2

    const scaleX = (viewportWidth / canvasSize.width) * scaleFactor;
    const scaleY = (viewportHeight / canvasSize.height) * scaleFactor;
    scaleRef.current = Math.max(Math.min(scaleX, scaleY), MIN_SCALE);
    scaleRef.current = Math.min(scaleRef.current, maxScaleLimit);

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
    const isBlack =
      pixelData[0] === 0 && pixelData[1] === 0 && pixelData[2] === 0;
    // 현재 픽셀 색상이 내 색상인지 확인
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null;
    };

    const myColor = hexToRgb(userColor);
    const isMyColor =
      myColor &&
      Math.abs(pixelData[0] - myColor.r) < 5 &&
      Math.abs(pixelData[1] - myColor.g) < 5 &&
      Math.abs(pixelData[2] - myColor.b) < 5;

    if (isMyColor) {
      // 토스트 대신 직접 UI에 메시지 표시
      const messageDiv = document.createElement('div');
      messageDiv.className =
        'fixed top-4 left-1/2 z-[9999] -translate-x-1/2 transform rounded-lg bg-blue-500 px-4 py-2 text-white shadow-lg';
      messageDiv.textContent = '이미 내 색상으로 칠해진 픽셀입니다.';
      document.body.appendChild(messageDiv);

      // 3초 후 메시지 제거
      setTimeout(() => {
        if (document.body.contains(messageDiv)) {
          document.body.removeChild(messageDiv);
        }
      }, 1000);

      return;
    }

    if (isBlack) {
      // 검은색 픽셀이면 바로 그리기 (기존 로직과 동일)
      startCooldown(1); // 쿨다운 유지

      previewPixelRef.current = { x: pos.x, y: pos.y, color: userColor };
      flashingPixelRef.current = { x: pos.x, y: pos.y };
      draw();
      // 소켓으로 전송
      sendGameResult({ x: pos.x, y: pos.y, color: userColor, result: true });
      setTimeout(() => {
        previewPixelRef.current = null;
        pos.color = 'transparent';
        draw();
      }, 1000);
    } else {
      // 검은색이 아니면 문제 모달 표시
      setCurrentPixel({ x: pos.x, y: pos.y, color: userColor });

      // API에서 가져온 문제 사용
      if (
        waitingData &&
        waitingData.questions &&
        waitingData.questions.length > 0
      ) {
        // 랜덤하게 문제 선택
        const randomIndex = Math.floor(
          Math.random() * waitingData.questions.length
        );
        const question = waitingData.questions[randomIndex];
        setCurrentQuestion(question);
      } else {
        // 문제가 없는 경우 기본 문제 사용
        const defaultQuestion = {
          id: '1',
          question: '기본 문제',
          options: ['옵션 1', '옵션 2', '옵션 3', '옵션 4'],
          answer: 0,
        };
        setCurrentQuestion(defaultQuestion);
      }

      setSelectedAnswer(null);
      setQuestionTimeLeft(10); // 문제 타이머 10초로 초기화
      setShowQuestionModal(true);
    }
  }, [
    userColor,
    draw,
    sendGameResult,
    startCooldown,
    setQuestionTimeLeft,
    waitingData,
    toast,
  ]);

  // 문제 답변 제출
  const submitAnswer = useCallback(() => {
    if (!currentQuestion || selectedAnswer === null || !currentPixel) return;

    const answerCorrect = selectedAnswer === currentQuestion.answer;
    setIsCorrect(answerCorrect);
    setShowResult(true);

    // 1초 후에 결과 화면 닫기
    setTimeout(() => {
      setShowQuestionModal(false);
      setShowResult(false);
      setQuestionTimeLeft(10); // Reset question timer

      if (answerCorrect) {
        startCooldown(1); // 쿨다운 유지

        previewPixelRef.current = {
          x: currentPixel.x,
          y: currentPixel.y,
          color: currentPixel.color,
        };
        flashingPixelRef.current = { x: currentPixel.x, y: currentPixel.y };
        draw();

        // 결과 전송 - 정답일 경우 result: true
        sendGameResult({
          x: currentPixel.x,
          y: currentPixel.y,
          color: currentPixel.color,
          result: true,
        });

        setTimeout(() => {
          previewPixelRef.current = null;
          draw();
        }, 1000);
      } else {
        // 오답일 경우 생명 감소
        setLives((prev) => Math.max(0, prev - 1));
        startCooldown(1);

        // 생명 차감 애니메이션 및 알림 표시
        setIsLifeDecreasing(true);

        // 생명 차감 알림 메시지 표시
        const messageDiv = document.createElement('div');
        messageDiv.className =
          'fixed top-4 left-1/2 z-[9999] -translate-x-1/2 transform rounded-lg bg-red-500 px-4 py-2 text-white shadow-lg';
        messageDiv.textContent = '오답입니다! 생명이 차감되었습니다.';
        document.body.appendChild(messageDiv);

        // 애니메이션 완료 후 상태 초기화
        setTimeout(() => {
          setIsLifeDecreasing(false);
        }, 1000);

        // 2초 후 메시지 제거
        setTimeout(() => {
          if (document.body.contains(messageDiv)) {
            document.body.removeChild(messageDiv);
          }
        }, 2000);

        sendGameResult({
          x: currentPixel.x,
          y: currentPixel.y,
          color: currentPixel.color,
          result: false,
        });
      }

      setCurrentPixel(null);
    }, 1000);
  }, [
    currentQuestion,
    selectedAnswer,
    currentPixel,
    draw,
    sendGameResult,
    startCooldown,
    setQuestionTimeLeft,
    lives,
    setLives,
    setIsLifeDecreasing,
  ]);

  // 문제 타이머 효과
  useEffect(() => {
    let timerId: number;

    // Reset timer when modal closes
    if (!showQuestionModal) {
      setQuestionTimeLeft(10);
    }

    if (showQuestionModal && questionTimeLeft > 0) {
      timerId = window.setInterval(() => {
        setQuestionTimeLeft((prev) => {
          console.log('Question timer:', prev - 1);
          return prev - 1;
        });
      }, 1000);
    } else if (questionTimeLeft === 0 && showQuestionModal) {
      // 시간 초과 시 자동으로 오답 처리
      if (currentPixel) {
        // 시간 초과시 자동으로 false 결과 전송
        startCooldown(1);
        setLives((prev) => Math.max(0, prev - 1));

        // 생명 차감 애니메이션 및 알림 표시
        setIsLifeDecreasing(true);

        // 생명 차감 알림 메시지 표시
        const messageDiv = document.createElement('div');
        messageDiv.className =
          'fixed top-4 left-1/2 z-[9999] -translate-x-1/2 transform rounded-lg bg-red-500 px-4 py-2 text-white shadow-lg';
        messageDiv.textContent = '⏰ 시간 초과! 자동으로 오답 처리되었습니다.';
        document.body.appendChild(messageDiv);

        // 애니메이션 완료 후 상태 초기화
        setTimeout(() => {
          setIsLifeDecreasing(false);
        }, 1000);

        // 2초 후 메시지 제거
        setTimeout(() => {
          if (document.body.contains(messageDiv)) {
            document.body.removeChild(messageDiv);
          }
        }, 1000);

        sendGameResult({
          x: currentPixel.x,
          y: currentPixel.y,
          color: currentPixel.color,
          result: false,
        });

        setShowQuestionModal(false);
        setShowResult(false);
        setCurrentPixel(null);
      }
    }

    return () => {
      clearInterval(timerId);
    };
  }, [
    showQuestionModal,
    questionTimeLeft,
    currentPixel,
    startCooldown,
    setLives,
    sendGameResult,
  ]);

  // 게임 데이터 및 캔버스 초기화
  const { getSynchronizedServerTime } = useTimeSyncStore();

  useEffect(() => {
    // 게임 대기 모달창이 표시될 때 대기 음악 재생
    playAdventureMusic();

    // 게임 데이터 가져오기
    const fetchGameData = async () => {
      try {
        setIsLoading(true);
        const gameData = await GameAPI.fetchGameCanvasData(initialCanvasId);

        if (gameData) {
          // 게임 데이터 저장
          setWaitingData(gameData);

          // 색상 설정
          setAssignedColor(gameData.color);
          setUserColor(gameData.color);

          // 캔버스 크기 설정
          setCanvasSize(gameData.canvasSize);

          // 소스 캔버스 초기화 (모든 픽셀을 검은색으로 설정)
          initializeSourceCanvas(
            gameData.canvasSize.width,
            gameData.canvasSize.height
          );

          // 시작 시간에서 현재 시간을 빼서 대기 시간 계산 (useTimeSyncStore 사용)
          const startTime = new Date(gameData.startedAt).getTime();
          const now = getSynchronizedServerTime();
          const timeUntilStart = Math.max(
            0,
            Math.floor((startTime - now) / 1000)
          );
          setReadyTime(timeUntilStart);

          // 게임 총 시간 계산 및 설정
          const endTime = new Date(gameData.endedAt).getTime();
          const calculatedTotalGameDuration = Math.floor(
            (endTime - startTime) / 1000
          );
          setTotalGameDuration(calculatedTotalGameDuration);
          setGameTime(calculatedTotalGameDuration);

          // 캔버스 표시
          setShowCanvas(true);
        }
      } catch (error) {
        console.error('게임 데이터 가져오기 실패:', error);
        toast.error('게임 데이터를 불러오는데 실패했습니다.');
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGameData();

    // 컴포넌트 언마운트 시 음악 중지
    return () => {
      stopAdventureMusic();
      stopGameMusic();
    };
  }, [
    initialCanvasId,
    playAdventureMusic,
    stopAdventureMusic,
    stopGameMusic,
    setIsLoading,
    setShowCanvas,
    getSynchronizedServerTime,
  ]);

  // 소스 캔버스 초기화 함수 (모든 픽셀을 검은색으로 설정)
  const initializeSourceCanvas = useCallback(
    (width: number, height: number) => {
      if (!sourceCanvasRef.current) {
        sourceCanvasRef.current = document.createElement('canvas');
      }

      const canvas = sourceCanvasRef.current;
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // 검은색 배경으로 초기화
        ctx.fillStyle = INITIAL_BACKGROUND_COLOR;
        ctx.fillRect(0, 0, width, height);
      }

      // 캔버스 크기 설정 후 중앙 정렬
      setTimeout(() => {
        resetAndCenter();
      }, 100);
    },
    [resetAndCenter]
  );

  // 시작시간 받아오기 여기서 처리
  useEffect(() => {
    if (readyTime === undefined) return;

    if (readyTime > 0) {
      const timer = setInterval(() => {
        setReadyTime((prev) => (prev ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    } else if (readyTime <= 1) {
      // 0이하로 변경하여 어떤 경우라도 게임 종료 처리
      // 게임 시작 시 대기 음악 중지하고 게임 음악 재생
      stopAdventureMusic();
      playGameMusic();

      setIsGameStarted(true);
      setIsReadyModalOpen(false);
    }
  }, [readyTime]);

  // 게임 타이머 처리
  useEffect(() => {
    if (!isGameStarted) return;

    if (gameTime > 0) {
      const timer = setInterval(() => {
        setGameTime((prev) => (prev ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    } else if (gameTime <= 1) {
      // 게임 시간이 종료되면 결과 화면 표시
      stopGameMusic();
      playAdventureMusic();
      setIsWaitingForResults(true);

      // 사망 모달이 표시되어 있다면 닫기
      setShowDeathModal(false);
    }
  }, [isGameStarted, gameTime, stopGameMusic, user?.nickname]);

  useEffect(() => {
    if (initialCanvasId && initialCanvasId !== canvas_id) {
      setCanvasId(initialCanvasId);
    }
  }, [initialCanvasId, canvas_id, setCanvasId]);

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

  // 게임 나가기 핸들러
  const handleExit = useCallback(() => {
    setShowExitModal(true);
  }, []);

  // 게임 나가기 확인 핸들러
  const confirmExit = useCallback(() => {
    // 모든 음악 중지
    stopAdventureMusic();
    stopGameMusic();

    setShowExitModal(false);
    navigate('/canvas/pixels'); // 홈페이지로 이동
  }, [navigate, stopAdventureMusic, stopGameMusic]);

  // 게임 나가기 취소 핸들러
  const cancelExit = useCallback(() => {
    setShowExitModal(false);
  }, []);

  return (
    <div
      ref={rootRef}
      className='relative h-full w-full transition-all duration-300'
      style={{
        backgroundColor: VIEWPORT_BACKGROUND_COLOR,
        boxShadow: cooldown
          ? 'inset 0 0 50px rgba(239, 68, 68, 0.3), 0 0 100px rgba(239, 68, 68, 0.2)'
          : 'inset 0 0 50px rgba(59, 130, 246, 0.3), 0 0 100px rgba(168, 85, 247, 0.2)',
      }}
    >
      <GameReadyModal
        canvasId={initialCanvasId}
        isOpen={isReadyModalOpen}
        onClose={() => setIsReadyModalOpen(false)}
        color={assignedColor}
        remainingTime={readyTime}
      />
      {isGameStarted && (
        <>
          {/* 나가기 버튼 및 생명 표시 */}
          <div
            className={`absolute z-50 flex items-center gap-3 ${
              isMobile ? 'bottom-4 left-4 flex-col' : 'top-4 left-4'
            }`}
          >
            <button
              onClick={handleExit}
              className='rounded-lg bg-red-600 px-4 py-2 font-bold text-white shadow-lg transition-all hover:bg-red-700 active:scale-95'
            >
              나가기
            </button>
            <LifeIndicator
              lives={lives}
              maxLives={2}
              isLifeDecreasing={isLifeDecreasing}
            />
          </div>
          <GameTimer currentTime={gameTime} totalTime={totalGameDuration} />
          <style>{`
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
              onMouseDown={(e) => {
                playClick();
                handleMouseDown(e);
              }}
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
            <div className='fixed right-4 bottom-4 z-10 flex flex-col gap-2'>
              {/* 확정 버튼 - 항상 표시 */}
              <button
                onClick={handleConfirm}
                disabled={cooldown}
                className={`transform rounded-lg px-6 py-3 text-base font-medium text-white shadow-lg transition-all ${
                  cooldown
                    ? 'cursor-not-allowed border border-red-500/30 bg-red-500/20 text-red-400'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:scale-105 hover:from-green-600 hover:to-emerald-600 active:scale-95'
                }`}
              >
                {cooldown ? (
                  <div className='flex items-center gap-2'>
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
                    <span className='font-medium'>{timeLeft}초 대기</span>
                  </div>
                ) : (
                  '확정'
                )}
              </button>
            </div>
          )}

          {/* 문제 모달 */}
          <QuestionModal
            isOpen={showQuestionModal}
            currentQuestion={currentQuestion}
            questionTimeLeft={questionTimeLeft}
            lives={lives}
            selectedAnswer={selectedAnswer}
            showResult={showResult}
            isCorrect={isCorrect}
            setSelectedAnswer={setSelectedAnswer}
            submitAnswer={submitAnswer}
          />

          {/* 나가기 확인 모달 */}
          <ExitModal
            isOpen={showExitModal}
            onCancel={cancelExit}
            onConfirm={confirmExit}
          />

          {/* 사망 모달 */}
          <DeathModal
            isOpen={showDeathModal && !isGameEnded && !isWaitingForResults}
          />

          {/* 게임 결과 모달 */}
          <GameResultModal
            isOpen={isWaitingForResults || isGameEnded}
            isWaiting={isWaitingForResults}
            results={gameResults}
            currentUsername={user?.nickname}
          />
        </>
      )}
    </div>
  );
}

export default GameCanvas;
