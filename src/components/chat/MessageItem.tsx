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
  const isMyMessage = message.user.userId === 'me'; // 'me'는 현재 사용자의 userId라고 가정

  const messageBubbleClasses = isMyMessage
    ? 'bg-blue-500 text-white rounded-lg py-2 px-3 max-w-[70%] self-end'
    : 'bg-gray-700 text-white rounded-lg py-2 px-3 max-w-[70%] self-start';

  const messageContainerClasses = isMyMessage
    ? 'flex justify-end'
    : 'flex justify-start';

  return (
    <div className={`flex flex-col ${messageContainerClasses} my-1`}>
      {!isMyMessage && (
        <div className='text-xs text-gray-400 mb-1 ml-1'>{message.user.name}</div>
      )}
      <div className={messageBubbleClasses}>
        <div>{message.content}</div>
        {message.timestamp && (
          <div className={`text-right text-xs mt-1 ${isMyMessage ? 'text-blue-200' : 'text-gray-400'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
});

export default MessageItem;
