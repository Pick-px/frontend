import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { canvasService } from '../../api/CanvasAPI';
import type { Canvas } from '../../api/CanvasAPI';

// CSS 애니메이션 스타일
const glowStyles = `
  @keyframes glow {
    0% {
      border-color: rgba(250, 204, 21, 0.4);
      box-shadow: 0 0 15px rgba(250, 204, 21, 0.2), inset 0 0 15px rgba(250, 204, 21, 0.1);
    }
    50% {
      border-color: rgba(250, 204, 21, 0.8);
      box-shadow: 0 0 25px rgba(250, 204, 21, 0.4), inset 0 0 25px rgba(250, 204, 21, 0.2);
    }
    100% {
      border-color: rgba(250, 204, 21, 0.4);
      box-shadow: 0 0 15px rgba(250, 204, 21, 0.2), inset 0 0 15px rgba(250, 204, 21, 0.1);
    }
  }
  
  .canvas-glow {
    animation: glow 2s ease-in-out infinite;
  }
`;

type CanvasModalContentProps = {
  onClose?: () => void;
};

const CanvasModalContent = ({ onClose }: CanvasModalContentProps) => {
  const navigate = useNavigate();
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [expiredCanvases, setExpiredCanvases] = useState<Canvas[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 캐러셀 관련 상태
  const [activeScrollLeft, setActiveScrollLeft] = useState(0);
  const [expiredScrollLeft, setExpiredScrollLeft] = useState(0);
  const activeScrollRef = useRef<HTMLDivElement>(null);
  const expiredScrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);

  // 캔버스 목록 가져오기 함수
  const fetchCanvases = async () => {
    try {
      setLoading(true);
      setError(null);

      // 실제 API 호출
      const data = await canvasService.getActiveCanvases();
      setCanvases(data.canvases);

      // 종료된 캔버스 더미 데이터
      const expiredData: Canvas[] = [
        {
          canvasId: 101,
          title: 'Pixel Art Challenge 2024',
          created_at: '2024-12-01T10:00:00Z',
          size_x: 150,
          size_y: 150,
          status: 'inactive',
        },
        {
          canvasId: 102,
          title: 'Christmas Special Canvas',
          created_at: '2024-12-25T15:30:00Z',
          size_x: 200,
          size_y: 100,
          status: 'inactive',
        },
        {
          canvasId: 103,
          title: 'New Year Countdown',
          created_at: '2024-12-31T23:00:00Z',
          size_x: 300,
          size_y: 200,
          status: 'inactive',
        },
        {
          canvasId: 104,
          title: 'Winter Wonderland',
          created_at: '2024-11-15T12:00:00Z',
          size_x: 250,
          size_y: 180,
          status: 'inactive',
        },
        {
          canvasId: 105,
          title: 'Halloween Special',
          created_at: '2024-10-31T18:00:00Z',
          size_x: 180,
          size_y: 180,
          status: 'inactive',
        },
      ];
      setExpiredCanvases(expiredData);
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

    // 1. 모달 먼저 닫기
    if (onClose) {
      onClose();
    }

    // 2. 페이지 이동 (새로고침 없음)
    navigate(getCanvasUrl(canvasId));
  };

  // URL 생성 함수 (Query parameter 방식 사용)
  const getCanvasUrl = (canvasId: number) => {
    return `/canvas/pixels?canvas_id=${canvasId}`;
  };

  // 캐러셀 스크롤 함수
  const scrollCarousel = (
    direction: 'left' | 'right',
    type: 'active' | 'expired'
  ) => {
    const scrollRef = type === 'active' ? activeScrollRef : expiredScrollRef;
    const setScrollLeft =
      type === 'active' ? setActiveScrollLeft : setExpiredScrollLeft;

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
  const handleMouseDown = (e: React.MouseEvent, type: 'active' | 'expired') => {
    const scrollRef = type === 'active' ? activeScrollRef : expiredScrollRef;
    if (scrollRef.current) {
      setIsDragging(true);
      setStartX(e.pageX - scrollRef.current.offsetLeft);
      setScrollStart(scrollRef.current.scrollLeft);
    }
  };

  // 마우스 드래그 중
  const handleMouseMove = (e: React.MouseEvent, type: 'active' | 'expired') => {
    if (!isDragging) return;
    e.preventDefault();

    const scrollRef = type === 'active' ? activeScrollRef : expiredScrollRef;
    const setScrollLeft =
      type === 'active' ? setActiveScrollLeft : setExpiredScrollLeft;

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
              <h3 className='text-sm font-medium text-gray-300'>
                활성 캔버스 ({canvases.length}개)
              </h3>
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
                {canvases.map((canvas) => (
                  <div
                    key={canvas.canvasId}
                    onClick={(e) => handleCanvasSelect(e, canvas.canvasId)}
                    className='group canvas-glow block min-w-[200px] cursor-pointer rounded-lg border-2 bg-white/5 p-3 transition-all duration-300 hover:border-gray-500/60 hover:bg-gray-900/50 hover:shadow-xl hover:shadow-gray-900/20'
                  >
                    <div className='flex flex-col'>
                      <h3 className='mb-1 truncate font-medium text-white group-hover:text-gray-200'>
                        {canvas.title}
                      </h3>
                      <p className='mb-2 text-xs text-gray-400 group-hover:text-gray-300'>
                        {formatDate(canvas.created_at)}
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
                종료된 캔버스 ({expiredCanvases.length}개)
              </h3>
              {expiredCanvases.length > 2 && (
                <div className='flex gap-2'>
                  <button
                    onClick={() => scrollCarousel('left', 'expired')}
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
                        d='M15 19l-7-7 7-7'
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => scrollCarousel('right', 'expired')}
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
              ref={expiredScrollRef}
              className='scrollbar-hide flex cursor-grab gap-3 overflow-x-auto active:cursor-grabbing'
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              onMouseDown={(e) => handleMouseDown(e, 'expired')}
              onMouseMove={(e) => handleMouseMove(e, 'expired')}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {expiredCanvases.map((canvas) => (
                <div
                  key={canvas.canvasId}
                  className='group block min-w-[200px] rounded-lg border border-white/10 bg-white/5 p-3 opacity-60 transition-all duration-300 hover:border-gray-600/40 hover:bg-gray-900/30 hover:opacity-80'
                >
                  <div className='flex flex-col'>
                    <h3 className='mb-1 truncate font-medium text-gray-400 group-hover:text-gray-300'>
                      {canvas.title}
                    </h3>
                    <p className='mb-2 text-xs text-gray-500 group-hover:text-gray-400'>
                      {formatDate(canvas.created_at)}
                    </p>
                    <div className='flex flex-col gap-1'>
                      <span className='rounded bg-white/5 px-2 py-1 text-center text-xs text-gray-500 group-hover:bg-gray-800/40 group-hover:text-gray-400'>
                        {canvas.size_x} × {canvas.size_y}
                      </span>
                      <span className='rounded bg-red-500/20 px-2 py-1 text-center text-xs text-red-400'>
                        종료됨
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CanvasModalContent;
