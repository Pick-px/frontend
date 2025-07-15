import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { canvasService } from '../../api/CanvasAPI';
import type { Canvas } from '../../api/CanvasAPI';
import { useCanvasStore } from '../../store/canvasStore';
import { useTimeSyncStore } from '../../store/timeSyncStore';

// CSS 애니메이션 스타일
const glowStyles = `
  @keyframes rainbow-border {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  
  .canvas-rainbow-border {
    position: relative;
    border-radius: 12px;
    padding: 1.5px;
    background: linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3, #ff0000);
    background-size: 400% 400%;
    animation: rainbow-border 3s linear infinite;
  }
  
  .canvas-rainbow-border::before {
    content: '';
    position: absolute;
    top: 1.5px;
    left: 1.5px;
    right: 1.5px;
    bottom: 1.5px;
    background: rgba(0, 0, 0, 0.8);
    border-radius: 10.5px;
    z-index: 0;
  }
  
  .canvas-content {
    position: relative;
    z-index: 1;
    background: rgba(0, 0, 0, 0.6);
    border-radius: 10.5px;
  }
`;

type CanvasModalContentProps = {
  onClose?: () => void;
};

const CanvasModalContent = ({ onClose }: CanvasModalContentProps) => {
  const navigate = useNavigate();
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // useTimeSyncStore에서 getSynchronizedServerTime 함수를 가져옵니다.
  const { getSynchronizedServerTime } = useTimeSyncStore();

  // 캐러셀 관련 상태
  const [activeScrollLeft, setActiveScrollLeft] = useState(0);
  const [eventScrollLeft, setEventScrollLeft] = useState(0);
  const activeScrollRef = useRef<HTMLDivElement>(null);
  const eventScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);

  // 현재 canvas_id
  const { canvas_id } = useCanvasStore();

  // 실시간 시간 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 캔버스가 종료되었는지 확인하는 함수
  const isCanvasExpired = (endedAt: string, startedAt?: string) => {
    const now = getSynchronizedServerTime();

    // startedAt이 존재하고 현재 시간이 startedAt보다 이전이면 아직 만료되지 않음 (시작 전)
    if (startedAt && startedAt !== 'null' && startedAt !== 'undefined') {
      try {
        let startTime: Date;
        if (startedAt.includes('T')) {
          startTime = startedAt.endsWith('Z')
            ? new Date(startedAt)
            : new Date(startedAt + 'Z');
        } else {
          startTime = new Date(startedAt);
        }

        if (!isNaN(startTime.getTime()) && now < startTime.getTime()) {
          return false; // 아직 시작 전이므로 만료되지 않음
        }
      } catch (error) {
        console.error('Error checking canvas start time:', error);
        // 에러 발생 시 endedAt 로직으로 폴백
      }
    }

    // startedAt이 지났거나 없으면 endedAt으로 만료 여부 판단
    if (!endedAt || endedAt === 'null' || endedAt === 'undefined') {
      return false;
    }

    try {
      let endTime: Date;

      if (endedAt.includes('T')) {
        endTime = endedAt.endsWith('Z')
          ? new Date(endedAt)
          : new Date(endedAt + 'Z');
      } else {
        endTime = new Date(endedAt);
      }

      if (isNaN(endTime.getTime())) {
        return false;
      }

      return endTime.getTime() <= now;
    } catch (error) {
      console.error('Error checking canvas expiration:', error);
      return false;
    }
  };
  const getTimeRemaining = (endedAt: string, startedAt?: string) => {
    try {
      const now = getSynchronizedServerTime();
      let targetTime: Date | null = null;
      let prefix: string = '';
      let isUpcomingCanvas = false; // To track if it's an upcoming canvas (startedAt in future)

      // 1. Check if startedAt is valid and in the future
      if (startedAt && startedAt !== 'null' && startedAt !== 'undefined') {
        let startTime: Date;
        if (startedAt.includes('T')) {
          startTime = startedAt.endsWith('Z')
            ? new Date(startedAt)
            : new Date(startedAt + 'Z');
        } else {
          startTime = new Date(startedAt);
        }

        if (!isNaN(startTime.getTime()) && startTime.getTime() > now) {
          targetTime = startTime;
          prefix = '시작까지';
          isUpcomingCanvas = true;
        }
      }

      // 2. If not an upcoming canvas (startedAt not provided, or in the past/invalid), use endedAt
      if (!targetTime) {
        // If targetTime was not set by startedAt logic
        if (!endedAt || endedAt === 'null' || endedAt === 'undefined') {
          return {
            text: '종료 시간 없음',
            isExpired: false,
            isUrgent: false,
            isUpcoming: false,
            targetDate: undefined,
          };
        }

        if (endedAt.includes('T')) {
          targetTime = endedAt.endsWith('Z')
            ? new Date(endedAt)
            : new Date(endedAt + 'Z');
        } else {
          targetTime = new Date(endedAt);
        }
        prefix = '종료까지';
      }

      // Handle invalid targetTime after all attempts
      if (!targetTime || isNaN(targetTime.getTime())) {
        console.warn('Invalid date:', endedAt, startedAt);
        return {
          text: '날짜 오류',
          isExpired: false,
          isUrgent: false,
          isUpcoming: false,
          targetDate: undefined,
        };
      }

      const timeDiff = targetTime.getTime() - now;

      if (timeDiff <= 0) {
        return {
          text: isUpcomingCanvas ? '시작됨' : '종료됨',
          isExpired: true,
          isUpcoming: false,
          targetDate: targetTime,
        };
      }

      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

      let text = '';
      let isUrgent = false;

      if (days > 0) {
        text = `${prefix} ${days}일 ${hours}시간 남음`;
      } else if (hours > 0) {
        text = `${prefix} ${hours}시간 ${minutes}분 남음`;
        isUrgent = hours < 1; // 1시간 미만일 때 긴급
      } else if (minutes > 0) {
        text = `${prefix} ${minutes}분 ${seconds}초 남음`;
        isUrgent = true;
      } else {
        text = `${prefix} ${seconds}초 남음`;
        isUrgent = true;
      }

      return {
        text,
        isExpired: false,
        isUrgent,
        isUpcoming: isUpcomingCanvas,
        targetDate: targetTime,
      };
    } catch (error) {
      console.error(
        'Error calculating time remaining:',
        error,
        'endedAt:',
        endedAt,
        'startedAt:',
        startedAt
      );
      return {
        text: '계산 오류',
        isExpired: false,
        isUrgent: false,
        isUpcoming: false,
        targetDate: undefined,
      };
    }
  };

  // 캔버스 목록 가져오기 함수
  const fetchCanvases = async () => {
    try {
      setLoading(true);
      setError(null);

      // 실제 API 호출
      const data = await canvasService.getActiveCanvases();
      // console.log('Fetched canvases:', data.canvases); // 디버깅용
      setCanvases(data.canvases);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '캔버스 목록을 불러오는데 실패했습니다.'
      );
      console.error('Error fetching canvases:', err);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 캔버스 목록 가져오기
  useEffect(() => {
    fetchCanvases();
  }, []);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 캔버스 선택 시 모달 닫기 후 이동
  const handleCanvasSelect = (e: React.MouseEvent, canvasId: number) => {
    // 드래그 중이면 클릭 이벤트 무시
    if (isDragging) {
      e.preventDefault();
      return;
    }

    // 현재 캔버스와 같은 캔버스라면 이동안함.
    if (canvasId === Number(canvas_id)) {
      return;
    }

    // 선택된 캔버스 찾기
    const selectedCanvas = canvases.find((c) => c.canvasId === canvasId);

    if (selectedCanvas && selectedCanvas.type !== 'public') {
      // 이벤트 캔버스인 경우에만 체크
      const now = getSynchronizedServerTime();
      if (selectedCanvas.started_at) {
        let startTime: Date;
        try {
          if (selectedCanvas.started_at.includes('T')) {
            startTime = selectedCanvas.started_at.endsWith('Z')
              ? new Date(selectedCanvas.started_at)
              : new Date(selectedCanvas.started_at + 'Z');
          } else {
            startTime = new Date(selectedCanvas.started_at);
          }

          if (!isNaN(startTime.getTime()) && now < startTime.getTime()) {
            // 아직 시작 전
            toast.error('아직 시작되지 않은 캔버스입니다.', {
              position: 'top-center',
              autoClose: 2000,
              hideProgressBar: true,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: 'dark',
              style: { backgroundColor: '#dc2626', color: 'white' }, // Tailwind red-600
            });
            return; // 페이지 이동 막기
          }
        } catch (error) {
          console.error('Error parsing started_at for toast:', error);
          // 에러 발생 시에도 페이지 이동 막고 메시지 표시
          toast.error('캔버스 정보를 처리하는 중 오류가 발생했습니다.', {
            position: 'top-center',
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'dark',
            style: { backgroundColor: '#dc2626', color: 'white' },
          });
          return;
        }
      }
    }

    // 1. 모달 먼저 닫기
    if (onClose) {
      onClose();
    }

    // 2. 페이지 이동 (새로고침 포함)
    window.location.href = getCanvasUrl(canvasId);
  };

  // URL 생성 함수 (Query parameter 방식 사용)
  const getCanvasUrl = (canvasId: number) => {
    return `/canvas/pixels?canvas_id=${canvasId}`;
  };

  // 캐러셀 스크롤 함수
  const scrollCarousel = (
    direction: 'left' | 'right',
    type: 'active' | 'event'
  ) => {
    const scrollRef = type === 'active' ? activeScrollRef : eventScrollRef;
    const setScrollLeft =
      type === 'active' ? setActiveScrollLeft : setEventScrollLeft;

    if (scrollRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        direction === 'left'
          ? Math.max(0, scrollRef.current.scrollLeft - scrollAmount)
          : scrollRef.current.scrollLeft + scrollAmount;

      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
      setScrollLeft(newScrollLeft);
    }
  };

  // 마우스 드래그 시작
  const handleMouseDown = (e: React.MouseEvent, type: 'active' | 'event') => {
    const scrollRef = type === 'active' ? activeScrollRef : eventScrollRef;
    if (scrollRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - scrollRef.current.offsetLeft);
      setScrollStart(scrollRef.current.scrollLeft);
    }
  };

  // 마우스 드래그 중
  const handleMouseMove = (e: React.MouseEvent, type: 'active' | 'event') => {
    if (!isDragging) return;
    e.preventDefault();

    const scrollRef = type === 'active' ? activeScrollRef : eventScrollRef;
    const setScrollLeft =
      type === 'active' ? setActiveScrollLeft : setEventScrollLeft;

    if (scrollRef.current) {
      const x = e.pageX - scrollRef.current.offsetLeft;
      const walk = (x - startX) * 2;
      const newScrollLeft = scrollStart - walk;
      scrollRef.current.scrollLeft = newScrollLeft;
      setScrollLeft(newScrollLeft);
    }
  };

  // 마우스 드래그 종료
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (loading) {
    return (
      <div className='flex flex-col'>
        <div className='flex-shrink-0 border-b border-white/20 p-4'>
          <h2 className='text-lg font-semibold text-white'>캔버스 이동</h2>
          <p className='mt-1 text-sm text-gray-300'>
            이동할 캔버스를 선택해주세요.
          </p>
        </div>

        <div className='flex h-32 items-center justify-center p-6'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-gray-400'></div>
          <span className='ml-2 text-gray-300'>
            캔버스 목록을 불러오는 중...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col'>
        <div className='flex-shrink-0 border-b border-white/20 p-4'>
          <h2 className='text-lg font-semibold text-white'>캔버스 이동</h2>
          <p className='mt-1 text-sm text-gray-300'>
            이동할 캔버스를 선택해주세요.
          </p>
        </div>

        <div className='p-6 text-center'>
          <div className='mb-4'>
            <svg
              className='mx-auto mb-2 h-12 w-12 text-red-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            <p className='text-sm text-red-400'>{error}</p>
          </div>
          <button
            onClick={fetchCanvases}
            className='rounded bg-gray-700 px-4 py-2 text-white transition-colors duration-200 hover:bg-gray-600'
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{glowStyles}</style>
      <div className='flex max-h-[80vh] flex-col'>
        {/* 헤더 */}
        <div className='flex-shrink-0 border-b border-white/20 p-4'>
          <h2 className='text-lg font-semibold text-white'>캔버스 이동</h2>
          <p className='mt-1 text-sm text-gray-300'>
            이동할 캔버스를 선택해주세요.
          </p>
        </div>

        {/* 컨텐츠 */}
        <div className='flex-1 overflow-y-auto p-4'>
          {/* 활성 캔버스 섹션 */}
          <div className='mb-6'>
            <div className='mb-3 flex items-center justify-between'>
              <h3 className='text-sm font-medium text-gray-300'>상시 캔버스</h3>
              {canvases.length > 2 && (
                <div className='flex gap-2'>
                  <button
                    onClick={() => scrollCarousel('left', 'active')}
                    className='rounded-full bg-white/10 p-1 text-gray-400 transition-colors hover:bg-white/20 hover:text-gray-300'
                  >
                    <svg
                      className='h-4 w-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 19l-7-7 7-7'
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => scrollCarousel('right', 'active')}
                    className='rounded-full bg-white/10 p-1 text-gray-400 transition-colors hover:bg-white/20 hover:text-gray-300'
                  >
                    <svg
                      className='h-4 w-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {canvases.length === 0 ? (
              <div className='py-8 text-center'>
                <svg
                  className='mx-auto mb-4 h-16 w-16 text-gray-500'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
                <p className='text-gray-400'>
                  사용 가능한 활성 캔버스가 없습니다.
                </p>
              </div>
            ) : (
              <div
                ref={activeScrollRef}
                className='scrollbar-hide flex cursor-grab gap-3 overflow-x-auto active:cursor-grabbing'
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onMouseDown={(e) => handleMouseDown(e, 'active')}
                onMouseMove={(e) => handleMouseMove(e, 'active')}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {canvases
                  .filter((canvas) => canvas.type === 'public')
                  .map((canvas) => (
                    <div
                      key={canvas.canvasId}
                      onClick={(e) => handleCanvasSelect(e, canvas.canvasId)}
                      className='group block min-w-[200px] cursor-pointer rounded-lg border border-2 border-gray-300 transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/20'
                    >
                      <div className='canvas-content flex flex-col p-3'>
                        <h3 className='mb-1 truncate font-medium text-white group-hover:text-gray-200'>
                          {canvas.title}{' '}
                          {canvas.canvasId === Number(canvas_id) &&
                            '(현재 캔버스)'}
                        </h3>
                        <div className='flex flex-col gap-1'>
                          <span className='rounded bg-white/10 px-2 py-1 text-center text-xs text-gray-300 group-hover:bg-gray-800/60 group-hover:text-gray-200'>
                            {canvas.size_x} × {canvas.size_y}
                          </span>
                          {canvas.status && (
                            <span className='rounded bg-green-500/20 px-2 py-1 text-center text-xs text-green-400 group-hover:bg-green-600/30 group-hover:text-green-300'>
                              {canvas.status}
                            </span>
                          )}
                          <span className='text-white-400 group-hover:text-white-100 rounded bg-gray-800/20 px-2 py-1 text-center text-xs group-hover:bg-gray-600/30'>
                            {canvas.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* 종료된 캔버스 섹션 */}
          <div>
            <div className='mb-3 flex items-center justify-between'>
              <h3 className='text-sm font-medium text-gray-400'>
                이벤트 캔버스 (
                {
                  canvases
                    .filter((canvas) => canvas.type !== 'public')
                    .filter(
                      (canvas) =>
                        !isCanvasExpired(canvas.ended_at, canvas.started_at)
                    ).length
                }
                개)
              </h3>
              {canvases.length > 2 && (
                <div className='flex gap-2'>
                  <button
                    onClick={() => scrollCarousel('left', 'event')}
                    className='rounded-lg bg-white/10 p-1 text-gray-500 transition-colors hover:bg-white/20 hover:text-gray-400'
                  >
                    <svg
                      className='h-4 w-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 19l-7-7 7-7'
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => scrollCarousel('right', 'event')}
                    className='rounded-full bg-white/10 p-1 text-gray-500 transition-colors hover:bg-white/20 hover:text-gray-400'
                  >
                    <svg
                      className='h-4 w-4'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            <div
              ref={eventScrollRef}
              className='scrollbar-hide flex cursor-grab gap-3 overflow-x-auto active:cursor-grabbing'
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onMouseDown={(e) => handleMouseDown(e, 'event')}
              onMouseMove={(e) => handleMouseMove(e, 'event')}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {canvases
                .filter((canvas) => canvas.type !== 'public')
                .filter(
                  (canvas) =>
                    !isCanvasExpired(canvas.ended_at, canvas.started_at)
                ) // 종료된 캔버스 제외
                .map((canvas) => {
                  const timeInfo = canvas.ended_at
                    ? getTimeRemaining(canvas.ended_at, canvas.started_at)
                    : null;
                  return { canvas, timeInfo }; // Return an object with canvas and timeInfo
                })
                .sort((a, b) => {
                  // Sort logic
                  const aIsUpcoming = a.timeInfo?.isUpcoming || false;
                  const bIsUpcoming = b.timeInfo?.isUpcoming || false;

                  // If one is upcoming and the other is not, the non-upcoming comes first
                  if (aIsUpcoming && !bIsUpcoming) return 1; // a is upcoming, b is not -> b comes first
                  if (!aIsUpcoming && bIsUpcoming) return -1; // a is not upcoming, b is -> a comes first

                  // If both are upcoming or both are not upcoming, sort by targetDate
                  if (a.timeInfo?.targetDate && b.timeInfo?.targetDate) {
                    return (
                      a.timeInfo.targetDate.getTime() -
                      b.timeInfo.targetDate.getTime()
                    );
                  }
                  return 0; // Should not happen if targetDate is always present when timeInfo is not null
                })
                .map(({ canvas, timeInfo }) => {
                  return (
                    <div
                      key={canvas.canvasId}
                      onClick={(e) => handleCanvasSelect(e, canvas.canvasId)}
                      className={`group block min-w-[200px] cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-gray-900/20 ${
                        timeInfo?.isUpcoming
                          ? 'cursor-not-allowed opacity-50 grayscale'
                          : 'canvas-rainbow-border'
                      }`}
                    >
                      <div className='canvas-content flex flex-col p-3'>
                        <h3 className='mb-1 truncate font-medium text-white group-hover:text-gray-200'>
                          {canvas.title}{' '}
                          {canvas.canvasId === Number(canvas_id) && '📍'}
                        </h3>
                        <p
                          className={`mb-2 text-xs group-hover:text-gray-300 ${
                            timeInfo?.isUrgent
                              ? 'text-yellow-400'
                              : 'text-gray-400'
                          }`}
                        >
                          {timeInfo
                            ? timeInfo.text
                            : formatDate(canvas.created_at)}
                        </p>
                        <div className='flex flex-col gap-1'>
                          <span className='rounded bg-white/10 px-2 py-1 text-center text-xs text-gray-300 group-hover:bg-gray-800/60 group-hover:text-gray-200'>
                            {canvas.size_x} × {canvas.size_y}
                          </span>
                          {canvas.status && (
                            <span className='rounded bg-green-500/20 px-2 py-1 text-center text-xs text-green-400 group-hover:bg-green-600/30 group-hover:text-green-300'>
                              {canvas.status}
                            </span>
                          )}
                          <span className='rounded bg-purple-500/20 px-2 py-1 text-center text-xs text-purple-400 group-hover:bg-purple-600/30 group-hover:text-purple-300'>
                            {canvas.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CanvasModalContent;
