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
        className='relative max-h-[80vh] w-[90%] max-w-lg overflow-y-auto rounded-xl border-2 border-blue-500 bg-gradient-to-b from-blue-900/90 to-black/95 shadow-2xl shadow-blue-500/30'
        style={{ animation: 'fadeIn 0.5s ease-out' }}
      >
        {/* 상단 장식 효과 */}
        <div className='absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500'></div>
        <div className='absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-blue-500 via-transparent to-blue-500'></div>
        <div className='absolute top-0 right-0 h-full w-1 bg-gradient-to-b from-blue-500 via-transparent to-blue-500'></div>

        {/* 헤더 */}
        <div className='relative flex items-center justify-between border-b border-blue-500/30 bg-blue-900/50 p-2 sm:p-3'>
          <div className='flex items-center'>
            <div className='mr-2 h-8 w-8 rounded-full bg-blue-500/20 p-1.5 sm:mr-3 sm:h-9 sm:w-9 sm:p-2'>
              <svg
                className='h-5 w-5 text-blue-400 sm:h-5 sm:w-5'
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
              <h2 className='text-lg font-bold text-white sm:text-xl'>
                BATTLE{' '}
                <span className='animate-pulse text-blue-400'>READY</span>
              </h2>
            </div>
          </div>
          <div className='rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-bold text-blue-300 sm:px-3 sm:py-1 sm:text-sm'>
            준비 중
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className='p-3 sm:p-4'>
          {/* 타이머 및 색상 */}
          <div className='mb-6 flex flex-col items-center'>
            {/* 타이머 */}
            <div className='relative mb-4'>
              <div className='absolute -inset-1 rounded-full bg-blue-500/10 blur-md'></div>
              <div className='relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-blue-500/30 bg-gradient-to-br from-blue-900/80 to-black/90'>
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
                <span className='animate-pulse font-mono text-5xl font-bold tracking-wider text-blue-300'>
                  {remainingTime !== undefined && remainingTime > 0
                    ? `${remainingTime}`
                    : timeUntilStart !== null && timeUntilStart > 0
                      ? `${timeUntilStart}`
                      : '--'}
                </span>
              </div>
            </div>

            {/* 색상 표시 */}
            <div className='text-m mb-2 text-center text-gray-300'>
              당신의 색상
            </div>
            <div className='relative mb-6'>
              <div className='absolute -inset-1 rounded-full bg-blue-500/10 blur-sm'></div>
              <div
                className='relative h-16 w-16 rounded-full border-2 border-white/30'
                style={{
                  backgroundColor: color || '#CCCCCC',
                  boxShadow: `0 0 20px ${color || '#CCCCCC'}, 0 0 8px white`,
                }}
              ></div>
            </div>
          </div>

          {/* 게임 규칙 */}
          <div className='mb-6 overflow-hidden rounded-lg border border-blue-500/20 bg-blue-900/20 p-4'>
            <h3 className='mb-3 text-center text-xl font-bold text-blue-300'>
              게임 규칙
            </h3>
            <ul className='text-m space-y-2 text-gray-300'>
              <li className='flex items-center'>
                <span className='mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-300'>
                  1
                </span>
                검은색 픽셀은 바로 색칠할 수 있습니다.
              </li>
              <li className='flex items-center'>
                <span className='mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-300'>
                  2
                </span>
                다른 플레이어의 픽셀은 문제를 맞춰야 색칠할 수 있습니다.
              </li>
              <li className='flex items-center'>
                <span className='mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-300'>
                  3
                </span>
                오답 시 생명이 차감됩니다 (최대 2개).
              </li>
              <li className='flex items-center'>
                <span className='mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-300'>
                  4
                </span>
                생명을 모두 잃으면 게임에서 탈락합니다.
              </li>
              <li className='flex items-center'>
                <span className='mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500/20 text-blue-300'>
                  5
                </span>
                가장 많은 픽셀을 차지한 플레이어가 승리합니다.
              </li>
            </ul>
          </div>
        </div>

        {/* 푸터 */}
        <div className='border-t border-blue-500/30 bg-blue-900/30 p-4 text-center'>
          <button
            onClick={handleExit}
            className='rounded-lg bg-red-600/80 px-6 py-2 font-bold text-white shadow-lg transition-all hover:bg-red-700 active:scale-95'
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
