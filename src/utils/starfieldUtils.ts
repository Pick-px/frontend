// utils/starfieldUtils.ts

// --- Constants ---
const MAX_STARS = 400;
const HUE = 217;
const PARALLAX_MULTIPLIER = 0.1;

// --- Helper Functions ---
function random(min: number, max?: number) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function maxOrbit(x: number, y: number) {
  const max = Math.max(x, y);
  return Math.round(Math.sqrt(max * max + max * max)) / 2;
}

// --- Star Class ---
export class Star {
  orbitRadius: number;
  radius: number;
  orbitX: number;
  orbitY: number;
  timePassed: number;
  speed: number;
  alpha: number;
  parallaxFactor: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.orbitRadius = random(maxOrbit(canvasWidth, canvasHeight));
    this.radius = random(60, this.orbitRadius) / 12;
    this.orbitX = canvasWidth / 2;
    this.orbitY = canvasHeight / 2;
    this.timePassed = random(0, MAX_STARS);
    this.speed = random(this.orbitRadius) / 400000;
    this.alpha = random(2, 10) / 10;
    this.parallaxFactor = random(2, 10) / 10;
  }

  update() {
    this.timePassed += this.speed;

    const twinkle = random(10);
    if (twinkle === 1 && this.alpha > 0) {
      this.alpha -= 0.05;
    } else if (twinkle === 2 && this.alpha < 1) {
      this.alpha += 0.05;
    }
  }

  draw(
    ctx: CanvasRenderingContext2D,
    starImage: HTMLCanvasElement,
    viewPos: { x: number; y: number }
  ) {
    const canvasX = Math.sin(this.timePassed) * this.orbitRadius + this.orbitX;
    const canvasY = Math.cos(this.timePassed) * this.orbitRadius + this.orbitY;

    const parallaxX = viewPos.x * this.parallaxFactor * PARALLAX_MULTIPLIER;
    const parallaxY = viewPos.y * this.parallaxFactor * PARALLAX_MULTIPLIER;

    ctx.globalAlpha = this.alpha;
    ctx.drawImage(
      starImage,
      canvasX - this.radius / 2 + parallaxX,
      canvasY - this.radius / 2 + parallaxY,
      this.radius,
      this.radius
    );
  }
}

// --- Factory Functions ---
export function createStars(canvasWidth: number, canvasHeight: number): Star[] {
  const stars = [];
  for (let i = 0; i < MAX_STARS; i++) {
    stars.push(new Star(canvasWidth, canvasHeight));
  }
  return stars;
}

export function createStarImage(): HTMLCanvasElement {
  const starCanvas = document.createElement('canvas');
  const ctx = starCanvas.getContext('2d')!;
  starCanvas.width = 100;
  starCanvas.height = 100;
  const half = starCanvas.width / 2;
  const gradient = ctx.createRadialGradient(half, half, 0, half, half, half);

  gradient.addColorStop(0.025, '#fff');
  gradient.addColorStop(0.1, `hsl(${HUE}, 61%, 33%)`);
  gradient.addColorStop(0.25, `hsl(${HUE}, 64%, 6%)`);
  gradient.addColorStop(1, 'transparent');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(half, half, half, 0, Math.PI * 2);
  ctx.fill();

  return starCanvas;
}
