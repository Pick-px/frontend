import React from 'react';
import { useAuthStore } from '../../store/authStrore';
import { useCanvasUiStore } from '../../store/canvasUiStore';
import { useChatStore } from '../../store/chatStore';

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
  const setTargetPixel = useCanvasUiStore((state) => state.setTargetPixel);
  const isMyMessage = message.user.userId === currentUser?.userId;
  const { leader } = useChatStore();

  const handleCoordinateClick = (x: number, y: number) => {
    setTargetPixel({ x, y });
  };

  const renderMessageContent = (content: string) => {
    const parts: React.ReactNode[] = [];
    const regex = /\((\d+),(\d+)\)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      const [fullMatch, xStr, yStr] = match;
      const x = parseInt(xStr, 10);
      const y = parseInt(yStr, 10);

      // Add the text before the coordinate
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }

      // Add the clickable coordinate
      parts.push(
        <span
          key={match.index}
          className='cursor-pointer text-blue-400 hover:underline'
          onClick={() => handleCoordinateClick(x, y)}
        >
          {fullMatch}
        </span>
      );
      lastIndex = regex.lastIndex;
    }

    // Add any remaining text after the last coordinate
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts;
  };

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
          {leader === message.user.userId
            ? `👑 ${message.user.name}`
            : message.user.name}
        </div>
      )}
      <div className={messageBubbleClasses}>
        <div>{renderMessageContent(message.content)}</div>
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
