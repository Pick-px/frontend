import { create } from 'zustand';

type HoverPos = { x: number; y: number } | null;

interface CanvasUiState {
  // 선택 색상 상태
  color: string;
  setColor: (color: string) => void;
  // 캔버스 내 좌표 값
  hoverPos: HoverPos;
  setHoverPos: (pos: HoverPos) => void;
  // 채팅에서 클릭된 좌표
  targetPixel: { x: number; y: number } | null;
  setTargetPixel: (pos: { x: number; y: number } | null) => void;
  // 잔여 쿨다운 시간
  timeLeft: number;
  setTimeLeft: (timeLeft: number | ((prev: number) => number)) => void;
  // 색상 선택 팔레트
  showPalette: boolean;
  setShowPalette: (show: boolean) => void;
  // 이미지 Overlay Guide
  showImageControls: boolean;
  setShowImageControls: (show: boolean) => void;
  isImageFixed: boolean;
  setIsImageFixed: (fixed: boolean) => void;
  imageMode: boolean;
  setImageMode: (mode: boolean) => void;
  imageTransparency: number;
  setImageTransparency: (transparency: number) => void;
  // Loading 중, error 발생 확인
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  hasError: boolean;
  setHasError: (error: boolean) => void;
  showCanvas: boolean;
  setShowCanvas: (show: boolean) => void;
  // CoolDown
  cooldown: boolean;
  setCooldown: (cooldown: boolean) => void;
  startCooldown: (seconds: number) => void;
  clearSelectedPixel: () => void;
}

export const useCanvasUiStore = create<CanvasUiState>((set, get) => ({
  color: '#ffffff',
  setColor: (color) => set({ color }),
  hoverPos: null,
  setHoverPos: (hoverPos) => set({ hoverPos }),

  targetPixel: null,
  setTargetPixel: (targetPixel) => set({ targetPixel }),

  timeLeft: 0,
  setTimeLeft: (newTimeLeft) =>
    set((state) => ({
      timeLeft:
        typeof newTimeLeft === 'function'
          ? newTimeLeft(state.timeLeft)
          : newTimeLeft,
    })),
  showPalette: true,
  setShowPalette: (showPalette) => set({ showPalette }),
  showImageControls: false,
  setShowImageControls: (showImageControls) => set({ showImageControls }),
  isImageFixed: false,
  setIsImageFixed: (isImageFixed) => set({ isImageFixed }),
  imageMode: true,
  setImageMode: (imageMode) => set({ imageMode }),
  imageTransparency: 0.5,
  setImageTransparency: (imageTransparency) => set({ imageTransparency }),
  isLoading: true,
  setIsLoading: (isLoading) => set({ isLoading }),
  hasError: false,
  setHasError: (hasError) => set({ hasError }),
  showCanvas: false,
  setShowCanvas: (showCanvas) => set({ showCanvas }),
  cooldown: false,
  setCooldown: (cooldown) => set({ cooldown }),
  startCooldown: (seconds: number) => {
    if (get().cooldown) return;

    set({ cooldown: true, timeLeft: seconds });

    const timer = setInterval(() => {
      const newTimeLeft = get().timeLeft - 1;
      if (newTimeLeft <= 0) {
        clearInterval(timer);
        set({ cooldown: false, timeLeft: 0 });
      } else {
        set({ timeLeft: newTimeLeft });
      }
    }, 1000);
  },
  clearSelectedPixel: () => set({ showPalette: false }),
}));
