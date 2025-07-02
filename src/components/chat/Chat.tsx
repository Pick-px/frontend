// src/components/chat/Chat.tsx

import React, { useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import type { Message } from './MessageItem';

// 임시로 사용할 가짜 메시지 데이터
const DUMMY_MESSAGES: Message[] = [
  {
    messageId: '1',
    user: { userId: '1', nickname: '코딩파트너' },
    content: '안녕하세요!',
  },
  {
    messageId: '2',
    user: { userId: '2', nickname: '일론 머스크' },
    content: '픽셀 하나에 우주를 담았습니다.',
  },
];

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(DUMMY_MESSAGES);

  // 메시지 전송 버튼을 눌렀을 때, 콘솔에만 찍어보는 임시 함수
  const handleSendMessage = (text: string) => {
    console.log('보낼 메시지:', text);
    const newMessage: Message = {
      messageId: Date.now().toString(),
      user: { userId: 'me', nickname: '나' },
      content: text,
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <div className='fixed bottom-5 left-5 z-50 flex flex-col items-start'>
      <div
        className={`mb-2 flex h-[500px] w-80 flex-col rounded-xl border border-white/20 bg-black/20 shadow-2xl backdrop-blur-lg transition-all duration-300 ease-in-out ${isOpen ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'} `}
      >
        <div className='flex h-full flex-col'>
          <div className='flex-shrink-0 border-b border-white/20 p-4'>
            <h3 className='text-lg font-bold text-white'>전체 채팅</h3>
          </div>

          <MessageList messages={messages} />
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white shadow-xl transition-transform hover:bg-blue-600 active:scale-90'
      >
        {isOpen ? (
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
