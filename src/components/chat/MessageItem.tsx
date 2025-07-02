import React from 'react';

export type Message = {
  messageId: string;
  user: {
    userId: string;
    name?: string;
  };
  content: string;
  timestamp?: string; // timestamp 타입도 추가해두면 좋습니다.
};

const MessageItem = React.memo(({ message }: { message: Message }) => {
  return (
    <div className='py-1'>
      <strong className='font-bold text-pink-400'>{message.user.name}:</strong>
      <span className='ml-2 text-white'>{message.content}</span>
    </div>
  );
});

export default MessageItem;
