import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className='flex h-screen w-full flex-col items-center justify-center bg-[#1a1a1a] text-white'>
      <div className='text-center'>
        <img
          src='/empty_box.png'
          alt='Not Found'
          className='mx-auto mb-8 h-40 w-40'
        />
        <h1
          className='text-8xl text-yellow-400'
          style={{
            fontFamily: '"Press Start 2P", cursive',
            textShadow: '4px 4px 0px #000000',
          }}
        >
          404
        </h1>
        <p
          className='mt-6 text-2xl'
          style={{ fontFamily: '"Press Start 2P", cursive' }}
        >
          Canvas Not Found
        </p>
        <p className='mt-4 text-gray-400'>요청하신 페이지를 찾을 수 없습니다</p>
        <Link
          to='/'
          className='mt-8 inline-block rounded-none bg-blue-600 px-8 py-4 font-mono text-lg text-white transition-all hover:bg-blue-700 hover:shadow-lg'
          style={{ textShadow: '2px 2px 0px #000000' }}
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
