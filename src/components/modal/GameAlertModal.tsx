import React, { useEffect, useState } from 'react';
import { useModalStore } from '../../store/modalStore';
import { useNavigate } from 'react-router-dom';

export default function GameAlertModal() {
  const {
    isGameAlertOpen,
    gameAlertMessage,
    gameAlertCanvasId,
    closeGameAlert,
  } = useModalStore();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(30);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isGameAlertOpen) {
      // 모달이 열릴 때 시작 시간 설정
      const now = Date.now();
      setStartTime(now);
      setCountdown(30);

      // 25초 후 자동으로 닫히도록 설정
      const closeTimer = setTimeout(() => {
        closeGameAlert();
      }, 25000);

      // 카운트다운 인터벌 설정
      const countdownInterval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - now) / 1000);
        const remainingTime = 30 - elapsedTime;
        if (remainingTime >= 0) {
          setCountdown(remainingTime);
        } else {
          clearInterval(countdownInterval);
        }
      }, 1000);

      return () => {
        clearTimeout(closeTimer);
        clearInterval(countdownInterval);
      };
    }
  }, [isGameAlertOpen, closeGameAlert]);

  if (!isGameAlertOpen) return null;

  const handleJoinGame = () => {
    navigate(`/canvas/pixels?canvas_id=${gameAlertCanvasId}`, {
      state: { isGame: true },
    });
    closeGameAlert();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center'>
      <div className='absolute inset-0 bg-black/70'></div>
      <div className='relative z-10 mx-4 w-[90%] max-h-[80vh] overflow-y-auto max-w-md rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 p-3 shadow-xl sm:p-5'>
        <div className='mb-2 flex items-center justify-center sm:mb-3'>
          <div className='rounded-full bg-yellow-500/20 p-1.5 sm:p-3'>
            <svg
              className='h-5 w-5 text-yellow-400 sm:h-7 sm:w-7'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
              />
            </svg>
          </div>
        </div>

        <h2 className='mb-1 text-center text-lg font-bold text-white sm:text-xl'>
          게임 알림
        </h2>
        <p className='mb-3 text-center text-sm text-yellow-300 sm:mb-4 sm:text-base'>
          {gameAlertMessage.includes('게임 시작') 
            ? `게임 시작 ${countdown}초 전: ${gameAlertMessage.split(': ')[1] || ''}` 
            : gameAlertMessage.replace(/\d+초/, `${countdown}초`)}
        </p>

        <div className='flex justify-center gap-3'>
          <button
            onClick={handleJoinGame}
            className='rounded-md bg-gradient-to-r from-yellow-500 to-amber-500 px-3 py-1.5 text-xs font-medium text-white shadow-lg transition-all hover:from-yellow-400 hover:to-amber-400 active:scale-95 sm:px-5 sm:py-2 sm:text-sm'
          >
            게임 참여하기
          </button>
          <button
            onClick={closeGameAlert}
            className='rounded-md bg-gray-700 px-3 py-1.5 text-xs font-medium text-white shadow-lg transition-all hover:bg-gray-600 active:scale-95 sm:px-5 sm:py-2 sm:text-sm'
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
