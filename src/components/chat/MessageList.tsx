import React, { useRef, useEffect } from 'react';
import MessageItem, { type Message } from './MessageItem';

type MessageListProps = {
  messages: Message[];
};

export default function MessageList({ messages }: MessageListProps) {
  const listEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className='flex-grow overflow-y-auto p-4'>
      {messages.map((msg) => (
        <MessageItem key={msg.messageId} message={msg} />
      ))}
      <div ref={listEndRef} />
    </div>
  );
}
