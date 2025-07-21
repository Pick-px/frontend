import React, { useRef, useEffect } from 'react';
import MessageItem, { type Message } from './MessageItem';

type MessageListProps = {
  messages: Message[];
};

export default function MessageList({ messages }: MessageListProps) {
  const listEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // iOS Safari 터치 스크롤을 강제로 활성화
  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    // 전역 touch-action을 무시하고 강제로 스크롤 활성화
    element.style.touchAction = 'pan-y';
    (element.style as any).webkitOverflowScrolling = 'touch';

    const handleTouchStart = (e: TouchEvent) => {
      // 이벤트 전파를 막아 전역 설정 우회
      e.stopPropagation();
    };

    const handleTouchMove = (e: TouchEvent) => {
      // 이벤트 전파를 막아 전역 설정 우회
      e.stopPropagation();
    };

    element.addEventListener('touchstart', handleTouchStart, {
      passive: true,
      capture: true,
    });
    element.addEventListener('touchmove', handleTouchMove, {
      passive: true,
      capture: true,
    });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart, true);
      element.removeEventListener('touchmove', handleTouchMove, true);
    };
  }, []);

  return (
    <div
      ref={scrollRef}
      className='flex-1 rounded-lg p-3'
      style={{
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
        touchAction: 'pan-y',
        height: '320px',
        maxHeight: '320px',
        minHeight: '320px',
        position: 'relative',
        zIndex: 1,
      }}
    >
      {messages.map((msg) => (
        <MessageItem key={msg.messageId} message={msg} />
      ))}
      <div ref={listEndRef} />
    </div>
  );
}
