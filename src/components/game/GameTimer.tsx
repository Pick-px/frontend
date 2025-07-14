import React, { useState, useEffect } from 'react';

interface GameTimerProps {
  initialTime?: number; // Default to 90 if not provided
  onTimerEnd?: () => void;
}

const GameTimer: React.FC<GameTimerProps> = ({
  initialTime = 90,
  onTimerEnd,
}) => {
  const [gameTimeLeft, setGameTimeLeft] = useState(initialTime);
  const [isGameEnded, setIsGameEnded] = useState(false);

  useEffect(() => {
    if (isGameEnded) return;

    const timer = setInterval(() => {
      setGameTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          setIsGameEnded(true);
          onTimerEnd?.(); // Call the callback when timer ends
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameEnded, initialTime, onTimerEnd]);

  return (
    <div className='absolute top-4 left-1/2 z-50 mb-2 w-full -translate-x-1/2 transform px-4'>
      <div className='relative mx-auto h-6 max-w-lg rounded-full bg-gray-900 shadow-inner'>
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-linear ${
            gameTimeLeft <= 20
              ? 'bg-gradient-to-r from-red-600 to-red-800'
              : 'bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900'
          }`}
          style={{ width: `${(gameTimeLeft / initialTime) * 100}%` }}
        ></div>
        <div className='absolute inset-0 flex items-center justify-start'>
          <div className='flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-gray-800 shadow-md'>
            {gameTimeLeft}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameTimer;
