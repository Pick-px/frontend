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
import useSound from 'use-sound';
import { useModalStore } from '../../store/modalStore';
import ImageEditorUI from '../../utils/ImageEditorUI';
import * as DrawingUtils from '../../utils/canvasDrawing';
import {
  INITIAL_POSITION,
  MIN_SCALE,
  MAX_SCALE,
  INITIAL_BACKGROUND_COLOR,
  VIEWPORT_BACKGROUND_COLOR,
  COLORS,
  CanvasType,
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

  const generateGrayscalePalette = (numColors: number) => {
    const palette = [];
    for (let i = 0; i < numColors; i++) {
      const value = Math.floor((i / (numColors - 1)) * 255);
      const hex = value.toString(16).padStart(2, '0');
      palette.push(`#${hex}${hex}${hex}`);
    }
    return palette;
  };

  const rootRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const renderCanvasRef = useRef<HTMLCanvasElement>(null);
  const interactionCanvasRef = useRef<HTMLCanvasElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null!);
  const scaleRef = useRef<number>(1);
  const viewPosRef = useRef<{ x: number; y: number }>(INITIAL_POSITION);
  const DRAG_THRESHOLD = 5;
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

  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [hasError, setHasError] = useState(false);
  const [canvasType, setCanvasType] = useState<CanvasType | null>(null);
  const [endedAt, setEndedAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [playCountDown, { stop: stopCountDown }] = useSound('/count_down.mp3', {
    volume: 0.3,
  });
  const [playClick] = useSound('/click.mp3', { volume: 0.7 });

  const filteredColors =
    canvasType === CanvasType.EVENT_COLORLIMIT
      ? generateGrayscalePalette(20)
      : COLORS;

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
  const isLoading = useCanvasUiStore((state) => state.isLoading);
  const setIsLoading = useCanvasUiStore((state) => state.setIsLoading);
  const showCanvas = useCanvasUiStore((state) => state.showCanvas);
  const setShowCanvas = useCanvasUiStore((state) => state.setShowCanvas);
  const targetPixel = useCanvasUiStore((state) => state.targetPixel);
  const setTargetPixel = useCanvasUiStore((state) => state.setTargetPixel);
  const startCooldown = useCanvasUiStore((state) => state.startCooldown);
  const { openCanvasEndedModal } = useModalStore();

  const imageCanvasRef = useRef<HTMLCanvasElement>(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
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

  const getResizeHandle = useCallback(
    (wx: number, wy: number) => {
      if (!imageCanvasRef.current || isImageFixed) return null;
      const hs = 12 / scaleRef.current;
      const right = imagePosition.x + imageSize.width;
      const bottom = imagePosition.y + imageSize.height;

      if (wx >= right - hs && wx <= right && wy >= bottom - hs && wy <= bottom)
        return 'se';
      if (
        wx >= right - hs &&
        wx <= right &&
        wy >= imagePosition.y + imageSize.height / 2 - hs / 2 &&
        wy <= imagePosition.y + imageSize.height / 2 + hs / 2
      )
        return 'e';
      if (
        wy >= bottom - hs &&
        wy <= bottom &&
        wx >= imagePosition.x + imageSize.width / 2 - hs / 2 &&
        wx <= imagePosition.x + imageSize.width / 2 + hs / 2
      )
        return 's';
      return null;
    },
    [imagePosition, imageSize, isImageFixed]
  );

  // ### DRAW FUNCTIONS START ###

  const drawBaseLayer = useCallback(() => {
    const renderCtx = renderCanvasRef.current?.getContext('2d');
    const sourceCanvas = sourceCanvasRef.current;
    if (!renderCtx || !sourceCanvas) return;

    const canvas = renderCtx.canvas;
    renderCtx.save();
    renderCtx.clearRect(0, 0, canvas.width, canvas.height);
    renderCtx.translate(viewPosRef.current.x, viewPosRef.current.y);
    renderCtx.scale(scaleRef.current, scaleRef.current);

    DrawingUtils.drawCanvasBackground(renderCtx, canvasSize, canvasType);
    renderCtx.imageSmoothingEnabled = false;
    renderCtx.drawImage(sourceCanvas, 0, 0);

    if (
      !isImageFixed &&
      imageCanvasRef.current &&
      !(imageCanvasRef.current as any)._isGroupImage
    ) {
      DrawingUtils.drawGrid(renderCtx, canvasSize);
    }

    renderCtx.restore();
  }, [canvasSize, canvasType, isImageFixed]);

  const drawImageLayer = useCallback(() => {
    const renderCtx = renderCanvasRef.current?.getContext('2d');
    const imageCanvas = imageCanvasRef.current;
    if (!renderCtx || !imageCanvas) return;

    renderCtx.save();
    renderCtx.translate(viewPosRef.current.x, viewPosRef.current.y);
    renderCtx.scale(scaleRef.current, scaleRef.current);

    DrawingUtils.drawAttachedImage(
      renderCtx,
      imageCanvas,
      imagePosition,
      imageSize,
      isImageFixed,
      imageTransparencyRef.current
    );

    renderCtx.restore();
  }, [imagePosition, imageSize, isImageFixed]);

  const drawPreviewLayer = useCallback(() => {
    const pctx = previewCanvasRef.current?.getContext('2d');
    if (!pctx) return;

    const preview = pctx.canvas;
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

    if (flashingPixelRef.current) {
      const { x, y } = flashingPixelRef.current;
      const isVisible = Math.floor(Date.now() / 500) % 2 === 0;
      if (isVisible) {
        pctx.strokeStyle = 'rgba(255, 0, 0, 0.9)';
        pctx.lineWidth = 4 / scaleRef.current;
        pctx.strokeRect(x, y, 1, 1);
      }
    }

    pctx.restore();
  }, []);

  const drawAll = useCallback(() => {
    drawBaseLayer();
    drawImageLayer();
    drawPreviewLayer();
  }, [drawBaseLayer, drawImageLayer, drawPreviewLayer]);

  // ### DRAW FUNCTIONS END ###

  const handleImageAttach = useCallback(
    (file: File) => {
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
          drawAll();
        }
      };
      img.onerror = () => {
        toast.error('이미지를 불러올 수 없습니다. 다른 이미지를 시도해주세요.');
      };
      img.src = URL.createObjectURL(file);
    },
    [canvasSize, drawAll, setIsImageFixed, setShowImageControls, setShowPalette]
  );

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
        drawAll();
      }
    },
    [imageSize, imagePosition, canvasSize, drawAll]
  );

  const confirmImage = useCallback(() => {
    setIsImageFixed(true);
    setShowImageControls(false);
    toast.success('이미지가 고정되었습니다!');
    document.dispatchEvent(
      new CustomEvent('group-image-confirmed', {
        detail: {
          x: imagePosition.x,
          y: imagePosition.y,
          width: imageSize.width,
          height: imageSize.height,
        },
      })
    );
  }, [setIsImageFixed, setShowImageControls, imagePosition, imageSize]);

  const cancelImage = useCallback(() => {
    imageCanvasRef.current = null;
    setShowImageControls(false);
    setIsImageFixed(false);
    toast.info('이미지가 제거되었습니다.');
    drawAll();
  }, [drawAll, setIsImageFixed, setShowImageControls]);

  const { sendPixel } = usePixelSocket({
    sourceCanvasRef,
    draw: drawAll,
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
    if (!isImageFixed && imageCanvasRef.current) {
      drawAll();
      return;
    }

    const viewportWidth = canvas.clientWidth;
    const viewportHeight = canvas.clientHeight;

    const scaleFactor = 0.7;
    const scaleX = (viewportWidth / canvasSize.width) * scaleFactor;
    const scaleY = (viewportHeight / canvasSize.height) * scaleFactor;
    scaleRef.current = Math.max(Math.min(scaleX, scaleY), MIN_SCALE);
    scaleRef.current = Math.min(scaleRef.current, MAX_SCALE);

    viewPosRef.current.x =
      (viewportWidth - canvasSize.width * scaleRef.current) / 2;
    viewPosRef.current.y =
      (viewportHeight - canvasSize.height * scaleRef.current) / 2;

    drawAll();
    clearOverlay();
  }, [drawAll, clearOverlay, canvasSize, isImageFixed]);

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
      )
        return;

      const targetX =
        canvas.clientWidth / 2 - (worldX + 0.5) * scaleRef.current;
      const targetY =
        canvas.clientHeight / 2 - (worldY + 0.5) * scaleRef.current;

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
        drawAll();
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
        updateOverlay(screenX, screenY);
      };
      requestAnimationFrame(animate);
    },
    [drawAll, updateOverlay, canvasSize]
  );

  const zoomCanvas = useCallback(
    (scaleChange: number) => {
      const canvas = renderCanvasRef.current;
      if (!canvas) return;
      const centerX = canvas.clientWidth / 2;
      const centerY = canvas.clientHeight / 2;
      const xs = (centerX - viewPosRef.current.x) / scaleRef.current;
      const ys = (centerY - viewPosRef.current.y) / scaleRef.current;
      scaleRef.current = Math.max(
        MIN_SCALE,
        Math.min(MAX_SCALE, scaleRef.current * scaleChange)
      );
      viewPosRef.current.x = centerX - xs * scaleRef.current;
      viewPosRef.current.y = centerY - ys * scaleRef.current;
      drawAll();
      updateOverlay(centerX, centerY);
    },
    [drawAll, updateOverlay]
  );

  const handleZoomIn = useCallback(() => zoomCanvas(1.2), [zoomCanvas]);
  const handleZoomOut = useCallback(() => zoomCanvas(1 / 1.2), [zoomCanvas]);

  const centerOnWorldPixel = useCallback(
    (worldX: number, worldY: number) => {
      const canvas = renderCanvasRef.current;
      if (
        !canvas ||
        worldX < 0 ||
        worldX >= canvasSize.width ||
        worldY < 0 ||
        worldY >= canvasSize.height
      )
        return;

      const targetX =
        canvas.clientWidth / 2 - (worldX + 0.5) * scaleRef.current;
      const targetY =
        canvas.clientHeight / 2 - (worldY + 0.5) * scaleRef.current;

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
        drawAll();
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          fixedPosRef.current = { x: worldX, y: worldY, color: 'transparent' };
          drawAll();
          const screenX = worldX * scaleRef.current + viewPosRef.current.x;
          const screenY = worldY * scaleRef.current + viewPosRef.current.y;
          updateOverlay(screenX, screenY);
        }
      };
      requestAnimationFrame(animate);
    },
    [drawAll, canvasSize, updateOverlay]
  );

  const handleCooltime = useCallback(() => startCooldown(3), [startCooldown]);

  const handleConfirm = useCallback(() => {
    const pos = fixedPosRef.current;
    if (!pos) return;
    handleCooltime();
    previewPixelRef.current = { x: pos.x, y: pos.y, color };
    flashingPixelRef.current = { x: pos.x, y: pos.y };
    drawAll();
    sendPixel({ x: pos.x, y: pos.y, color });
    setTimeout(() => {
      previewPixelRef.current = null;
      pos.color = 'transparent';
      stopCountDown();
      drawAll();
    }, 1000);
  }, [color, drawAll, sendPixel, handleCooltime, stopCountDown]);

  const handleSelectColor = useCallback(
    (newColor: string) => {
      if (!fixedPosRef.current) return;
      fixedPosRef.current.color = newColor;
      drawAll();
    },
    [drawAll]
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
    draw: drawAll,
    updateOverlay,
    clearOverlay,
    centerOnPixel,
    getResizeHandle,
    handleImageScale,
    setShowPalette,
    DRAG_THRESHOLD,
    handleConfirm,
  });

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
    }
  }, [initialCanvasId, canvas_id, setCanvasId]);

  useEffect(() => {
    const handleCanvasImageAttach = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { file, groupUpload, onConfirm } = customEvent.detail;
      if (groupUpload && file) {
        const handleGroupImageConfirmed = (confirmEvent: Event) => {
          if (onConfirm) onConfirm((confirmEvent as CustomEvent).detail);
          document.removeEventListener(
            'group-image-confirmed',
            handleGroupImageConfirmed
          );
        };
        document.addEventListener(
          'group-image-confirmed',
          handleGroupImageConfirmed
        );
      }
      handleImageAttach(file);
    };
    document.addEventListener('canvas-image-attach', handleCanvasImageAttach);
    return () =>
      document.removeEventListener(
        'canvas-image-attach',
        handleCanvasImageAttach
      );
  }, [handleImageAttach]);

  useEffect(() => {
    imageTransparencyRef.current = imageTransparency;
    if (imageCanvasRef.current) drawAll();
  }, [imageTransparency, drawAll]);

  useEffect(() => {
    if (targetPixel) {
      centerOnWorldPixel(targetPixel.x, targetPixel.y);
      setTargetPixel(null);
    }
  }, [targetPixel, centerOnWorldPixel, setTargetPixel]);

  useEffect(() => {
    const handleGroupImageReceived = (event: Event) => {
      const { url, x, y, width, height } = (event as CustomEvent).detail;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setIsImageFixed(true);
        setShowImageControls(false);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          (canvas as any)._isGroupImage = true;
          imageCanvasRef.current = canvas;
          const [numX, numY, numWidth, numHeight] = [
            Number(x),
            Number(y),
            Number(width),
            Number(height),
          ];
          setImageSize({ width: numWidth, height: numHeight });
          setImagePosition({ x: numX, y: numY });
          centerOnWorldPixel(numX + numWidth / 2, numY + numHeight / 2);
          drawAll();
        }
      };
      img.onerror = () => toast.error('이미지를 불러오는데 실패했습니다.');
      img.src = url;
    };
    document.addEventListener('group-image-received', handleGroupImageReceived);
    return () =>
      document.removeEventListener(
        'group-image-received',
        handleGroupImageReceived
      );
  }, [centerOnWorldPixel, drawAll, setIsImageFixed, setShowImageControls]);

  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      drawPreviewLayer();
      animationFrameId = requestAnimationFrame(animate);
    };
    if (cooldown || flashingPixelRef.current) {
      animationFrameId = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [cooldown, drawPreviewLayer]);

  useEffect(() => {
    let timerInterval: number;
    const calculateTimeLeft = () => {
      if (
        (canvasType === CanvasType.EVENT_COMMON ||
          canvasType === CanvasType.EVENT_COLORLIMIT) &&
        endedAt
      ) {
        const difference = new Date(endedAt).getTime() - new Date().getTime();
        if (difference > 0) {
          const days = Math.floor(difference / (1000 * 60 * 60 * 24));
          const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((difference / (1000 * 60)) % 60);
          const seconds = Math.floor((difference / 1000) % 60);
          setTimeLeft(
            `D-${days} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
          );
        } else {
          setTimeLeft('캔버스 종료');
          openCanvasEndedModal();
          clearInterval(timerInterval);
        }
      } else {
        setTimeLeft(null);
      }
    };
    calculateTimeLeft();
    timerInterval = window.setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timerInterval);
  }, [canvasType, endedAt, openCanvasEndedModal]);

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
          canvas.getContext('2d')?.scale(dpr, dpr);
        }
      });
      resetAndCenter();
    });
    observer.observe(rootElement);
    return () => observer.disconnect();
  }, [resetAndCenter]);

  if (hasError) return <NotFoundPage />;

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
          className='bg-opacity-50 text-md absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-lg bg-transparent px-4 py-2 font-bold text-white'
          style={{ fontFamily: '"Press Start 2P", cursive' }}
        >
          {canvasType === CanvasType.EVENT_COLORLIMIT && (
            <p className='sm:text-md mr-2 text-lg text-gray-400'>BLACK&WHITE</p>
          )}
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
        className={`transition-all duration-1000 ease-out ${showCanvas ? 'scale-100 transform opacity-100' : 'scale-50 transform opacity-0'}`}
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
        <CanvasUI
          colors={filteredColors}
          onConfirm={handleConfirm}
          onSelectColor={handleSelectColor}
          onImageAttach={handleImageAttach}
          onImageDelete={cancelImage}
          hasImage={!!imageCanvasRef.current}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          canvasType={canvasType!}
        />
      )}
      {showImageControls && !isImageFixed && (
        <ImageEditorUI
          imageMode={imageMode}
          setImageMode={setImageMode}
          onConfirm={confirmImage}
          onCancel={cancelImage}
        />
      )}
    </div>
  );
}

export default PixelCanvas;
