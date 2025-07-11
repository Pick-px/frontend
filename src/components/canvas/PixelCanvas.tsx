import React, { useRef, useEffect, useCallback, useState } from 'react';
import StarfieldCanvas from './StarfieldCanvas';
import { useCanvasUiStore } from '../../store/canvasUiStore';
import { usePixelSocket } from '../SocketIntegration';
import CanvasUI from './CanvasUI';
import Preloader from '../Preloader';
import { useCanvasStore } from '../../store/canvasStore';
import { toast } from 'react-toastify';
import { fetchCanvasData as fetchCanvasDataUtil } from '../../api/canvasFetch';
import NotFoundPage from '../../pages/NotFoundPage';
import { useCanvasInteraction } from '../../hooks/useCanvasInteraction';

import {
  INITIAL_POSITION,
  MIN_SCALE,
  MAX_SCALE,
  INITIAL_BACKGROUND_COLOR,
  VIEWPORT_BACKGROUND_COLOR,
  COLORS,
} from './canvasConstants';

type PixelCanvasProps = {
  canvas_id: string;
  onLoadingChange?: (loading: boolean) => void;
};

function PixelCanvas({
  canvas_id: initialCanvasId,
  onLoadingChange,
}: PixelCanvasProps) {
  const { canvas_id, setCanvasId, setIsCanvasEnded } = useCanvasStore();

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

  const imageTransparencyRef = useRef(0.5);

  // state를 각각 가져오도록 하여 불필요한 리렌더링을 방지합니다.
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [hasError, setHasError] = useState(false);
  const [canvasType, setCanvasType] = useState<string | null>(null);
  const [endedAt, setEndedAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);

  const color = useCanvasUiStore((state) => state.color);
  const setHoverPos = useCanvasUiStore((state) => state.setHoverPos);
  const cooldown = useCanvasUiStore((state) => state.cooldown);
  const setShowPalette = useCanvasUiStore((state) => state.setShowPalette);
  const showImageControls = useCanvasUiStore(
    (state) => state.showImageControls
  );
  const setShowImageControls = useCanvasUiStore(
    (state) => state.setShowImageControls
  );
  const isImageFixed = useCanvasUiStore((state) => state.isImageFixed);
  const setIsImageFixed = useCanvasUiStore((state) => state.setIsImageFixed);
  const imageMode = useCanvasUiStore((state) => state.imageMode);
  const setImageMode = useCanvasUiStore((state) => state.setImageMode);
  const imageTransparency = useCanvasUiStore(
    (state) => state.imageTransparency
  );
  const setImageTransparency = useCanvasUiStore(
    (state) => state.setImageTransparency
  );
  const isLoading = useCanvasUiStore((state) => state.isLoading);
  const setIsLoading = useCanvasUiStore((state) => state.setIsLoading);
  const showCanvas = useCanvasUiStore((state) => state.showCanvas);
  const setShowCanvas = useCanvasUiStore((state) => state.setShowCanvas);
  const targetPixel = useCanvasUiStore((state) => state.targetPixel);
  const setTargetPixel = useCanvasUiStore((state) => state.setTargetPixel);

  const startCooldown = useCanvasUiStore((state) => state.startCooldown);

  // 이미지 관련 상태 (Zustand로 이동하지 않는 부분)
  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 이미지 리사이즈 핸들 상태 (Zustand로 이동하지 않는 부분)
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<'se' | 'e' | 's' | null>(
    null
  );
  const [resizeStart, setResizeStart] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // 리사이즈 핸들 클릭 감지
  const getResizeHandle = useCallback(
    (wx: number, wy: number) => {
      if (!imageCanvasRef.current || isImageFixed) return null;

      const hs = 12 / scaleRef.current;
      const right = imagePosition.x + imageSize.width;
      const bottom = imagePosition.y + imageSize.height;

      // 우하단 핸들 (대각선 리사이즈)
      if (
        wx >= right - hs &&
        wx <= right &&
        wy >= bottom - hs &&
        wy <= bottom
      ) {
        return 'se';
      }
      // 우측 핸들 (가로 리사이즈)
      if (
        wx >= right - hs &&
        wx <= right &&
        wy >= imagePosition.y + imageSize.height / 2 - hs / 2 &&
        wy <= imagePosition.y + imageSize.height / 2 + hs / 2
      ) {
        return 'e';
      }
      // 하단 핸들 (세로 리사이즈)
      if (
        wy >= bottom - hs &&
        wy <= bottom &&
        wx >= imagePosition.x + imageSize.width / 2 - hs / 2 &&
        wx <= imagePosition.x + imageSize.width / 2 + hs / 2
      ) {
        return 's';
      }
      return null;
    },
    [imagePosition, imageSize, isImageFixed, scaleRef]
  );

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

      // 이미지 편집 모드일 때만 격자 그리기
      if (!isImageFixed && imageCanvasRef.current) {
        ctx.strokeStyle = 'rgba(255,255,255, 0.12)';
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
      }

      // 이미지 렌더링
      if (imageCanvasRef.current) {
        ctx.globalAlpha = imageTransparencyRef.current;
        ctx.imageSmoothingEnabled = false;
        if (!isImageFixed) {
          // 이미지 경계선
          ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
          ctx.lineWidth = 2 / scaleRef.current;
          ctx.strokeRect(
            imagePosition.x - 1,
            imagePosition.y - 1,
            imageSize.width + 2,
            imageSize.height + 2
          );
        }
        ctx.drawImage(
          imageCanvasRef.current,
          imagePosition.x,
          imagePosition.y,
          imageSize.width,
          imageSize.height
        );
        ctx.globalAlpha = 1.0;

        if (!isImageFixed) {
          // 리사이즈 핸들 (네모) - 이미지 위에 그리기
          const hs = 10 / scaleRef.current;

          // 모든 핸들에 동일한 색상 적용 (하늘색)
          ctx.fillStyle = 'rgba(0, 191, 255, 0.95)';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.lineWidth = 2 / scaleRef.current;

          // 대각선 리사이즈 핸들 (우하단)
          ctx.beginPath();
          ctx.rect(
            imagePosition.x + imageSize.width - hs,
            imagePosition.y + imageSize.height - hs,
            hs,
            hs
          );
          ctx.fill();
          ctx.stroke();

          // 수평 리사이즈 핸들 (우측 중앙)
          ctx.beginPath();
          ctx.rect(
            imagePosition.x + imageSize.width - hs,
            imagePosition.y + imageSize.height / 2 - hs / 2,
            hs,
            hs
          );
          ctx.fill();
          ctx.stroke();

          // 수직 리사이즈 핸들 (하단 중앙)
          ctx.beginPath();
          ctx.rect(
            imagePosition.x + imageSize.width / 2 - hs / 2,
            imagePosition.y + imageSize.height - hs,
            hs,
            hs
          );
          ctx.fill();
          ctx.stroke();
        }
      }
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
  }, [canvasSize, imagePosition, imageSize, isImageFixed, imageMode]);

  // 이미지 첨부 핸들러
  const handleImageAttach = useCallback(
    (file: File) => {
      // 팔레트 닫기
      setShowPalette(false);

      if (file.size > 10 * 1024 * 1024) {
        toast.error(
          '이미지 파일이 너무 큽니다. 10MB 이하의 파일을 선택해주세요.'
        );
        return;
      }

      const supportedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ];
      if (!supportedTypes.includes(file.type)) {
        toast.error(
          '지원되지 않는 이미지 형식입니다. JPG, PNG, GIF, WebP 파일을 사용해주세요.'
        );
        return;
      }

      const img = new Image();
      img.onload = () => {
        if (!canvasSize.width || !canvasSize.height) {
          toast.error(
            '캔버스가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.'
          );
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0);
          imageCanvasRef.current = canvas;

          const maxScale = 0.8;
          const scale = Math.min(
            (canvasSize.width * maxScale) / img.width,
            (canvasSize.height * maxScale) / img.height
          );
          const scaledWidth = img.width * scale;
          const scaledHeight = img.height * scale;

          setImageSize({ width: scaledWidth, height: scaledHeight });
          setImagePosition({
            x: (canvasSize.width - scaledWidth) / 2,
            y: (canvasSize.height - scaledHeight) / 2,
          });
          setShowImageControls(true);
          setIsImageFixed(false);

          toast.success('이미지가 성공적으로 첨부되었습니다!');
          draw();
        }
      };

      img.onerror = () => {
        toast.error('이미지를 불러올 수 없습니다. 다른 이미지를 시도해주세요.');
      };

      img.src = URL.createObjectURL(file);
    },
    [canvasSize, draw, setIsImageFixed, setShowImageControls, setShowPalette]
  );

  // 이미지 확대축소
  const handleImageScale = useCallback(
    (scaleFactor: number) => {
      const newWidth = imageSize.width * scaleFactor;
      const newHeight = imageSize.height * scaleFactor;

      if (
        newWidth > 10 &&
        newHeight > 10 &&
        newWidth < canvasSize.width * 3 &&
        newHeight < canvasSize.height * 3
      ) {
        const centerX = imagePosition.x + imageSize.width / 2;
        const centerY = imagePosition.y + imageSize.height / 2;

        const newX = centerX - newWidth / 2;
        const newY = centerY - newHeight / 2;

        setImageSize({ width: newWidth, height: newHeight });
        setImagePosition({ x: newX, y: newY });
        draw();
      }
    },
    [imageSize, imagePosition, canvasSize, draw]
  );

  // 이미지 확정
  const confirmImage = useCallback(() => {
    setIsImageFixed(true);
    setShowImageControls(false);
    toast.success('이미지가 고정되었습니다!');
  }, [setIsImageFixed, setShowImageControls]);

  // 이미지 취소
  const cancelImage = useCallback(() => {
    imageCanvasRef.current = null;
    setShowImageControls(false);
    setIsImageFixed(false);
    toast.info('이미지가 제거되었습니다.');
    draw();
  }, [draw, setIsImageFixed, setShowImageControls]);

  const { sendPixel } = usePixelSocket({
    sourceCanvasRef,
    draw,
    canvas_id,
    onCooldownReceived: (cooldownData) => {
      if (cooldownData.cooldown) {
        startCooldown(cooldownData.remaining);
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
    [canvasSize, viewPosRef, scaleRef, setHoverPos, interactionCanvasRef]
  );

  const clearOverlay = useCallback(() => {
    setHoverPos(null);
    const overlayCanvas = interactionCanvasRef.current;
    if (!overlayCanvas) return;
    const overlayCtx = overlayCanvas.getContext('2d');
    overlayCtx?.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  }, [setHoverPos, interactionCanvasRef]);

  const resetAndCenter = useCallback(() => {
    const canvas = renderCanvasRef.current;
    if (!canvas || canvas.clientWidth === 0 || canvasSize.width === 0) return;
    if (!isImageFixed && imageCanvasRef.current) {
      draw();
      return;
    }
    // 화면 크기에 맞게 스케일 계산
    const viewportWidth = canvas.clientWidth;
    const viewportHeight = canvas.clientHeight;

    const scaleFactor = 0.7;
    const scaleX = (viewportWidth / canvasSize.width) * scaleFactor;
    const scaleY = (viewportHeight / canvasSize.height) * scaleFactor;
    scaleRef.current = Math.max(Math.min(scaleX, scaleY), MIN_SCALE);
    scaleRef.current = Math.min(scaleRef.current, MAX_SCALE);

    // 캔버스를 화면 중앙에 배치
    viewPosRef.current.x =
      (viewportWidth - canvasSize.width * scaleRef.current) / 2;
    viewPosRef.current.y =
      (viewportHeight - canvasSize.height * scaleRef.current) / 2;

    draw();
    clearOverlay();
  }, [draw, clearOverlay, canvasSize, scaleRef, viewPosRef, renderCanvasRef]);

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
    [draw, updateOverlay, canvasSize, viewPosRef, scaleRef, renderCanvasRef]
  );

  const zoomCanvas = useCallback(
    (scaleChange: number) => {
      const canvas = renderCanvasRef.current;
      if (!canvas) return;

      const centerX = canvas.clientWidth / 2;
      const centerY = canvas.clientHeight / 2;

      const xs = (centerX - viewPosRef.current.x) / scaleRef.current;
      const ys = (centerY - viewPosRef.current.y) / scaleRef.current;

      const newScale = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, scaleRef.current * scaleChange)
      );

      scaleRef.current = newScale;
      viewPosRef.current.x = centerX - xs * scaleRef.current;
      viewPosRef.current.y = centerY - ys * scaleRef.current;

      draw();
      updateOverlay(centerX, centerY);
    },
    [draw, updateOverlay, viewPosRef, scaleRef, renderCanvasRef]
  );

  const handleZoomIn = useCallback(() => {
    zoomCanvas(1.2);
  }, [zoomCanvas]);

  const handleZoomOut = useCallback(() => {
    zoomCanvas(1 / 1.2);
  }, [zoomCanvas]);

  const centerOnWorldPixel = useCallback(
    (worldX: number, worldY: number) => {
      const canvas = renderCanvasRef.current;
      if (!canvas) return;

      // Check if the target pixel is within canvas bounds
      if (
        worldX < 0 ||
        worldX >= canvasSize.width ||
        worldY < 0 ||
        worldY >= canvasSize.height
      ) {
        console.warn(
          `Target pixel (${worldX}, ${worldY}) is out of canvas bounds.`
        );
        return;
      }

      const viewportCenterX = canvas.clientWidth / 2;
      const viewportCenterY = canvas.clientHeight / 2;

      // Calculate the target view position to center the world pixel
      // (worldX + 0.5) to center on the pixel, not its top-left corner
      const targetX = viewportCenterX - (worldX + 0.5) * scaleRef.current;
      const targetY = viewportCenterY - (worldY + 0.5) * scaleRef.current;

      const startX = viewPosRef.current.x;
      const startY = viewPosRef.current.y;
      const duration = 1000; // Animation duration in ms
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic function
        const eased = 1 - Math.pow(1 - progress, 3);

        viewPosRef.current.x = startX + (targetX - startX) * eased;
        viewPosRef.current.y = startY + (targetY - startY) * eased;

        draw();

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Ensure final position is exact
          viewPosRef.current.x = targetX;
          viewPosRef.current.y = targetY;
          draw();

          // Set fixedPosRef to highlight the target pixel
          fixedPosRef.current = { x: worldX, y: worldY, color: 'transparent' }; // Use transparent or a default color
          draw(); // Redraw to show the fixedPosRef

          // Optionally, update overlay for the centered pixel
          const screenX = worldX * scaleRef.current + viewPosRef.current.x;
          const screenY = worldY * scaleRef.current + viewPosRef.current.y;
          updateOverlay(screenX, screenY);
        }
      };
      requestAnimationFrame(animate);
    },
    [draw, canvasSize, updateOverlay, viewPosRef, scaleRef, renderCanvasRef]
  );

  const handleCooltime = useCallback(() => {
    startCooldown(10);
  }, [startCooldown]);

  const handleConfirm = useCallback(() => {
    const pos = fixedPosRef.current;
    if (!pos) return;

    handleCooltime();
    previewPixelRef.current = { x: pos.x, y: pos.y, color };
    flashingPixelRef.current = { x: pos.x, y: pos.y }; // Set flashing pixel
    draw();
    sendPixel({ x: pos.x, y: pos.y, color });
    // The flashingPixelRef will now be cleared when cooldown ends, not after 1 second.
    setTimeout(() => {
      previewPixelRef.current = null;
      pos.color = 'transparent';
      draw();
    }, 1000);
  }, [color, draw, sendPixel, handleCooltime]);

  const handleSelectColor = useCallback(
    (newColor: string) => {
      if (!fixedPosRef.current) return;
      fixedPosRef.current.color = newColor;
      draw();
    },
    [draw]
  );

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
    imageCanvasRef,
    interactionCanvasRef,
    fixedPosRef,
    canvasSize,
    imageMode,
    isImageFixed,
    isDraggingImage,
    setIsDraggingImage,
    dragStart,
    setDragStart,
    isResizing,
    setIsResizing,
    resizeHandle,
    setResizeHandle,
    resizeStart,
    setResizeStart,
    imagePosition,
    setImagePosition,
    imageSize,
    setImageSize,
    draw,
    updateOverlay,
    clearOverlay,
    centerOnPixel,
    getResizeHandle,
    handleImageScale,
    setShowPalette,
    DRAG_THRESHOLD,
    handleConfirm,
  });

  // fetchCanvasData 분리
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
  }, [
    initialCanvasId,
    setCanvasId,
    setCanvasSize,
    setIsLoading,
    onLoadingChange,
    setShowCanvas,
    setHasError,
    setCanvasType,
    setEndedAt,
  ]);

  useEffect(() => {
    if (initialCanvasId && initialCanvasId !== canvas_id) {
      setCanvasId(initialCanvasId);
      console.log('Canvas ID changed:', initialCanvasId);
    }
  }, [initialCanvasId, canvas_id, setCanvasId]);

  // 투명도 상태가 변경될 때 ref 값 업데이트 및 draw 함수 호출
  useEffect(() => {
    imageTransparencyRef.current = imageTransparency;
    if (imageCanvasRef.current) {
      draw();
    }
  }, [imageTransparency, draw]);

  // Listen for targetPixel changes from chat and center the canvas
  useEffect(() => {
    if (targetPixel) {
      centerOnWorldPixel(targetPixel.x, targetPixel.y);
      // Reset targetPixel to null after processing to prevent re-triggering
      setTargetPixel(null);
    }
  }, [targetPixel, centerOnWorldPixel, setTargetPixel]);

  // Animation loop for flashing pixel
  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      draw();
      animationFrameId = requestAnimationFrame(animate);
    };

    // Start animation loop if there's a cooldown or a pixel is flashing
    if (cooldown || flashingPixelRef.current) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [cooldown, draw]);

  // Countdown timer for event canvases
  useEffect(() => {
    let timerInterval: number;

    const calculateTimeLeft = () => {
      if (canvasType === 'event' && endedAt) {
        const endDate = new Date(endedAt);
        const now = new Date();
        const difference = endDate.getTime() - now.getTime();

        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((difference / (1000 * 60)) % 60);
          const seconds = Math.floor((difference / 1000) % 60);

          setTimeLeft(
            `D-${days} ${String(hours).padStart(2, '0')}:${String(
              minutes
            ).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
          );
        } else {
          setTimeLeft('캔버스 종료');
          setIsCanvasEnded(true);
          clearInterval(timerInterval);
        }
      } else {
        setTimeLeft(null);
      }
    };

    calculateTimeLeft(); // Initial calculation
    timerInterval = setInterval(calculateTimeLeft, 1000); // Update every second

    return () => clearInterval(timerInterval);
  }, [canvasType, endedAt]);

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
          : 'none',
      }}
    >
      <StarfieldCanvas viewPosRef={viewPosRef} />
      {timeLeft && (
        <div
          className='bg-opacity-50 sm:text-md absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-black px-4 py-2 text-base font-bold text-white'
          style={{ fontFamily: '"Press Start 2P", cursive' }}
        >
          {timeLeft}
        </div>
      )}
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
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
        />
      </div>

      {isLoading ? (
        <Preloader />
      ) : (
        <CanvasUI
          colors={COLORS}
          onConfirm={handleConfirm}
          onSelectColor={handleSelectColor}
          onImageAttach={handleImageAttach}
          onImageDelete={cancelImage}
          hasImage={!!imageCanvasRef.current}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
        />
      )}
      {showImageControls && !isImageFixed && (
        <div className='pointer-events-auto fixed top-1/2 right-5 z-[10000] -translate-y-1/2'>
          <div className='max-w-xs rounded-xl border border-gray-700/50 bg-gray-900/95 p-4 shadow-2xl backdrop-blur-sm'>
            {/* 제목 */}
            <div className='mb-4 flex items-center gap-2'>
              <div className='h-3 w-3 animate-pulse rounded-full bg-blue-500'></div>
              <h3 className='text-sm font-semibold text-white'>
                이미지 편집 모드
              </h3>
            </div>

            {/* 모드 선택 */}
            <div className='mb-4'>
              <div className='flex gap-1 rounded-lg bg-gray-800 p-1'>
                <button
                  onClick={() => setImageMode(true)}
                  className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                    imageMode
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  🖼️ 이미지
                </button>
                <button
                  onClick={() => setImageMode(false)}
                  className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                    !imageMode
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  🎨 캔버스
                </button>
              </div>
            </div>

            {/* 사용법 안내 */}
            <div className='mb-4 space-y-2 text-xs text-gray-300'>
              {imageMode ? (
                <div className='rounded-lg border border-blue-500/20 bg-blue-500/10 p-3'>
                  <div className='mb-2 font-medium text-blue-300'>
                    🖼️ 이미지 모드
                  </div>
                  <div className='space-y-1'>
                    <div>• 좌클릭 드래그: 이미지 이동</div>
                    <div>• 마우스 휠: 이미지 크기 조절</div>
                    <div>• 핸들 드래그: 정밀 크기 조절</div>
                  </div>
                </div>
              ) : (
                <div className='rounded-lg border border-purple-500/20 bg-purple-500/10 p-3'>
                  <div className='mb-2 font-medium text-purple-300'>
                    🎨 캔버스 모드
                  </div>
                  <div className='space-y-1'>
                    <div>• 좌클릭 드래그: 캔버스 이동</div>
                    <div>• 마우스 휠: 캔버스 확대/축소</div>
                    <div>• 이미지는 고정된 상태</div>
                  </div>
                </div>
              )}
            </div>

            {/* 액션 버튼 */}
            <div className='flex gap-2'>
              <button
                onClick={confirmImage}
                className='flex-1 transform rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:scale-105 hover:from-green-600 hover:to-emerald-600 active:scale-95'
              >
                ✓ 확정
              </button>
              <button
                onClick={cancelImage}
                className='flex-1 transform rounded-lg bg-gradient-to-r from-red-500 to-rose-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all hover:scale-105 hover:from-red-600 hover:to-rose-600 active:scale-95'
              >
                ✕ 취소
              </button>
            </div>
            {/* 하단 안내 */}
            <div className='mt-3 border-t border-gray-700/50 pt-3 text-center text-xs text-gray-400'>
              확정하면 픽셀 그리기가 가능합니다
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PixelCanvas;
