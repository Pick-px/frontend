import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStrore';
import { useModalStore } from '../../store/modalStore';

type MessageInputProps = {
  onSendMessage: (message: string) => void;
};

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [text, setText] = useState('');

  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const openLoginModal = useModalStore((state) => state.openLoginModal);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      openLoginModal();
      return;
    }

    if (!text.trim()) return;
    onSendMessage(text);
    setText('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='flex-shrink-0 border-t border-white/30 p-3'
    >
      <div className='flex gap-2'>
        <input
          type='text'
          placeholder='메시지를 입력하세요...'
          value={text}
          onChange={(e) => setText(e.target.value)}
          className='flex-1 rounded-lg border border-white/20 bg-white/10 p-2 text-sm text-white placeholder-gray-300 focus:border-blue-500 focus:ring-blue-500 outline-none'
        />
        <button
          type='submit'
          className='px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={2}
            stroke='currentColor'
            className='w-4 h-4'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5'
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
