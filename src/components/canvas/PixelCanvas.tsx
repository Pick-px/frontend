import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useCanvasUiStore } from '../../store/canvasUiStore';
import { shallow } from 'zustand/shallow';
import { usePixelSocket } from '../SocketIntegration';
import CanvasUI from './CanvasUI';
import Preloader from '../Preloader';
import { useCanvasStore } from '../../store/canvasStore';
import { toast } from 'react-toastify';
import { fetchCanvasData as fetchCanvasDataUtil } from '../../api/canvasFetch';

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
  const { canvas_id, setCanvasId } = useCanvasStore();

  useEffect(() => {
    if (initialCanvasId && initialCanvasId !== canvas_id) {
      setCanvasId(initialCanvasId);
    }
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

  const pinchDistanceRef = useRef<number>(0);

  const fixedPosRef = useRef<{ x: number; y: number; color: string } | null>(
    null
  );
  const previewPixelRef = useRef<{
    x: number;
    y: number;
    color: string;
  } | null>(null);

  // state를 각각 가져오도록 하여 불필요한 리렌더링을 방지합니다.
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const color = useCanvasUiStore((state) => state.color);
  const setColor = useCanvasUiStore((state) => state.setColor);
  const hoverPos = useCanvasUiStore((state) => state.hoverPos);
  const setHoverPos = useCanvasUiStore((state) => state.setHoverPos);
  const cooldown = useCanvasUiStore((state) => state.cooldown);
  const setCooldown = useCanvasUiStore((state) => state.setCooldown);
  const timeLeft = useCanvasUiStore((state) => state.timeLeft);
  const setTimeLeft = useCanvasUiStore((state) => state.setTimeLeft);
  const showPalette = useCanvasUiStore((state) => state.showPalette);
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
  const hasError = useCanvasUiStore((state) => state.hasError);
  const setHasError = useCanvasUiStore((state) => state.setHasError);
  const showCanvas = useCanvasUiStore((state) => state.showCanvas);
  const setShowCanvas = useCanvasUiStore((state) => state.setShowCanvas);

  const startCooldown = useCanvasUiStore((state) => state.startCooldown);

  const imageTransparencyRef = useRef(0.5);

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
    [imagePosition, imageSize, isImageFixed]
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
  }, [canvasSize, imagePosition, imageSize, isImageFixed]);

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
    [canvasSize, draw]
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
  }, []);

  // 이미지 취소
  const cancelImage = useCallback(() => {
    imageCanvasRef.current = null;
    setShowImageControls(false);
    setIsImageFixed(false);
    toast.info('이미지가 제거되었습니다.');
    draw();
  }, [draw]);

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
    [canvasSize]
  );

  const clearOverlay = useCallback(() => {
    setHoverPos(null);
    const overlayCanvas = interactionCanvasRef.current;
    if (!overlayCanvas) return;
    const overlayCtx = overlayCanvas.getContext('2d');
    overlayCtx?.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
  }, []);

  const resetAndCenter = useCallback(() => {
    const canvas = renderCanvasRef.current;
    if (!canvas || canvas.clientWidth === 0 || canvasSize.width === 0) return;

    // 화면 크기에 맞게 스케일 계산
    const viewportWidth = canvas.clientWidth;
    const viewportHeight = canvas.clientHeight;

    // 모바일 환경 감지 (화면 너비가 768px 미만)
    const isMobile = window.innerWidth < 768;

    // 모바일에서는 매우 작은 배율 강제 적용
    if (isMobile) {
      // 1024x1024 캔버스를 위한 특별 처리
      if (canvasSize.width >= 1000 || canvasSize.height >= 1000) {
        // 모바일에서 큰 캔버스는 매우 작게 시작 (0.15)
        scaleRef.current = 0.2;
      } else {
        // 작은 캔버스는 0.3 정도로 시작
        scaleRef.current = 0.7;
      }
    } else {
      // 데스크톱에서는 기존 로직 유지
      const scaleFactor = 0.7;
      const scaleX = (viewportWidth / canvasSize.width) * scaleFactor;
      const scaleY = (viewportHeight / canvasSize.height) * scaleFactor;
      scaleRef.current = Math.max(Math.min(scaleX, scaleY), MIN_SCALE);
      scaleRef.current = Math.min(scaleRef.current, MAX_SCALE);
    }

    // 캔버스를 화면 중앙에 배치
    viewPosRef.current.x =
      (viewportWidth - canvasSize.width * scaleRef.current) / 2;
    viewPosRef.current.y =
      (viewportHeight - canvasSize.height * scaleRef.current) / 2;

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

  const handleCooltime = useCallback(() => {
    startCooldown(10);
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

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const sx = e.nativeEvent.offsetX;
      const sy = e.nativeEvent.offsetY;
      const wx = (sx - viewPosRef.current.x) / scaleRef.current;
      const wy = (sy - viewPosRef.current.y) / scaleRef.current;

      // 이미지 모드에서 리사이즈 핸들 또는 이미지 영역 클릭 감지
      if (
        imageMode &&
        !isImageFixed &&
        imageCanvasRef.current &&
        e.button === 0
      ) {
        const handle = getResizeHandle(wx, wy);

        if (handle) {
          // 리사이즈 핸들 클릭
          setIsResizing(true);
          setResizeHandle(handle);
          setResizeStart({
            x: wx,
            y: wy,
            width: imageSize.width,
            height: imageSize.height,
          });
          return;
        } else if (
          wx >= imagePosition.x &&
          wx <= imagePosition.x + imageSize.width &&
          wy >= imagePosition.y &&
          wy <= imagePosition.y + imageSize.height
        ) {
          // 이미지 드래그
          setIsDraggingImage(true);
          setDragStart({ x: wx - imagePosition.x, y: wy - imagePosition.y });
          return;
        }
      }

      // 우클릭 드래그 (이미지가 없거나 캔버스 모드이거나 이미지 확정 후)
      if (e.button === 2) {
        e.preventDefault();
        if (!imageCanvasRef.current || !imageMode || isImageFixed) {
          isPanningRef.current = true;
          startPosRef.current = {
            x: e.nativeEvent.offsetX - viewPosRef.current.x,
            y: e.nativeEvent.offsetY - viewPosRef.current.y,
          };
        }
        return;
      }

      // 좌클릭 픽셀 선택 (이미지가 없거나 이미지 확정 후)
      if (e.button === 0 && (!imageCanvasRef.current || isImageFixed)) {
        const pixelX = Math.floor(wx);
        const pixelY = Math.floor(wy);
        if (
          pixelX >= 0 &&
          pixelX < canvasSize.width &&
          pixelY >= 0 &&
          pixelY < canvasSize.height
        ) {
          fixedPosRef.current = { x: pixelX, y: pixelY, color: 'transparent' };
          setShowPalette(true);
          centerOnPixel(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        }
      }
    },
    [
      centerOnPixel,
      canvasSize,
      imageMode,
      isImageFixed,
      imagePosition,
      imageSize,
      getResizeHandle,
      setIsResizing,
      setResizeHandle,
      setResizeStart,
      setIsDraggingImage,
      setDragStart,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { offsetX, offsetY } = e.nativeEvent;

      // 이미지 리사이즈 중
      if (isResizing && resizeHandle) {
        const wx = (offsetX - viewPosRef.current.x) / scaleRef.current;
        const wy = (offsetY - viewPosRef.current.y) / scaleRef.current;

        let newWidth = imageSize.width;
        let newHeight = imageSize.height;

        if (resizeHandle === 'se') {
          // 대각선 리사이즈
          newWidth = resizeStart.width + (wx - resizeStart.x);
          newHeight = resizeStart.height + (wy - resizeStart.y);
        } else if (resizeHandle === 'e') {
          // 가로만 리사이즈
          newWidth = resizeStart.width + (wx - resizeStart.x);
        } else if (resizeHandle === 's') {
          // 세로만 리사이즈
          newHeight = resizeStart.height + (wy - resizeStart.y);
        }

        if (
          newWidth > 10 &&
          newHeight > 10 &&
          newWidth < canvasSize.width * 2 &&
          newHeight < canvasSize.height * 2
        ) {
          setImageSize({ width: newWidth, height: newHeight });
          draw();
        }
        return;
      }

      // 이미지 드래그 중
      if (isDraggingImage && !isImageFixed) {
        const wx = (offsetX - viewPosRef.current.x) / scaleRef.current;
        const wy = (offsetY - viewPosRef.current.y) / scaleRef.current;
        setImagePosition({
          x: wx - dragStart.x,
          y: wy - dragStart.y,
        });
        draw();
        return;
      }

      // 캔버스 팬닝 중
      if (isPanningRef.current) {
        viewPosRef.current = {
          x: offsetX - startPosRef.current.x,
          y: offsetY - startPosRef.current.y,
        };
        draw();
      }
      updateOverlay(offsetX, offsetY);
    },
    [
      draw,
      updateOverlay,
      isDraggingImage,
      isImageFixed,
      dragStart,
      isResizing,
      resizeHandle,
      resizeStart,
      imageSize,
      canvasSize,
      setImagePosition,
      setImageSize,
    ]
  );

  const handleMouseUp = useCallback(() => {
    isPanningRef.current = false;
    setIsDraggingImage(false);
    setIsResizing(false);
    setResizeHandle(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    handleMouseUp();
    clearOverlay();
  }, [handleMouseUp, clearOverlay]);

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
    });
  }, [
    initialCanvasId,
    setCanvasId,
    setCanvasSize,
    setIsLoading,
    setHasError,
    onLoadingChange,
    setShowCanvas,
  ]);

  // 투명도 상태가 변경될 때 ref 값만 업데이트하고 draw 함수 직접 호출
  const handleTransparencyChange = useCallback(
    (value: number) => {
      imageTransparencyRef.current = value;
      setImageTransparency(value);
      // 투명도가 변경되면 즉시 화면에 반영 (draw 함수 직접 호출)
      if (imageCanvasRef.current) {
        draw();
      }
    },
    [draw, setImageTransparency]
  );

  // PixelCanvas.tsx 내부에 아래 함수들을 추가합니다.

  // --- 터치 이벤트 핸들러 ---
  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const touches = e.touches;

      // 두 손가락 터치: 핀치 줌 시작
      if (touches.length === 2) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        pinchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
        isPanningRef.current = false; // 줌 할때는 패닝 방지
        return;
      }

      // 한 손가락 터치: 이동 또는 픽셀 선택 시작
      if (touches.length === 1) {
        const touch = touches[0];
        const rect = interactionCanvasRef.current!.getBoundingClientRect();
        const sx = touch.clientX - rect.left;
        const sy = touch.clientY - rect.top;

        // 마우스 이벤트와 동일한 로직을 수행하기 위해 MouseEvent처럼 모방하여 전달
        handleMouseDown({
          nativeEvent: { offsetX: sx, offsetY: sy, button: 0 },
          preventDefault: () => {},
        } as React.MouseEvent<HTMLCanvasElement>);
      }
    },
    [handleMouseDown]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const touches = e.touches;
      const rect = interactionCanvasRef.current!.getBoundingClientRect();

      // 두 손가락 터치: 핀치 줌 로직
      if (touches.length === 2) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        const newDistance = Math.sqrt(dx * dx + dy * dy);
        const oldDistance = pinchDistanceRef.current;

        if (oldDistance > 0) {
          const scaleFactor = newDistance / oldDistance;
          // handleImageScale 또는 캔버스 줌 로직을 여기에 적용
          // 이 예제에서는 캔버스 줌을 적용합니다.

          const newScale = Math.max(
            MIN_SCALE,
            Math.min(MAX_SCALE, scaleRef.current * scaleFactor)
          );
          // (중요) 줌 중심점을 두 손가락의 중심으로 설정
          const centerX =
            (touches[0].clientX + touches[1].clientX) / 2 - rect.left;
          const centerY =
            (touches[0].clientY + touches[1].clientY) / 2 - rect.top;

          const xs = (centerX - viewPosRef.current.x) / scaleRef.current;
          const ys = (centerY - viewPosRef.current.y) / scaleRef.current;

          viewPosRef.current.x = centerX - xs * newScale;
          viewPosRef.current.y = centerY - ys * newScale;
          scaleRef.current = newScale;

          draw();
          updateOverlay(centerX, centerY);
        }
        pinchDistanceRef.current = newDistance; // 다음 move 이벤트를 위해 거리 업데이트
        return;
      }

      // 한 손가락 터치: 이동 로직
      if (touches.length === 1) {
        const touch = touches[0];
        const sx = touch.clientX - rect.left;
        const sy = touch.clientY - rect.top;

        handleMouseMove({
          nativeEvent: { offsetX: sx, offsetY: sy },
        } as React.MouseEvent<HTMLCanvasElement>);
      }
    },
    [handleMouseMove, draw, updateOverlay]
  );

  const handleTouchEnd = useCallback(() => {
    // 모든 제스처 상태 초기화
    pinchDistanceRef.current = 0;
    handleMouseUp();
  }, [handleMouseUp]);
  // 투명도 상태가 변경될 때 ref 값 업데이트 및 draw 함수 호출
  useEffect(() => {
    imageTransparencyRef.current = imageTransparency;
    if (imageCanvasRef.current) {
      draw();
    }
  }, [imageTransparency, draw]);

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

      // 이미지 모드에서 이미지만 확대축소
      if (imageMode && !isImageFixed && imageCanvasRef.current) {
        const delta = -e.deltaY;
        const scaleFactor = delta > 0 ? 1.1 : 0.9;
        handleImageScale(scaleFactor);
        return;
      }

      // 캔버스 모드 또는 이미지 확정 후 전체 확대축소
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
  }, [draw, updateOverlay, handleImageScale, imageMode, isImageFixed]);

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
                    <div>• 우클릭 드래그: 캔버스 이동</div>
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
