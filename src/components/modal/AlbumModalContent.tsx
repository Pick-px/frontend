import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import type { AlbumItemData } from '../album/albumTypes';
import { albumServices } from '../album/albumAPI';

// CSS 애니메이션 스타일 정의
const awardStyles = `
  @keyframes shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  
  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 5px rgba(251, 191, 36, 0.3);
    }
    50% {
      box-shadow: 0 0 15px rgba(251, 191, 36, 0.6);
    }
  }
  
  .award-name {
    background-size: 200% auto;
    animation: shimmer 3s linear infinite;
  }
  
  .award-container {
    animation: glow 2s infinite;
  }
`;

type AlbumModalContentProps = {
  onClose?: () => void;
};

interface ApiResponse {
  isSuccess: boolean;
  code: string;
  message: string;
  data: AlbumItemData[];
}

const AlbumModalContent: React.FC<AlbumModalContentProps> = () => {
  const [albums, setAlbums] = useState<AlbumItemData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 캐러셀 드래그 관련 상태
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // 진행 기간 계산 함수
  const calculateDuration = (createdAt: string, endedAt: string) => {
    try {
      const start = new Date(createdAt);
      const end = new Date(endedAt);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return '1일';
      if (diffDays < 7) return `${diffDays}일`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}주`;
      return `${Math.floor(diffDays / 30)}개월`;
    } catch (error) {
      return '기간 오류';
    }
  };

  // 앨범 목록 가져오기 함수 (고양이 API 사용)
  const fetchAlbums = async () => {
    try {
      setLoading(true);
      setError(null);

      // api 호출
      const response: ApiResponse = await albumServices.getAlbumList();

      if (response.isSuccess) {
        const albumsData: AlbumItemData[] = response.data
          .filter((canvas: AlbumItemData) => {
            return (
              canvas.top_try_user_name !== null &&
              canvas.top_try_user_count !== null
            );
          })
          .map((canvas: AlbumItemData) => ({
            image_url: canvas.image_url,
            title: canvas.title,
            type: canvas.type,
            created_at: canvas.created_at,
            ended_at: canvas.ended_at,
            size_x: canvas.size_x,
            size_y: canvas.size_y,
            participant_count: canvas.participant_count,
            total_try_count: canvas.total_try_count,
            top_try_user_name: canvas.top_try_user_name,
            top_try_user_count: canvas.top_try_user_count,
            top_own_user_name: canvas.top_own_user_name,
            top_own_user_count: canvas.top_own_user_count,
          }));
        setAlbums(albumsData);
      } else {
        setError(response.message || '앨범 목록을 불러오는데 실패했습니다.');
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : '앨범 목록을 불러오는데 실패했습니다.'
      );
      console.error('Error fetching albums:', err);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 앨범 목록 가져오기
  useEffect(() => {
    fetchAlbums();
  }, []);

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (error) {
      return '날짜 오류';
    }
  };

  // 다음 슬라이드로 이동
  const goToNext = () => {
    if (currentIndex < albums.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTranslateX(-(currentIndex + 1) * 100);
    }
  };

  // 이전 슬라이드로 이동
  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setTranslateX(-(currentIndex - 1) * 100);
    }
  };

  // 특정 인덱스로 이동
  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setTranslateX(-index * 100);
  };

  // 드래그 시작
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
    setDragOffset(0);
  };

  // 드래그 중
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = clientX - startX;
    setDragOffset(diff);
  };

  // 드래그 종료
  const handleDragEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);

    // 드래그 거리가 충분하면 슬라이드 변경
    const threshold = 100;
    if (Math.abs(dragOffset) > threshold) {
      if (dragOffset > 0 && currentIndex > 0) {
        goToPrev();
      } else if (dragOffset < 0 && currentIndex < albums.length - 1) {
        goToNext();
      }
    }

    setDragOffset(0);
  };

  // 현재 변환값 계산
  const getCurrentTransform = () => {
    const baseTransform = translateX;
    const dragTransform = isDragging
      ? (dragOffset / window.innerWidth) * 100
      : 0;
    return baseTransform + dragTransform;
  };

  if (loading) {
    return (
      <div className='flex flex-col'>
        <div className='flex-shrink-0 border-b border-white/20 p-4'>
          <h2 className='text-lg font-semibold text-white'>갤러리</h2>
          <p className='mt-1 text-sm text-gray-300'>
            완성된 캔버스 작품들을 확인해보세요.
          </p>
        </div>
        <div className='flex h-96 items-center justify-center p-6'>
          <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-gray-400'></div>
          <span className='ml-2 text-gray-300'>앨범을 불러오는 중...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex flex-col'>
        <div className='flex-shrink-0 border-b border-white/20 p-4'>
          <h2 className='text-lg font-semibold text-white'>앨범 갤러리</h2>
          <p className='mt-1 text-sm text-gray-300'>
            완성된 캔버스 작품들을 확인해보세요.
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
            onClick={fetchAlbums}
            className='rounded bg-gray-700 px-4 py-2 text-white transition-colors duration-200 hover:bg-gray-600'
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className='flex flex-col'>
        <div className='flex-shrink-0 border-b border-white/20 p-4'>
          <h2 className='text-lg font-semibold text-white'>앨범 갤러리</h2>
          <p className='mt-1 text-sm text-gray-300'>
            완성된 캔버스 작품들을 확인해보세요.
          </p>
        </div>
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
          <p className='text-gray-400'>저장된 앨범이 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex max-h-[90vh] min-h-[60vh] flex-col'>
      {/* CSS 애니메이션 스타일 */}
      <style dangerouslySetInnerHTML={{ __html: awardStyles }} />

      {/* 헤더 */}
      <div className='flex-shrink-0 border-b border-white/20 p-3 sm:p-4'>
        <div className='flex items-center justify-between'>
          {/* 왼쪽: 네비게이션 버튼 */}
          <div className='flex items-center space-x-1 sm:space-x-2'>
            <button
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className='rounded-full bg-white/10 p-1.5 text-gray-400 transition-colors hover:bg-white/20 hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50 sm:p-2'
            >
              <svg
                className='h-4 w-4 sm:h-5 sm:w-5'
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
              onClick={goToNext}
              disabled={currentIndex === albums.length - 1}
              className='rounded-full bg-white/10 p-1.5 text-gray-400 transition-colors hover:bg-white/20 hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50 sm:p-2'
            >
              <svg
                className='h-4 w-4 sm:h-5 sm:w-5'
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

          {/* 중앙: 제목과 페이지 정보 */}
          <div className='flex-1 text-center'>
            <h2 className='text-base font-semibold text-white sm:text-lg'>
              앨범 갤러리
            </h2>
            <p className='mt-1 text-xs text-gray-300 sm:text-sm'>
              {currentIndex + 1} / {albums.length}
            </p>
          </div>

          {/* 오른쪽: X버튼을 위한 공간 확보 */}
          <div className='w-16 sm:w-20'></div>
        </div>
      </div>

      {/* 캐러셀 컨테이너 */}
      <div className='flex flex-1 items-center overflow-hidden'>
        <div
          ref={carouselRef}
          className='flex h-full w-full transition-transform duration-300 ease-out'
          style={{
            transform: `translateX(${getCurrentTransform()}%)`,
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          {albums.map((album, index) => (
            <div
              key={index}
              className='flex w-full flex-shrink-0 items-center justify-center p-2 sm:p-4'
              style={{ minWidth: '100%' }}
            >
              {/* 반응형 앨범 카드 */}
              <div
                className='flex w-full max-w-xs flex-col rounded-lg shadow-xl sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl'
                style={{
                  maxHeight: 'calc(100vh - 180px)', // 헤더와 인디케이터 공간 확보
                  height: 'fit-content',
                }}
              >
                {/* 이미지 - 화면 높이에 따라 동적 크기 조정 */}
                <div
                  className='flex-shrink-1 overflow-hidden rounded-t-lg bg-gray-700'
                  style={{
                    aspectRatio: '1 / 1',
                    maxHeight: 'calc(100vh - 350px)', // 정보 영역을 위한 공간 확보
                    minHeight: '200px', // 최소 이미지 크기
                    height: 'auto',
                  }}
                >
                  <img
                    src={album.image_url}
                    alt={album.title}
                    className='h-full w-full object-cover'
                    draggable={false}
                  />
                </div>

                {/* 정보 영역 - 고정 높이로 항상 표시 */}
                <div className='flex-shrink-0 p-2 sm:p-3 md:p-4'>
                  {/* 제목과 타입 */}
                  <div className='mb-2 flex items-center justify-between sm:mb-3'>
                    <h3
                      className='text-sm font-bold text-white sm:text-base md:text-lg'
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {album.title}
                    </h3>
                    <span className='inline-block rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-400'>
                      {album.type}
                    </span>
                  </div>

                  {/* 통계 정보 - 세로 나열 */}
                  <div className='mb-2 space-y-2 sm:mb-3 md:mb-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-gray-400'>크기</span>
                      <span className='text-xs font-semibold text-white sm:text-sm'>
                        {album.size_x}×{album.size_y}
                      </span>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-gray-400'>진행 기간</span>
                      <span className='text-xs font-semibold text-white sm:text-sm'>
                        {`${formatDate(album.created_at)} ~ ${formatDate(album.ended_at)}(${calculateDuration(album.created_at, album.ended_at)})`}
                      </span>
                    </div>
                    {album.top_try_user_name && (
                      <div className='flex items-center justify-between'>
                        <span className='text-xs text-gray-400'>참여왕</span>
                        <span className='text-xs font-semibold sm:text-sm'>
                          <span className='inline-flex items-center gap-1 rounded-md bg-blue-500/10 px-2 py-1'>
                            <span className='text-yellow-400'>🎨</span>
                            <span className='bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-bold text-transparent'>
                              {album.top_try_user_name}
                            </span>
                            <span className='text-white'>
                              ({album.top_try_user_count}회)
                            </span>
                          </span>
                        </span>
                      </div>
                    )}
                    {album.top_own_user_name ? (
                      <div className='flex items-center justify-between'>
                        <span className='text-xs text-gray-400'>점유왕</span>
                        <span className='text-xs font-semibold sm:text-sm'>
                          <span className='award-container relative inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-500/20 to-red-500/20 px-2 py-1'>
                            <span className='text-yellow-400'>👑</span>
                            <span className='award-name bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text font-bold text-transparent'>
                              {album.top_own_user_name}
                            </span>
                            <span className='text-white'>
                              ({album.top_own_user_count}개)
                            </span>
                            <span className='absolute -inset-[1px] -z-10 rounded-md bg-yellow-400/10 blur-[2px]'></span>
                          </span>
                        </span>
                      </div>
                    ) : (
                      <div className='flex items-center justify-between'>
                        <span className='text-xs text-gray-400'>점유왕</span>
                        <span className='text-xs font-semibold sm:text-sm'>
                          <span className='award-container relative inline-flex items-center gap-1 rounded-md bg-gradient-to-r from-amber-500/20 to-red-500/20 px-2 py-1'>
                            <span className='text-yellow-400'></span>
                            <span className='award-name bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text font-bold text-transparent'>
                              승자 없음
                            </span>

                            <span className='absolute -inset-[1px] -z-10 rounded-md bg-yellow-400/10 blur-[2px]'></span>
                          </span>
                        </span>
                      </div>
                    )}

                    <div className='flex items-center justify-between'>
                      <span className='text-xs text-gray-400'>
                        총 시도 픽셀 수 / 총 참여자
                      </span>
                      <span className='text-xs font-semibold text-white sm:text-sm'>
                        {`${album.total_try_count}개 / ${album.participant_count}명`}
                      </span>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className='flex gap-2'>
                    <button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = album.image_url;
                        link.download = `${album.title}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      className='flex-1 rounded-lg bg-blue-600 px-2 py-1.5 text-xs text-white transition-colors hover:bg-blue-700 sm:px-3 sm:py-2 sm:text-sm'
                    >
                      다운로드
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(album.image_url);
                        toast.success('링크가 복사되었습니다!', {
                          position: 'top-center',
                          autoClose: 2000,
                          hideProgressBar: true,
                          theme: 'dark',
                        });
                      }}
                      className='flex-1 rounded-lg bg-gray-700 px-2 py-1.5 text-xs text-white transition-colors hover:bg-gray-600 sm:px-3 sm:py-2 sm:text-sm'
                    >
                      공유
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 인디케이터 */}
      <div className='flex-shrink-0 p-2 sm:p-4'>
        <div className='flex justify-center space-x-1 sm:space-x-2'>
          {albums.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-1.5 w-1.5 rounded-full transition-colors sm:h-2 sm:w-2 ${
                index === currentIndex ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlbumModalContent;
