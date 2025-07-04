import React from 'react';
import { useAuthStore } from '../../store/authStrore';

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
  const currentUser = useAuthStore((state) => state.user);
  const isMyMessage = message.user.userId === currentUser?.userId;

  console.log(message.user.userId);
  const messageBubbleClasses = isMyMessage
    ? 'bg-blue-500 text-white rounded-lg py-2 px-3 max-w-[70%] self-end'
    : 'bg-gray-700 text-white rounded-lg py-2 px-3 max-w-[70%] self-start';

  const messageContainerClasses = isMyMessage
    ? 'flex justify-end'
    : 'flex justify-start';

  return (
    <div className={`flex flex-col ${messageContainerClasses} my-1`}>
      {!isMyMessage && (
        <div className='mb-1 ml-1 text-xs text-gray-400'>
          {message.user.name}
        </div>
      )}
      <div className={messageBubbleClasses}>
        <div>{message.content}</div>
        {message.timestamp && (
          <div
            className={`mt-1 text-right text-xs ${isMyMessage ? 'text-blue-200' : 'text-gray-400'}`}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
      </div>
    </div>
  );
});

export default MessageItem;
