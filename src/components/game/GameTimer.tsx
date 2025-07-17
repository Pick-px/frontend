import React from 'react';
import { useViewport } from '../../hooks/useViewport';

interface GameTimerProps {
  currentTime: number;
  totalTime: number;
}

const GameTimer: React.FC<GameTimerProps> = ({ currentTime, totalTime }) => {
  const { width } = useViewport();
  const isMobile = width <= 768;

  const progress = totalTime > 0 ? (currentTime / totalTime) * 100 : 0;

  const barHeight = isMobile ? 'h-5' : 'h-6';
  const timerCircleSize = isMobile ? 'h-5 w-5 text-xs' : 'h-6 w-6 text-xs';
  const containerPadding = isMobile ? 'px-2' : 'px-4';

  return (
    <div
      className={`absolute top-4 left-1/2 z-50 mb-2 w-full -translate-x-1/2 transform ${containerPadding}`}>
      <div
        className={`relative mx-auto ${barHeight} max-w-lg rounded-full bg-gray-900 shadow-inner`}>
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-linear ${
            currentTime <= 20
              ? 'bg-gradient-to-r from-red-600 to-red-800'
              : 'bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900'
          }`}
          style={{ width: `${progress}%` }}></div>
        <div className='absolute inset-0 flex items-center justify-start'>
          <div
            className={`flex items-center justify-center rounded-full bg-white font-bold text-gray-800 shadow-md ${timerCircleSize}`}>
            {currentTime}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameTimer;
