import React from 'react';
import AlbumItem from './AlbumItem';
import type { AlbumItemData } from './albumTypes';

interface AlbumListProps {
  albums: AlbumItemData[];
  loading?: boolean;
  error?: string | null;
  onItemClick?: (item: AlbumItemData) => void;
  onRetry?: () => void;
}

const AlbumList: React.FC<AlbumListProps> = ({
  albums,
  loading = false,
  error = null,
  onItemClick,
  onRetry,
}) => {
  if (loading) {
    return (
      <div className='flex h-32 items-center justify-center'>
        <div className='h-8 w-8 animate-spin rounded-full border-b-2 border-gray-400'></div>
        <span className='ml-2 text-gray-300'>앨범을 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
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
        {onRetry && (
          <button
            onClick={onRetry}
            className='rounded bg-gray-700 px-4 py-2 text-white transition-colors duration-200 hover:bg-gray-600'
          >
            다시 시도
          </button>
        )}
      </div>
    );
  }

  if (albums.length === 0) {
    return (
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
    );
  }

  return (
    <div className='grid grid-cols-3 gap-4 p-4'>
      {albums.map((album) => (
        <AlbumItem key={album.id} item={album} onClick={onItemClick} />
      ))}
    </div>
  );
};

export default AlbumList;
