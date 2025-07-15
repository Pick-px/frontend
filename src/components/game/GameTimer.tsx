import React from 'react';

interface GameTimerProps {
  currentTime: number;
  totalTime: number;
}

const GameTimer: React.FC<GameTimerProps> = ({ currentTime, totalTime }) => {
  const progress = totalTime > 0 ? (currentTime / totalTime) * 100 : 0;

  return (
    <div className='absolute top-4 left-1/2 z-50 mb-2 w-full -translate-x-1/2 transform px-4'>
      <div className='relative mx-auto h-6 max-w-lg rounded-full bg-gray-900 shadow-inner'>
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-linear ${
            currentTime <= 20
              ? 'bg-gradient-to-r from-red-600 to-red-800'
              : 'bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900'
          }`}
          style={{ width: `${progress}%` }}
        ></div>
        <div className='absolute inset-0 flex items-center justify-start'>
          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-gray-800 shadow-md'>
            {currentTime}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameTimer;
