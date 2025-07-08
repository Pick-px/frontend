import React from 'react';
import { useMediaQuery } from 'react-responsive';
import CanvasUIPC from './CanvasUIPC';
import CanvasUIMobile from './CanvasUIMobile';

type CanvasUIProps = {
  onConfirm: () => void;
  onSelectColor: (color: string) => void;
  onImageAttach: (file: File) => void;
  onImageDelete: () => void;
  hasImage: boolean;
  colors: string[];
  onZoomIn: () => void;
  onZoomOut: () => void;
};

export default function CanvasUI(props: CanvasUIProps) {
  const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 480px)' });

  return isDesktopOrLaptop ? (
    <CanvasUIPC {...props} />
  ) : (
    <CanvasUIMobile {...props} />
  );
}
