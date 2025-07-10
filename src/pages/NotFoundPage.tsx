import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className='flex h-screen w-full flex-col items-center justify-center bg-[#1c1c1c] text-white'>
      <div className='text-center'>
        <h1 className='text-8xl font-bold text-blue-500'>404</h1>
        <img
          src='/empty_box.png'
          alt='Not Found'
          className='mx-auto mb-8 h-40 w-40'
        />

        <p className='mt-4 text-2xl font-semibold'>Canvas Not Found</p>
        <p className='mt-2 text-gray-400'>요청하신 페이지를 찾을 수 없습니다</p>
        <Link
          to='/'
          className='mt-8 inline-block rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-transform duration-200 hover:scale-105 hover:bg-blue-700'
        >
          돌아가기
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
