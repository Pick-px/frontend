import { useEffect, useState } from 'react';
import socketService from '../../services/socketService';
import { useCanvasStore } from '../../store/canvasStore';

interface ActiveUserCountData {
  count: number; // 전체 접속자 수 (소켓 연결 수)
  canvasCounts: {
    // 캔버스별 접속자 수
    [canvasId: string]: number;
  };
  timestamp: number; // 이벤트 발생 시간 (Unix timestamp)
}

export default function userCount() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [canvasCount, setCanvasCount] = useState<number | null>(null);
  const { canvas_id } = useCanvasStore();

  useEffect(() => {
    socketService.onUserCountChange((data: ActiveUserCountData | null) => {
      if (data) {
        setUserCount(data.count);
        const currentCanvasCount = data.canvasCounts[canvas_id];
        setCanvasCount(currentCanvasCount);
      }
    });
  }, [canvas_id]);

  return (
    <div className='text pointer-events-none fixed right-[1px] bottom-[1px] z-[9999] rounded-[8px] p-[10px] text-sm text-white'>
      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-1'>
          <svg
            className='h-4 w-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <circle cx='12' cy='12' r='10' strokeWidth='2' />
            <path d='M2 12h20' strokeWidth='2' />
            <path
              d='M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z'
              strokeWidth='2'
            />
          </svg>
          <span className='text-sm'>
            {userCount === null ? (
              <span className='inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-200 border-t-black align-[-0.125em]'></span>
            ) : (
              userCount
            )}
          </span>
        </div>

        <div className='flex items-center gap-1'>
          <svg
            className='h-4 w-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
            />
          </svg>
          <span className='text-sm'>
            {canvasCount === null ? (
              <span className='inline-block h-3 w-3 animate-spin rounded-full border-2 border-gray-200 border-t-black align-[-0.125em]'></span>
            ) : (
              canvasCount
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
