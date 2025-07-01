import React from 'react';

export type Message = {
  messageId: string;
  user: {
    userId: string;
    nickname?: string;
  };
  content: string;
};

const MessageItem = React.memo(({ message }: { message: Message }) => {
  return (
    <div className='py-1'>
      <strong className='font-bold text-pink-400'>
        {message.user.nickname}:
      </strong>
      <span className='ml-2 text-white'>{message.content}</span>
    </div>
  );
});

export default MessageItem;
