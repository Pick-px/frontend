import React, { useEffect } from 'react';
import { useMediaQuery } from 'react-responsive';
import useSound from 'use-sound';
import CanvasUIPC from './CanvasUIPC';
import CanvasUIMobile from './CanvasUIMobile';
import { useBgmStore } from '../../store/bgmStore';
import { CanvasType } from './canvasConstants';

type CanvasUIProps = {
  onConfirm: () => void;
  onSelectColor: (color: string) => void;
  onImageAttach: (file: File) => void;
  onImageDelete: () => void;
  hasImage: boolean;
  colors: string[];
  onZoomIn: () => void;
  onZoomOut: () => void;
  canvasType: CanvasType;
};

export default function CanvasUI(props: CanvasUIProps) {
  const { canvasType } = props;
  const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 480px)' });
  const { isPlaying, setIsPlaying } = useBgmStore();
  const bgmFile =
    canvasType === CanvasType.EVENT_COMMON || CanvasType.EVENT_COLORLIMIT
      ? '/event_bgm.mp3'
      : '/main_bgm.mp3';
  const [play, { stop }] = useSound(bgmFile, { loop: true, volume: 0.1 });

  useEffect(() => {
    if (isPlaying) {
      play();
    } else {
      stop();
    }
    return () => {
      stop();
    };
  }, [isPlaying, play, stop]);

  const toggleBgm = () => {
    setIsPlaying(!isPlaying);
  };

  return isDesktopOrLaptop ? (
    <CanvasUIPC
      {...props}
      isBgmPlaying={isPlaying}
      toggleBgm={toggleBgm}
      canvasType={canvasType}
    />
  ) : (
    <CanvasUIMobile
      {...props}
      isBgmPlaying={isPlaying}
      toggleBgm={toggleBgm}
      canvasType={canvasType}
    />
  );
}
