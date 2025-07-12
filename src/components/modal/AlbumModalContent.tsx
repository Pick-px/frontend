import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import type { AlbumItemData } from '../album/types';

type AlbumModalContentProps = {
  onClose?: () => void;
};

const AlbumModalContent: React.FC<AlbumModalContentProps> = ({ onClose }) => {
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

  // 앨범 목록 가져오기 함수 (고양이 API 사용)
  const fetchAlbums = async () => {
    try {
      setLoading(true);
      setError(null);

      // The Cat API에서 고양이 이미지들 가져오기
      const response = await fetch(
        'https://api.thecatapi.com/v1/images/search?limit=12&size=med'
      );

      if (!response.ok) {
        throw new Error('고양이 이미지를 불러오는데 실패했습니다.');
      }

      const catImages = await response.json();

      // 고양이 이미지 데이터를 앨범 형태로 변환
      const mockAlbums: AlbumItemData[] = catImages.map(
        (cat: any, index: number) => {
          const canvasTypes = [
            'public',
            'event',
            'special',
            'community',
            'seasonal',
          ];
          const canvasTitles = [
            '고양이 천국 캔버스',
            '냥이 축제 이벤트',
            '고양이 카페 특별전',
            '커뮤니티 냥이 아트',
            '봄맞이 고양이 테마',
            '여름 고양이 해변',
            '가을 고양이 단풍',
            '겨울 고양이 눈놀이',
            '고양이 우주 탐험',
            '레트로 고양이 스타일',
            '미래형 사이버 고양이',
            '고양이 판타지 월드',
          ];

          // 랜덤한 캔버스 크기 생성
          const sizes = [
            { x: 500, y: 500 },
            { x: 800, y: 600 },
            { x: 1000, y: 800 },
            { x: 1200, y: 900 },
            { x: 600, y: 400 },
            { x: 900, y: 700 },
          ];
          const randomSize = sizes[Math.floor(Math.random() * sizes.length)];

          // 랜덤한 날짜 생성 (최근 6개월 내)
          const randomDate = new Date();
          randomDate.setDate(
            randomDate.getDate() - Math.floor(Math.random() * 180)
          );

          return {
            id: index + 1,
            image_url: cat.url,
            title: canvasTitles[index] || `고양이 캔버스 ${index + 1}`,
            type: canvasTypes[Math.floor(Math.random() * canvasTypes.length)],
            ended_at: randomDate.toISOString(),
            size_x: randomSize.x,
            size_y: randomSize.y,
            count:
              randomSize.x * randomSize.y + Math.floor(Math.random() * 50000),
          };
        }
      );

      setAlbums(mockAlbums);
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
          <h2 className='text-lg font-semibold text-white'>앨범 갤러리</h2>
          <p className='mt-1 text-sm text-gray-300'>
            완성된 캔버스 작품들을 확인해보세요. 🐱
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
            완성된 캔버스 작품들을 확인해보세요. 🐱
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
            완성된 캔버스 작품들을 확인해보세요. 🐱
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

  const currentAlbum = albums[currentIndex];

  return (
    <div className='flex max-h-[85vh] flex-col'>
      {/* 헤더 */}
      <div className='flex-shrink-0 border-b border-white/20 p-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-white'>앨범 갤러리</h2>
            <p className='mt-1 text-sm text-gray-300'>
              {currentIndex + 1} / {albums.length}
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <button
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className='rounded-full bg-white/10 p-2 text-gray-400 transition-colors hover:bg-white/20 hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <svg
                className='h-5 w-5'
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
              className='rounded-full bg-white/10 p-2 text-gray-400 transition-colors hover:bg-white/20 hover:text-gray-300 disabled:cursor-not-allowed disabled:opacity-50'
            >
              <svg
                className='h-5 w-5'
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
        </div>
      </div>

      {/* 캐러셀 컨테이너 */}
      <div className='flex-1 overflow-hidden'>
        <div
          ref={carouselRef}
          className='flex h-full transition-transform duration-300 ease-out'
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
              key={album.id}
              className='w-full flex-shrink-0 p-4'
              style={{ minWidth: '100%' }}
            >
              {/* 인스타그램 스타일 카드 */}
              <div className='mx-auto max-w-md rounded-lg bg-gray-800 shadow-xl'>
                {/* 이미지 */}
                <div className='aspect-square overflow-hidden rounded-t-lg bg-gray-700'>
                  <img
                    src={album.image_url}
                    alt={album.title}
                    className='h-full w-full object-cover'
                    draggable={false}
                  />
                </div>

                {/* 정보 영역 */}
                <div className='p-4'>
                  {/* 제목과 타입 */}
                  <div className='mb-3'>
                    <h3 className='text-lg font-bold text-white'>
                      {album.title}
                    </h3>
                    <span className='mt-1 inline-block rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-400'>
                      {album.type}
                    </span>
                  </div>

                  {/* 통계 정보 */}
                  <div className='mb-4 grid grid-cols-3 gap-4'>
                    <div className='text-center'>
                      <div className='text-sm font-semibold text-white'>
                        {album.size_x}×{album.size_y}
                      </div>
                      <div className='text-xs text-gray-400'>크기</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-sm font-semibold text-white'>
                        {(album.count / 1000).toFixed(0)}K
                      </div>
                      <div className='text-xs text-gray-400'>픽셀</div>
                    </div>
                    <div className='text-center'>
                      <div className='text-sm font-semibold text-white'>
                        {formatDate(album.ended_at)}
                      </div>
                      <div className='text-xs text-gray-400'>완성일</div>
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
                      className='flex-1 rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-700'
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
                      className='flex-1 rounded-lg bg-gray-700 px-3 py-2 text-sm text-white transition-colors hover:bg-gray-600'
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
      <div className='flex-shrink-0 p-4'>
        <div className='flex justify-center space-x-2'>
          {albums.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
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
