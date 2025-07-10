import React, { useCallback, useEffect, useRef } from 'react';
import { MIN_SCALE, MAX_SCALE } from '../components/canvas/canvasConstants';
import { INITIAL_POSITION } from '../components/canvas/canvasConstants';
import { useModalStore } from '../store/modalStore';
import { useCanvasUiStore } from '../store/canvasUiStore';

interface UseCanvasInteractionProps {
  // Refs from parent
  viewPosRef: React.RefObject<{ x: number; y: number }>;
  scaleRef: React.RefObject<number>;
  imageCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  interactionCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  fixedPosRef: React.RefObject<{
    x: number;
    y: number;
    color: string;
  } | null>;

  // State and Setters from parent
  canvasSize: { width: number; height: number };
  imageMode: boolean;
  isImageFixed: boolean;
  isDraggingImage: boolean;
  setIsDraggingImage: (value: boolean) => void;
  dragStart: { x: number; y: number };
  setDragStart: (value: { x: number; y: number }) => void;
  isResizing: boolean;
  setIsResizing: (value: boolean) => void;
  resizeHandle: 'se' | 'e' | 's' | null;
  setResizeHandle: (value: 'se' | 'e' | 's' | null) => void;
  resizeStart: { x: number; y: number; width: number; height: number };
  setResizeStart: (value: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  imagePosition: { x: number; y: number };
  setImagePosition: (value: { x: number; y: number }) => void;
  imageSize: { width: number; height: number };
  setImageSize: (value: { width: number; height: number }) => void;

  // Callbacks from parent
  draw: () => void;
  updateOverlay: (screenX: number, screenY: number) => void;
  clearOverlay: () => void;
  centerOnPixel: (screenX: number, screenY: number) => void;
  getResizeHandle: (wx: number, wy: number) => 'se' | 'e' | 's' | null;
  handleImageScale: (scaleFactor: number) => void;

  // Zustand Setters
  setShowPalette: (show: boolean) => void;

  // Constants
  DRAG_THRESHOLD: number;

  handleConfirm: () => void;
}

export const useCanvasInteraction = ({
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
}: UseCanvasInteractionProps) => {
  // Refs managed within the hook
  const isPanningRef = useRef<boolean>(false);
  const startPosRef = useRef<{ x: number; y: number }>(INITIAL_POSITION);
  const dragStartInfoRef = useRef<{ x: number; y: number } | null>(null);
  const pinchDistanceRef = useRef<number>(0);
  const lastTouchPosRef = useRef<{ x: number; y: number } | null>(null);
  const { isChatOpen } = useModalStore();
  const cooldown = useCanvasUiStore((state) => state.cooldown);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const sx = e.nativeEvent.offsetX;
      const sy = e.nativeEvent.offsetY;
      const wx = (sx - viewPosRef.current.x) / scaleRef.current;
      const wy = (sy - viewPosRef.current.y) / scaleRef.current;

      if (
        imageMode &&
        !isImageFixed &&
        imageCanvasRef.current &&
        e.button === 0
      ) {
        const handle = getResizeHandle(wx, wy);

        if (handle) {
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
          setIsDraggingImage(true);
          setDragStart({ x: wx - imagePosition.x, y: wy - imagePosition.y });
          return;
        }
      }

      if (e.button === 0) {
        dragStartInfoRef.current = { x: sx, y: sy };
      }
    },
    [
      viewPosRef,
      scaleRef,
      imageMode,
      isImageFixed,
      imageCanvasRef,
      getResizeHandle,
      setIsResizing,
      setResizeHandle,
      setResizeStart,
      imageSize.width,
      imageSize.height,
      imagePosition.x,
      imagePosition.y,
      setIsDraggingImage,
      setDragStart,
    ]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { offsetX, offsetY } = e.nativeEvent;

      if (dragStartInfoRef.current && !isPanningRef.current) {
        const dx = offsetX - dragStartInfoRef.current.x;
        const dy = offsetY - dragStartInfoRef.current.y;
        if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
          isPanningRef.current = true;
          startPosRef.current = {
            x: offsetX - viewPosRef.current.x,
            y: offsetY - viewPosRef.current.y,
          };
          dragStartInfoRef.current = null;
        }
      }

      if (isResizing && resizeHandle) {
        const wx = (offsetX - viewPosRef.current.x) / scaleRef.current;
        const wy = (offsetY - viewPosRef.current.y) / scaleRef.current;

        let newWidth = imageSize.width;
        let newHeight = imageSize.height;

        if (resizeHandle === 'se') {
          newWidth = resizeStart.width + (wx - resizeStart.x);
          newHeight = resizeStart.height + (wy - resizeStart.y);
        } else if (resizeHandle === 'e') {
          newWidth = resizeStart.width + (wx - resizeStart.x);
        } else if (resizeHandle === 's') {
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
      DRAG_THRESHOLD,
      isResizing,
      resizeHandle,
      viewPosRef,
      scaleRef,
      imageSize,
      resizeStart,
      canvasSize,
      setImageSize,
      draw,
      isDraggingImage,
      isImageFixed,
      setImagePosition,
      dragStart,
      updateOverlay,
    ]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (dragStartInfoRef.current) {
        const dx = e.nativeEvent.offsetX - dragStartInfoRef.current.x;
        const dy = e.nativeEvent.offsetY - dragStartInfoRef.current.y;
        if (Math.sqrt(dx * dx + dy * dy) <= DRAG_THRESHOLD) {
          const sx = e.nativeEvent.offsetX;
          const sy = e.nativeEvent.offsetY;
          const wx = (sx - viewPosRef.current.x) / scaleRef.current;
          const wy = (sy - viewPosRef.current.y) / scaleRef.current;

          const pixelX = Math.floor(wx);
          const pixelY = Math.floor(wy);

          if (
            pixelX >= 0 &&
            pixelX < canvasSize.width &&
            pixelY >= 0 &&
            pixelY < canvasSize.height &&
            (!imageCanvasRef.current || isImageFixed)
          ) {
            fixedPosRef.current = {
              x: pixelX,
              y: pixelY,
              color: 'transparent',
            };
            setShowPalette(true);
            centerOnPixel(sx, sy);
          }
        }
      }

      isPanningRef.current = false;
      setIsDraggingImage(false);
      setIsResizing(false);
      setResizeHandle(null);
      dragStartInfoRef.current = null;
    },
    [
      DRAG_THRESHOLD,
      viewPosRef,
      scaleRef,
      canvasSize,
      imageCanvasRef,
      isImageFixed,
      fixedPosRef,
      setShowPalette,
      centerOnPixel,
      setIsDraggingImage,
      setIsResizing,
      setResizeHandle,
    ]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      handleMouseUp(e);
      clearOverlay();
      dragStartInfoRef.current = null;
    },
    [handleMouseUp, clearOverlay]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const touches = e.touches;

      if (touches.length === 2) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        pinchDistanceRef.current = Math.sqrt(dx * dx + dy * dy);
        isPanningRef.current = false;
        dragStartInfoRef.current = null;
        return;
      }

      if (touches.length === 1) {
        const touch = touches[0];
        const rect = interactionCanvasRef.current!.getBoundingClientRect();
        const sx = touch.clientX - rect.left;
        const sy = touch.clientY - rect.top;

        dragStartInfoRef.current = { x: sx, y: sy };
        lastTouchPosRef.current = { x: sx, y: sy };
      }
    },
    [interactionCanvasRef]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      const touches = e.touches;
      const rect = interactionCanvasRef.current!.getBoundingClientRect();

      if (touches.length === 2) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        const newDistance = Math.sqrt(dx * dx + dy * dy);
        const oldDistance = pinchDistanceRef.current;

        if (oldDistance > 0) {
          const scaleFactor = newDistance / oldDistance;
          const newScale = Math.max(
            MIN_SCALE,
            Math.min(MAX_SCALE, scaleRef.current * scaleFactor)
          );
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
        pinchDistanceRef.current = newDistance;
        return;
      }

      if (touches.length === 1) {
        const touch = touches[0];
        const sx = touch.clientX - rect.left;
        const sy = touch.clientY - rect.top;

        if (dragStartInfoRef.current && !isPanningRef.current) {
          const dx = sx - dragStartInfoRef.current.x;
          const dy = sy - dragStartInfoRef.current.y;
          if (Math.sqrt(dx * dx + dy * dy) > DRAG_THRESHOLD) {
            isPanningRef.current = true;
            startPosRef.current = {
              x: sx - viewPosRef.current.x,
              y: sy - viewPosRef.current.y,
            };
            dragStartInfoRef.current = null;
          }
        }

        if (isPanningRef.current) {
          viewPosRef.current = {
            x: sx - startPosRef.current.x,
            y: sy - startPosRef.current.y,
          };
          draw();
        }
        updateOverlay(sx, sy);
        lastTouchPosRef.current = { x: sx, y: sy };
      }
    },
    [
      interactionCanvasRef,
      scaleRef,
      viewPosRef,
      draw,
      updateOverlay,
      DRAG_THRESHOLD,
    ]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      pinchDistanceRef.current = 0;
      handleMouseUp({
        nativeEvent: {
          offsetX: lastTouchPosRef.current?.x || 0,
          offsetY: lastTouchPosRef.current?.y || 0,
        },
      } as React.MouseEvent<HTMLCanvasElement>);
      lastTouchPosRef.current = null;
    },
    [handleMouseUp]
  );
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fixedPosRef.current) return;

      let moved = false;
      switch (e.key) {
        case 'ArrowUp':
          fixedPosRef.current.y -= 1;
          moved = true;
          break;
        case 'ArrowDown':
          fixedPosRef.current.y += 1;
          moved = true;
          break;
        case 'ArrowLeft':
          fixedPosRef.current.x -= 1;
          moved = true;
          break;
        case 'ArrowRight':
          fixedPosRef.current.x += 1;
          moved = true;
          break;
        case 'Enter':
          if (!isChatOpen && !cooldown) {
            handleConfirm();
          }
          break;
      }

      if (moved) {
        // 캔버스 경계 체크
        if (fixedPosRef.current.x < 0) fixedPosRef.current.x = 0;
        if (fixedPosRef.current.x >= canvasSize.width)
          fixedPosRef.current.x = canvasSize.width - 1;
        if (fixedPosRef.current.y < 0) fixedPosRef.current.y = 0;
        if (fixedPosRef.current.y >= canvasSize.height)
          fixedPosRef.current.y = canvasSize.height - 1;

        draw();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [draw, handleConfirm, canvasSize, isChatOpen]);

  useEffect(() => {
    const interactionCanvas = interactionCanvasRef.current;
    if (!interactionCanvas) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { offsetX, offsetY } = e;

      if (imageMode && !isImageFixed && imageCanvasRef.current) {
        const delta = -e.deltaY;
        const scaleFactor = delta > 0 ? 1.1 : 0.9;
        handleImageScale(scaleFactor);
        return;
      }

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
  }, [
    interactionCanvasRef,
    imageMode,
    isImageFixed,
    imageCanvasRef,
    handleImageScale,
    viewPosRef,
    scaleRef,
    draw,
    updateOverlay,
  ]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
};
