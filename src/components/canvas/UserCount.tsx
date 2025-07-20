import { useEffect, useState, useCallback } from 'react';
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

export default function UserCount() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [canvasCount, setCanvasCount] = useState<number | null>(null);
  const { canvas_id } = useCanvasStore();

  // useCallback으로 함수를 메모이제이션하여 불필요한 리렌더링 방지
  const handleUserCountChange = (data: ActiveUserCountData | null) => {
    if (data) {
      setUserCount(data.count);
      const currentCanvasCount = data.canvasCounts[canvas_id];
      setCanvasCount(currentCanvasCount || 0); // undefined일 경우 0으로 설정
    }
  };

  useEffect(() => {
    // 리스너 등록
    socketService.onUserCountChange(handleUserCountChange);

    // // cleanup 함수: 컴포넌트 언마운트 또는 의존성 변경 시 리스너 제거
    return () => {
      socketService.offUserCountChange(handleUserCountChange);
    };
  }, [canvas_id, handleUserCountChange]); // handleUserCountChange가 변경될 때만 재실행

  return (
    <div className='text fixed right-[1px] bottom-[1px] z-[9999] rounded-[8px] p-[10px] text-sm text-white'>
      <div className='flex items-center gap-2'>
        <div className='group relative flex items-center gap-1'>
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
          {/* 툴팁 - 가로로 표시 */}
          <div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 translate-y-1 rounded bg-black/80 px-2 py-1 text-xs whitespace-nowrap opacity-0 transition-all group-hover:block group-hover:translate-y-0 group-hover:opacity-100'>
            전체 접속자 수
          </div>
        </div>

        <div className='group relative flex items-center gap-1'>
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
          {/* 툴팁 - 가로로 표시 */}
          <div className='absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 translate-x-[-80%] translate-y-1 rounded bg-black/80 px-2 py-1 text-xs whitespace-nowrap opacity-0 transition-all group-hover:block group-hover:translate-y-0 group-hover:opacity-100'>
            현재 캔버스 접속자 수
          </div>
        </div>
      </div>
    </div>
  );
}
