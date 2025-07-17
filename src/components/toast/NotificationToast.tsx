import React, { useState, useEffect } from 'react';
import { useToastStore } from '../../store/toastStore';
import { useNavigate } from 'react-router-dom';

const NotificationToast: React.FC = () => {
  const { isOpen, message, canvasId, startedAt, hideToast } = useToastStore();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(30);

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
      setCountdown(30);
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

  const displayMessage = message.replace('30', countdown.toString());

  return (
    <>
      <style>
        {`
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translate(-50%, -20px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
          @keyframes fadeOutUp {
            from {
              opacity: 1;
              transform: translate(-50%, 0);
            }
            to {
              opacity: 0;
              transform: translate(-50%, -20px);
            }
          }
          .toast-enter {
            animation: fadeInDown 0.3s ease-out forwards;
          }
          .toast-exit {
            animation: fadeOutUp 0.3s ease-in forwards;
          }
          @keyframes pulse-siren {
            0%, 100% { box-shadow: 0 0 8px 2px rgba(239, 68, 68, 0.7); }
            50% { box-shadow: 0 0 12px 4px rgba(239, 68, 68, 1); }
          }
          .animate-pulse-siren {
            animation: pulse-siren 1.5s infinite alternate;
          }
        `}
      </style>
      {isOpen && (
        <div className='toast-enter fixed top-5 left-1/2 z-50 flex w-[90vw] max-w-lg items-center justify-between gap-3 rounded-xl border border-blue-500/30 bg-gray-900/80 p-4 text-white shadow-2xl shadow-blue-500/20 backdrop-blur-sm'>
          <div className='flex items-center gap-3'>
            <div className='animate-pulse-siren h-3 w-3 rounded-full bg-red-500'></div>
            <p className='m-0 text-sm font-medium text-gray-200 sm:text-base'>
              {displayMessage}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            {canvasId && (
              <button
                onClick={handleGoToCanvas}
                className='cursor-pointer rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition-all duration-300 hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/50 focus:ring-2 focus:ring-blue-400 focus:outline-none sm:px-4 sm:text-sm'
              >
                참여하기
              </button>
            )}
            <button
              onClick={hideToast}
              className='ml-2 cursor-pointer border-none bg-transparent text-xl text-gray-400 transition-colors hover:text-white sm:ml-3'
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationToast;
