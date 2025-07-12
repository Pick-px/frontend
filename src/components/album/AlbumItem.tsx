import React, { useState } from 'react';
import type { AlbumItemData } from './albumTypes';

interface AlbumItemProps {
  item: AlbumItemData;
  onClick?: (item: AlbumItemData) => void;
}

const AlbumItem: React.FC<AlbumItemProps> = ({ item, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      return '날짜 오류';
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleClick = () => {
    if (onClick) {
      onClick(item);
    }
  };

  return (
    <div
      className='relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-800 transition-all duration-300 hover:scale-105 hover:shadow-lg'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* 이미지 */}
      {!imageError ? (
        <img
          src={item.image_url}
          alt={item.title}
          className='h-full w-full object-cover'
          onError={handleImageError}
        />
      ) : (
        <div className='flex h-full w-full items-center justify-center bg-gray-700'>
          <svg
            className='h-12 w-12 text-gray-500'
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

      {/* 호버 시 정보 오버레이 */}
      <div
        className={`absolute inset-0 flex flex-col justify-between bg-black/70 p-3 text-white transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* 상단 정보 */}
        <div>
          <h3 className='mb-1 truncate text-sm font-semibold'>{item.title}</h3>
          <p className='text-xs text-gray-300'>{item.type}</p>
        </div>

        {/* 하단 정보 */}
        <div className='space-y-1'>
          <div className='flex items-center justify-between text-xs'>
            <span className='text-gray-300'>크기</span>
            <span className='text-white'>
              {item.size_x} × {item.size_y}
            </span>
          </div>
          <div className='flex items-center justify-between text-xs'>
            <span className='text-gray-300'>픽셀 수</span>
            <span className='text-white'>{item.count.toLocaleString()}</span>
          </div>
          <div className='text-xs text-gray-300'>
            {formatDate(item.ended_at)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumItem;
