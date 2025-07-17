import React, { useEffect, useRef } from 'react';

interface LifeIndicatorProps {
  lives: number;
  maxLives: number;
  isLifeDecreasing: boolean;
}

const LifeIndicator: React.FC<LifeIndicatorProps> = ({ lives, maxLives, isLifeDecreasing }) => {
  const heartRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (isLifeDecreasing && heartRefs.current[lives]) {
      // 생명이 차감될 때 애니메이션 적용
      const lostHeart = heartRefs.current[lives];
      if (lostHeart) {
        // 하트 깨지는 애니메이션
        lostHeart.animate(
          [
            { transform: 'scale(1)', opacity: 1 },
            { transform: 'scale(1.5)', opacity: 0.8 },
            { transform: 'scale(0.5) rotate(10deg)', opacity: 0 }
          ],
          { duration: 800, easing: 'ease-out', fill: 'forwards' }
        );
      }
    }
  }, [lives, isLifeDecreasing]);

  return (
    <div className="flex items-center gap-1 rounded-lg bg-gray-900/80 px-3 py-2 backdrop-blur-sm">
      {[...Array(maxLives)].map((_, i) => (
        <div 
          key={i} 
          className="h-6 w-6 transition-all duration-300"
          ref={(el) => {
            if (heartRefs.current) heartRefs.current[i] = el;
          }}
        >
          {i < lives ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#ef4444"
              className="h-6 w-6"
            >
              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="#ef4444"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
              />
            </svg>
          )}
        </div>
      ))}
    </div>
  );
};

export default LifeIndicator;