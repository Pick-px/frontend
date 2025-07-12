import React, { useState } from 'react';
import type { AlbumItemData } from './albumTypes';

interface AlbumDetailModalProps {
  album: AlbumItemData;
  isOpen: boolean;
  onClose: () => void;
}

const AlbumDetailModal: React.FC<AlbumDetailModalProps> = ({
  album,
  isOpen,
  onClose,
}) => {
  const [imageError, setImageError] = useState(false);

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch (error) {
      return '날짜 오류';
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = () => {
    if (!imageError && album.image_url) {
      const link = document.createElement('a');
      link.href = album.image_url;
      link.download = `${album.title}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4'
      onClick={handleBackdropClick}
    >
      <div className='relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-gray-900 shadow-2xl'>
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className='absolute top-4 right-4 z-10 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70'
        >
          <svg
            className='h-6 w-6'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>

        <div className='flex flex-col md:flex-row'>
          {/* 이미지 영역 */}
          <div className='flex-1 bg-gray-800'>
            {!imageError ? (
              <img
                src={album.image_url}
                alt={album.title}
                className='h-full w-full object-contain'
                onError={handleImageError}
              />
            ) : (
              <div className='flex h-64 w-full items-center justify-center md:h-96'>
                <svg
                  className='h-24 w-24 text-gray-600'
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
              </div>
            )}
          </div>

          {/* 정보 영역 */}
          <div className='w-full p-6 md:w-80'>
            <div className='space-y-4'>
              {/* 제목 */}
              <div>
                <h2 className='text-2xl font-bold text-white'>{album.title}</h2>
                <span className='mt-2 inline-block rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-400'>
                  {album.type}
                </span>
              </div>

              {/* 상세 정보 */}
              <div className='space-y-3'>
                <div className='flex items-center justify-between border-b border-gray-700 pb-2'>
                  <span className='text-gray-400'>캔버스 크기</span>
                  <span className='font-medium text-white'>
                    {album.size_x} × {album.size_y}
                  </span>
                </div>

                <div className='flex items-center justify-between border-b border-gray-700 pb-2'>
                  <span className='text-gray-400'>총 픽셀 수</span>
                  <span className='font-medium text-white'>
                    {album.count.toLocaleString()}
                  </span>
                </div>

                <div className='flex items-center justify-between border-b border-gray-700 pb-2'>
                  <span className='text-gray-400'>완성 일시</span>
                  <span className='text-sm font-medium text-white'>
                    {formatDate(album.ended_at)}
                  </span>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-gray-400'>해상도</span>
                  <span className='font-medium text-white'>
                    {(album.size_x * album.size_y).toLocaleString()} px
                  </span>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className='space-y-2 pt-4'>
                <button
                  onClick={handleDownload}
                  disabled={imageError}
                  className='w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-600'
                >
                  <div className='flex items-center justify-center space-x-2'>
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
                        d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                      />
                    </svg>
                    <span>이미지 다운로드</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(album.image_url);
                    // 토스트 알림 추가 가능
                  }}
                  className='w-full rounded-lg bg-gray-700 px-4 py-2 text-white transition-colors hover:bg-gray-600'
                >
                  <div className='flex items-center justify-center space-x-2'>
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
                        d='M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                      />
                    </svg>
                    <span>링크 복사</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumDetailModal;
