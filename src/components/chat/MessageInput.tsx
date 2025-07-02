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
      className='flex-shrink-0 border-t border-white/20 p-4'
    >
      <input
        type='text'
        placeholder='메시지를 입력하세요...'
        value={text}
        onChange={(e) => setText(e.target.value)}
        className='w-full rounded-md border-none bg-black/30 p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500'
      />
    </form>
  );
}
