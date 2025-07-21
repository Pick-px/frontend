// starfield.worker.ts

interface Star {
  orbitRadius: number;
  radius: number;
  orbitX: number;
  orbitY: number;
  timePassed: number;
  speed: number;
  alpha: number;
  parallaxFactor: number;
}

interface WorkerMessage {
  type: 'init' | 'update' | 'resize';
  canvasWidth?: number;
  canvasHeight?: number;
  viewPos?: { x: number; y: number };
  maxStars?: number;
}

let stars: Star[] = [];
let canvasWidth = 0;
let canvasHeight = 0;
let maxStars = 400;

function random(min: number, max?: number): number {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  if (min > max) {
    [min, max] = [max, min];
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function maxOrbit(x: number, y: number): number {
  const max = Math.max(x, y);
  return Math.round(Math.sqrt(max * max + max * max)) / 2;
}

function createStar(): Star {
  return {
    orbitRadius: random(maxOrbit(canvasWidth, canvasHeight)),
    radius: random(60, maxOrbit(canvasWidth, canvasHeight)) / 12,
    orbitX: canvasWidth / 2,
    orbitY: canvasHeight / 2,
    timePassed: random(0, maxStars),
    speed: random(maxOrbit(canvasWidth, canvasHeight)) / 400000,
    alpha: random(2, 10) / 10,
    parallaxFactor: random(2, 10) / 10,
  };
}

function updateStars(): Star[] {
  return stars.map((star) => {
    // 별 위치 업데이트
    star.timePassed += star.speed;

    // 깜빡임 효과
    const twinkle = random(10);
    if (twinkle === 1 && star.alpha > 0) {
      star.alpha -= 0.05;
    } else if (twinkle === 2 && star.alpha < 1) {
      star.alpha += 0.05;
    }

    return star;
  });
}

function getStarPositions(viewPos: { x: number; y: number }): Array<{
  x: number;
  y: number;
  radius: number;
  alpha: number;
}> {
  return stars.map((star) => {
    const canvasX = Math.sin(star.timePassed) * star.orbitRadius + star.orbitX;
    const canvasY = Math.cos(star.timePassed) * star.orbitRadius + star.orbitY;

    const parallaxX = viewPos.x * star.parallaxFactor * 0.1;
    const parallaxY = viewPos.y * star.parallaxFactor * 0.1;

    return {
      x: canvasX + parallaxX,
      y: canvasY + parallaxY,
      radius: star.radius,
      alpha: star.alpha,
    };
  });
}

// Worker 메시지 처리
self.onmessage = (e: MessageEvent<WorkerMessage>) => {
  const {
    type,
    canvasWidth: width,
    canvasHeight: height,
    viewPos,
    maxStars: starsCount,
  } = e.data;

  switch (type) {
    case 'init':
      if (width && height) {
        canvasWidth = width;
        canvasHeight = height;
        maxStars = starsCount || 400;

        // 별들 초기화
        stars = [];
        for (let i = 0; i < maxStars; i++) {
          stars.push(createStar());
        }

        self.postMessage({
          type: 'initialized',
          starCount: stars.length,
        });
      }
      break;

    case 'update':
      if (viewPos) {
        // 별들 업데이트
        updateStars();

        // 위치 정보 전송
        const positions = getStarPositions(viewPos);
        self.postMessage({
          type: 'positions',
          positions,
        });
      }
      break;

    case 'resize':
      if (width && height) {
        canvasWidth = width;
        canvasHeight = height;

        // 별들 재생성
        stars = [];
        for (let i = 0; i < maxStars; i++) {
          stars.push(createStar());
        }

        self.postMessage({
          type: 'resized',
          starCount: stars.length,
        });
      }
      break;
  }
};

// Worker 시작 알림
self.postMessage({ type: 'worker_ready' });
