import { create } from 'zustand';

type HoverPos = { x: number; y: number } | null;

interface CanvasUiState {
  color: string;
  setColor: (color: string) => void;
  hoverPos: HoverPos;
  setHoverPos: (pos: HoverPos) => void;
  cooldown: boolean;
  setCooldown: (cooldown: boolean) => void;
  timeLeft: number;
  setTimeLeft: (timeLeft: number | ((prev: number) => number)) => void;
  showPalette: boolean;
  setShowPalette: (show: boolean) => void;
  showImageControls: boolean;
  setShowImageControls: (show: boolean) => void;
  isImageFixed: boolean;
  setIsImageFixed: (fixed: boolean) => void;
  imageMode: boolean;
  setImageMode: (mode: boolean) => void;
  imageTransparency: number;
  setImageTransparency: (transparency: number) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  hasError: boolean;
  setHasError: (error: boolean) => void;
  showCanvas: boolean;
  setShowCanvas: (show: boolean) => void;
}

export const useCanvasUiStore = create<CanvasUiState>((set) => ({
  color: '#ffffff',
  setColor: (color) => set({ color }),
  hoverPos: null,
  setHoverPos: (hoverPos) => set({ hoverPos }),
  cooldown: false,
  setCooldown: (cooldown) => set({ cooldown }),
  timeLeft: 0,
  setTimeLeft: (newTimeLeft) => set((state) => ({
    timeLeft: typeof newTimeLeft === 'function' ? newTimeLeft(state.timeLeft) : newTimeLeft,
  })),
  showPalette: false,
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
}));
