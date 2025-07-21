import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { WaitingRoomData } from '../../api/GameAPI';
import { useTimeSyncStore } from '../../store/timeSyncStore';

interface GameReadyModalProps {
  isOpen: boolean;
  onClose: (data?: WaitingRoomData) => void;
  canvasId: string;
  color?: string;
  remainingTime?: number;
}

const GameReadyModal = ({
  isOpen,
  onClose,
  canvasId,
  color,
  remainingTime,
}: GameReadyModalProps) => {
  const navigate = useNavigate();
  const { getSynchronizedServerTime } = useTimeSyncStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [timeUntilStart, setTimeUntilStart] = useState<number | null>(null);
  const [showTips, setShowTips] = useState<number>(0);

  const tips = [
    '검은색 픽셀은 바로 색칠할 수 있어요!',
    '다른 플레이어의 픽셀은 문제를 맞춰야 색칠할 수 있어요.',
    '오답 시 생명이 차감됩니다. (최대 2개)',
    '생명을 모두 잃으면 게임에서 탈락해요!',
    '가장 많은 픽셀을 차지한 플레이어가 승리합니다.',
  ];

  useEffect(() => {
    if (!isOpen) return;

    // 부모 컴포넌트에서 전달받은 remainingTime 사용
    if (remainingTime !== undefined) {
      setTimeUntilStart(remainingTime);
      setLoading(false);

      // 시간이 0이하인 경우 모달 닫기
      if (remainingTime <= 0) {
        setTimeout(() => onClose(), 1000);
      }
    } else {
      setLoading(false);
    }

    // 팁 자동 변경
    const tipInterval = setInterval(() => {
      setShowTips((prev) => (prev + 1) % tips.length);
    }, 3000);

    return () => clearInterval(tipInterval);
  }, [isOpen, onClose, remainingTime]);

  useEffect(() => {
    if (timeUntilStart === null || timeUntilStart <= 0) return;

    const timer = setInterval(() => {
      if (remainingTime === undefined) {
        setTimeUntilStart((prev) => {
          const newValue = prev !== null ? prev - 1 : 0;
          if (newValue <= 0) {
            clearInterval(timer);
            onClose();
          }
          return newValue;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeUntilStart, onClose, remainingTime]);

  const handleExit = () => {
    onClose();
    navigate('/');
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md'>
      <div
        className='relative max-h-[85vh] w-[95%] max-w-sm overflow-y-auto rounded-xl border-2 border-blue-500 bg-gradient-to-b from-blue-900/90 to-black/95 shadow-2xl shadow-blue-500/30 sm:max-h-[80vh] sm:w-[90%] sm:max-w-lg'
        style={{ animation: 'fadeIn 0.5s ease-out' }}
      >
        {/* 상단 장식 효과 */}
        <div className='absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500'></div>
        <div className='absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-blue-500 via-transparent to-blue-500'></div>
        <div className='absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-blue-500 via-transparent to-blue-500'></div>

        {/* 헤더 */}
        <div className='relative flex items-center justify-between border-b border-blue-500/30 bg-blue-900/50 p-2 sm:p-3'>
          <div className='flex items-center'>
            <div className='mr-2 h-6 w-6 rounded-full bg-blue-500/20 p-1 sm:mr-3 sm:h-8 sm:w-8 sm:p-1.5'>
              <svg
                className='h-4 w-4 text-blue-400 sm:h-5 sm:w-5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 10V3L4 14h7v7l9-11h-7z'
                />
              </svg>
            </div>
            <div>
              <h2 className='text-base font-bold text-white sm:text-lg md:text-xl'>
                BATTLE{' '}
                <span className='animate-pulse text-blue-400'>READY</span>
              </h2>
            </div>
          </div>
          <div className='rounded-full bg-blue-500/20 px-1.5 py-0.5 text-xs font-bold text-blue-300 sm:px-2 sm:py-0.5 md:px-3 md:py-1 md:text-sm'>
            준비 중
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className='p-2 sm:p-3 md:p-4'>
          {/* 타이머 및 색상 */}
          <div className='mb-4 flex flex-col items-center sm:mb-6'>
            {/* 타이머 */}
            <div className='relative mb-3 sm:mb-4'>
              <div className='absolute -inset-1 rounded-full bg-blue-500/10 blur-md'></div>
              <div className='relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-blue-500/30 bg-gradient-to-br from-blue-900/80 to-black/90 sm:h-28 sm:w-28 md:h-32 md:w-32'>
                <div
                  className='absolute inset-0 animate-spin rounded-full border-t-4 border-blue-500'
                  style={{ animationDuration: '3s' }}
                ></div>
                <div
                  className='absolute inset-1 animate-spin rounded-full border-r-2 border-cyan-400/50'
                  style={{
                    animationDuration: '2s',
                    animationDirection: 'reverse',
                  }}
                ></div>
                <div
                  className='absolute inset-2 animate-spin rounded-full border-b-2 border-purple-400/30'
                  style={{ animationDuration: '4s' }}
                ></div>
                <span className='animate-pulse font-mono text-3xl font-bold tracking-wider text-blue-300 sm:text-4xl md:text-5xl'>
                  {remainingTime !== undefined && remainingTime > 0
                    ? `${remainingTime}`
                    : timeUntilStart !== null && timeUntilStart > 0
                      ? `${timeUntilStart}`
                      : '--'}
                </span>
              </div>
            </div>

            {/* 색상 표시 */}
            <div className='mb-2 text-center text-sm text-gray-300 sm:text-base'>
              당신의 색상
            </div>
            <div className='relative mb-4 sm:mb-6'>
              <div className='absolute -inset-1 rounded-full bg-blue-500/10 blur-sm'></div>
              <div
                className='relative h-12 w-12 rounded-full border-2 border-white/30 sm:h-14 sm:w-14 md:h-16 md:w-16'
                style={{
                  backgroundColor: color || '#CCCCCC',
                  boxShadow: `0 0 20px ${color || '#CCCCCC'}, 0 0 8px white`,
                }}
              ></div>
            </div>
          </div>

          {/* 게임 규칙 */}
          <div className='mb-4 overflow-hidden rounded-lg border border-blue-500/20 bg-blue-900/20 p-3 sm:mb-6 sm:p-4'>
            <h3 className='mb-2 text-center text-lg font-bold text-blue-300 sm:mb-3 sm:text-xl'>
              게임 규칙
            </h3>
            <ul className='space-y-1.5 text-sm text-gray-300 sm:space-y-2 sm:text-base'>
              <li className='flex items-center'>
                <span className='mr-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20 text-xs text-blue-300 sm:h-5 sm:w-5 sm:text-sm'>
                  1
                </span>
                검은색 픽셀은 바로 색칠할 수 있습니다.
              </li>
              <li className='flex items-center'>
                <span className='mr-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20 text-xs text-blue-300 sm:h-5 sm:w-5 sm:text-sm'>
                  2
                </span>
                다른 플레이어의 픽셀은 문제를 맞춰야 색칠할 수 있습니다.
              </li>
              <li className='flex items-center'>
                <span className='mr-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20 text-xs text-blue-300 sm:h-5 sm:w-5 sm:text-sm'>
                  3
                </span>
                오답 시 생명이 차감됩니다 (최대 2개).
              </li>
              <li className='flex items-center'>
                <span className='mr-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20 text-xs text-blue-300 sm:h-5 sm:w-5 sm:text-sm'>
                  4
                </span>
                생명을 모두 잃으면 게임에서 탈락합니다.
              </li>
              <li className='flex items-center'>
                <span className='mr-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20 text-xs text-blue-300 sm:h-5 sm:w-5 sm:text-sm'>
                  5
                </span>
                가장 많은 픽셀을 차지한 플레이어가 승리합니다.
              </li>
            </ul>
          </div>
        </div>

        {/* 푸터 */}
        <div className='border-t border-blue-500/30 bg-blue-900/30 p-3 text-center sm:p-4'>
          <button
            onClick={handleExit}
            className='rounded-lg bg-red-600/80 px-4 py-2 text-sm font-bold text-white shadow-lg transition-all hover:bg-red-700 active:scale-95 sm:px-6 sm:text-base'
          >
            나가기
          </button>
        </div>

        {/* 애니메이션 효과 */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default GameReadyModal;
