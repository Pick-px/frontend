// src/components/chat/Chat.tsx (새 파일)

import React, { useState } from 'react';
// import ChatWindow from './ChatWindow'; // 나중에 실제 채팅 기록 컴포넌트
// import ChatInput from './ChatInput';   // 나중에 실제 채팅 입력 컴포넌트

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='fixed bottom-5 left-5 z-50 flex flex-col items-start'>
      <div
        className={`mb-2 h-[500px] w-80 rounded-xl border border-white/20 bg-black/20 shadow-2xl backdrop-blur-lg transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'} `}
      >
        <div className='flex h-full flex-col'>
          <div className='flex-shrink-0 border-b border-white/20 p-4'>
            <h3 className='text-lg font-bold text-white'>전체 채팅</h3>
          </div>

          {/* 메시지 목록 (나중에 ChatWindow 컴포넌트로 교체) */}
          <div className='flex-grow overflow-y-auto p-4 text-white'>
            <div>코딩파트너: 안녕하세요!</div>
            <div>일론 머스크: 픽셀 하나에 우주를 담았습니다.</div>
          </div>

          {/* 메시지 입력창 (나중에 ChatInput 컴포넌트로 교체) */}
          <div className='flex-shrink-0 border-t border-white/20 p-4'>
            <input
              type='text'
              placeholder='메시지를 입력하세요...'
              className='w-full rounded-md border-none bg-black/30 p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500'
            />
          </div>
        </div>
      </div>

      {/* ✨ 4. 채팅창을 열고 닫는 토글 버튼 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white shadow-xl transition-transform hover:bg-blue-600 active:scale-90'
      >
        {/* isOpen 상태에 따라 아이콘을 변경합니다. */}
        {isOpen ? (
          // 닫기 'X' 아이콘
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={2.5}
            stroke='currentColor'
            className='h-8 w-8'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        ) : (
          // 채팅 '말풍선' 아이콘
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={1.5}
            stroke='currentColor'
            className='h-8 w-8'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.794 9 8.25z'
            />
          </svg>
        )}
      </button>
    </div>
  );
}
