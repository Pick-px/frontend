import '@testing-library/jest-dom';
import { vi } from 'vitest';

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserver;

// Mock HTMLCanvasElement.prototype.getContext
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  drawImage: vi.fn(),
  putImageData: vi.fn(),
  getImageData: vi.fn(() => ({ data: [] })),
  setTransform: vi.fn(),
  strokeRect: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  fillText: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
  closePath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  bezierCurveTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  scale: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  save: vi.fn(),
  restore: vi.fn(),
  createLinearGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  createRadialGradient: vi.fn(() => ({
    addColorStop: vi.fn(),
  })),
  createPattern: vi.fn(),
  addColorStop: vi.fn(),
  clip: vi.fn(),
  resetTransform: vi.fn(),
  getLineDash: vi.fn(() => []),
  setLineDash: vi.fn(),
  strokeText: vi.fn(),
  createImageData: vi.fn(() => ({ data: [] })),
  getTransform: vi.fn(() => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })),
  drawFocusIfNeeded: vi.fn(),
  ellipse: vi.fn(),
  roundRect: vi.fn(),
  reset: vi.fn(),
  isPointInPath: vi.fn(),
  isPointInStroke: vi.fn(),
  direction: 'ltr',
  font: '',
  textAlign: 'start',
  textBaseline: 'alphabetic',
  lineCap: 'butt',
  lineJoin: 'miter',
  lineWidth: 1,
  miterLimit: 10,
  shadowBlur: 0,
  shadowColor: 'rgba(0, 0, 0, 0)',
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  globalAlpha: 1,
  globalCompositeOperation: 'source-over',
  imageSmoothingEnabled: true,
  imageSmoothingQuality: 'low',
  filter: 'none',
  fillStyle: '#000',
  strokeStyle: '#000',
  lineDashOffset: 0,
  fontKerning: 'auto',
  fontStretch: 'normal',
  fontVariantCaps: 'normal',
  letterSpacing: '0px',
  wordSpacing: '0px',
})) as unknown as CanvasRenderingContext2D;