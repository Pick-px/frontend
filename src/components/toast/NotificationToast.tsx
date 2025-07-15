import React, { useState, useEffect } from 'react';
import { useToastStore } from '../../store/toastStore';
import { Link, useNavigate } from 'react-router-dom';

const NotificationToast: React.FC = () => {
  const { isOpen, message, canvasId, startedAt, hideToast } = useToastStore();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(30); // 초기 카운트다운 값

  useEffect(() => {
    if (isOpen && startedAt) {
      const interval = setInterval(() => {
        const elapsedTime = Math.floor((Date.now() - startedAt) / 1000);
        const remainingTime = 30 - elapsedTime;
        if (remainingTime >= 0) {
          setCountdown(remainingTime);
        } else {
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setCountdown(30); // 토스트가 닫히거나 시작 시간이 없으면 카운트다운 초기화
    }
  }, [isOpen, startedAt]);

  const handleGoToCanvas = () => {
    if (canvasId) {
      navigate(`/canvas/pixels?canvas_id=${canvasId}`, {
        state: { isGame: true },
      });
      hideToast();
    }
  };

  if (!isOpen) return null;

  // 메시지에서 '30'을 찾아 카운트다운 값으로 대체
  const displayMessage = message.replace('30', countdown.toString());

  return (
    <>
      <style>
        {`
          @keyframes pulse-siren {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          .animate-pulse-siren {
            animation: pulse-siren 1s infinite alternate;
          }
        `}
      </style>
      <div className='fixed top-5 left-1/2 z-50 flex w-[90vw] max-w-md -translate-x-1/2 items-center gap-2 rounded-lg border border-blue-500 bg-gradient-to-br from-gray-900 to-gray-800 p-3 text-white shadow-lg shadow-blue-500/50 sm:gap-3 sm:p-4 md:p-5'>
        {' '}
        {/* 반응형 클래스 추가 */}
        <div className='animate-pulse-siren h-4 w-4 rounded-full bg-red-500'></div>
        {/* 사이렌 애니메이션 요소 */}
        <p className='m-0 text-sm font-bold text-blue-300 sm:text-base md:text-lg'>
          {displayMessage}
        </p>
        {canvasId && (
          <button
            onClick={handleGoToCanvas}
            className='cursor-pointer rounded-md bg-blue-700 px-2 py-1 text-xs text-white transition-colors duration-200 hover:bg-blue-800 sm:px-3 sm:py-2 sm:text-sm'
          >
            이동
          </button>
        )}
        <button
          onClick={hideToast}
          className='ml-1 cursor-pointer border-none bg-transparent text-base text-blue-300 hover:text-blue-100 sm:ml-2 sm:text-lg'
        >
          X
        </button>
      </div>
    </>
  );
};

export default NotificationToast;
