import React from 'react';
import { useToastStore } from '../../store/toastStore';
import { useNavigate } from 'react-router-dom';

const NotificationToast: React.FC = () => {
  const { isOpen, message, canvasId, hideToast } = useToastStore();
  const navigate = useNavigate();

  console.log('NotificationToast rendered. isOpen:', isOpen); // 추가

  const handleGoToCanvas = () => {
    if (canvasId) {
      navigate(`/canvas/pixels?canvas_id=${canvasId}`, { state: { isGame: true } });
      hideToast();
    }
  };

  if (!isOpen) return null;

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
      <div className='fixed top-5 left-1/2 z-50 flex max-w-xs -translate-x-1/2 items-center gap-2 rounded-lg border border-blue-500 bg-gradient-to-br from-gray-900 to-gray-800 p-3 text-white shadow-lg shadow-blue-500/50 sm:max-w-sm sm:gap-3 sm:p-4 md:max-w-md md:p-5'>
        {' '}
        {/* 반응형 클래스 추가 */}
        <div className='animate-pulse-siren h-4 w-4 rounded-full bg-red-500'></div>
        {/* 사이렌 애니메이션 요소 */}
        <p className='m-0 text-sm font-bold text-blue-300 sm:text-base md:text-lg'>
          {message}
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
