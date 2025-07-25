import React, { useRef, useEffect } from 'react';
import '../canvas/StarfieldCanvas.css';

type StarfieldCanvasProps = {
  viewPosRef: React.RefObject<{ x: number; y: number }>;
};

const StarfieldCanvas = ({ viewPosRef }: StarfieldCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const hue = 217;
    const stars: any[] = [];
    let count = 0;
    const maxStars = 400; // Reduced for a sparser effect

    const canvas2 = document.createElement('canvas');
    const ctx2 = canvas2.getContext('2d');
    canvas2.width = 100;
    canvas2.height = 100;
    const half = canvas2.width / 2;
    const gradient2 = ctx2!.createRadialGradient(
      half,
      half,
      0,
      half,
      half,
      half
    );
    gradient2.addColorStop(0.025, '#fff');
    gradient2.addColorStop(0.1, `hsl(${hue}, 61%, 33%)`);
    gradient2.addColorStop(0.25, `hsl(${hue}, 64%, 6%)`);
    gradient2.addColorStop(1, 'transparent');

    ctx2!.fillStyle = gradient2;
    ctx2!.beginPath();
    ctx2!.arc(half, half, half, 0, Math.PI * 2);
    ctx2!.fill();

    function random(min: number, max?: number) {
      if (max === undefined) {
        max = min;
        min = 0;
      }
      if (min > max) {
        [min, max] = [max, min];
      }
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function maxOrbit(x: number, y: number) {
      const max = Math.max(x, y);
      const diameter = Math.round(Math.sqrt(max * max + max * max));
      return diameter / 2;
    }

    class Star {
      orbitRadius: number;
      radius: number;
      orbitX: number;
      orbitY: number;
      timePassed: number;
      speed: number;
      alpha: number;
      parallaxFactor: number; // New: for parallax effect

      constructor() {
        this.orbitRadius = random(maxOrbit(w, h));
        this.radius = random(60, this.orbitRadius) / 12;
        this.orbitX = w / 2;
        this.orbitY = h / 2;
        this.timePassed = random(0, maxStars);
        this.speed = random(this.orbitRadius) / 50000;
        this.alpha = random(2, 10) / 10;
        this.parallaxFactor = random(2, 10) / 10; // Assign a random parallax factor
        count++;
        stars[count] = this;
      }

      draw() {
        const canvasX =
          Math.sin(this.timePassed) * this.orbitRadius + this.orbitX;
        const canvasY =
          Math.cos(this.timePassed) * this.orbitRadius + this.orbitY;
        const twinkle = random(10);

        if (twinkle === 1 && this.alpha > 0) {
          this.alpha -= 0.05;
        } else if (twinkle === 2 && this.alpha < 1) {
          this.alpha += 0.05;
        }

        // Calculate parallax offset
        const parallaxX = viewPosRef.current
          ? viewPosRef.current.x * this.parallaxFactor * 0.1 // Adjust multiplier for desired effect
          : 0;
        const parallaxY = viewPosRef.current
          ? viewPosRef.current.y * this.parallaxFactor * 0.1 // Adjust multiplier for desired effect
          : 0;

        ctx!.globalAlpha = this.alpha;
        ctx!.drawImage(
          canvas2,
          canvasX - this.radius / 2 + parallaxX,
          canvasY - this.radius / 2 + parallaxY,
          this.radius,
          this.radius
        );
        this.timePassed += this.speed;
      }
    }

    for (let i = 0; i < maxStars; i++) {
      new Star();
    }

    const animation = () => {
      ctx!.globalCompositeOperation = 'source-over';
      ctx!.globalAlpha = 0.8;
      ctx!.fillStyle = 'black'; // Solid black background
      ctx!.fillRect(0, 0, w, h);

      ctx!.globalCompositeOperation = 'lighter';
      for (let i = 1, l = stars.length; i < l; i++) {
        stars[i].draw();
      }

      animationFrameIdRef.current = window.requestAnimationFrame(animation);
    };

    animation();

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animationFrameIdRef.current) {
        window.cancelAnimationFrame(animationFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [viewPosRef]); // Add viewPosRef to dependency array

  return <canvas ref={canvasRef} id='starfield-canvas' />;
};

export default StarfieldCanvas;
