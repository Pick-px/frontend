import { CanvasType } from '../components/canvas/canvasConstants';

/**
 * 캔버스 경계선과 배경을 그립니다.
 */
export function drawCanvasBackground(
  ctx: CanvasRenderingContext2D,
  canvasSize: { width: number; height: number },
  canvasType: CanvasType | null
) {
  ctx.fillStyle = '#111827';
  ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

  const gradient = ctx.createLinearGradient(
    0,
    0,
    canvasSize.width,
    canvasSize.height
  );

  if (canvasType === CanvasType.EVENT_COLORLIMIT) {
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
    gradient.addColorStop(0.25, 'rgba(50, 50, 50, 0.8)');
    gradient.addColorStop(0.5, 'rgba(100, 100, 100, 0.8)');
    gradient.addColorStop(0.75, 'rgba(150, 150, 150, 0.8)');
    gradient.addColorStop(1, 'rgba(200, 200, 200, 0.8)');
  } else {
    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.8)');
    gradient.addColorStop(0.25, 'rgba(59, 130, 246, 0.8)');
    gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.8)');
    gradient.addColorStop(0.75, 'rgba(236, 72, 153, 0.8)');
    gradient.addColorStop(1, 'rgba(34, 197, 94, 0.8)');
  }

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 3 / ctx.getTransform().a;
  ctx.strokeRect(-1, -1, canvasSize.width + 2, canvasSize.height + 2);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1 / ctx.getTransform().a;
  ctx.strokeRect(0, 0, canvasSize.width, canvasSize.height);
}

/**
 * 편집 모드에서 격자무늬를 그립니다.
 */
export function drawGrid(
  ctx: CanvasRenderingContext2D,
  canvasSize: { width: number; height: number }
) {
  ctx.strokeStyle = 'rgba(255,255,255, 0.12)';
  ctx.lineWidth = 1 / ctx.getTransform().a;
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

/**
 * 첨부된 이미지와 리사이즈 핸들을 그립니다.
 */
export function drawAttachedImage(
  ctx: CanvasRenderingContext2D,
  imageCanvas: HTMLCanvasElement,
  position: { x: number; y: number },
  size: { width: number; height: number },
  isFixed: boolean,
  transparency: number
) {
  try {
    ctx.globalAlpha = transparency;
    ctx.imageSmoothingEnabled = false;

    if (!isFixed && !(imageCanvas as any)._isGroupImage) {
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
      ctx.lineWidth = 2 / ctx.getTransform().a;
      ctx.strokeRect(
        position.x - 1,
        position.y - 1,
        size.width + 2,
        size.height + 2
      );
    }

    ctx.drawImage(imageCanvas, position.x, position.y, size.width, size.height);

    ctx.globalAlpha = 1.0;

    if (!isFixed) {
      const scale = ctx.getTransform().a;
      const hs = 10 / scale;

      ctx.fillStyle = 'rgba(0, 191, 255, 0.95)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 2 / scale;

      // 우하단 핸들
      ctx.beginPath();
      ctx.rect(
        position.x + size.width - hs,
        position.y + size.height - hs,
        hs,
        hs
      );
      ctx.fill();
      ctx.stroke();

      // 우측 핸들
      ctx.beginPath();
      ctx.rect(
        position.x + size.width - hs,
        position.y + size.height / 2 - hs / 2,
        hs,
        hs
      );
      ctx.fill();
      ctx.stroke();

      // 하단 핸들
      ctx.beginPath();
      ctx.rect(
        position.x + size.width / 2 - hs / 2,
        position.y + size.height - hs,
        hs,
        hs
      );
      ctx.fill();
      ctx.stroke();
    }
  } catch (error) {
    console.error('이미지 그리기 실패:', error);
  }
}
