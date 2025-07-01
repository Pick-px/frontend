// src/hooks/useChatSocket.ts

import { useEffect, useCallback } from 'react';
import { chatSocketService } from './chatService';
import type { Message } from './MessageItem';

type UseChatSocketParams = {
  canvas_id: string;
  onNewMessage: (message: Message) => void;
};

export function useChatSocket({
  canvas_id,
  onNewMessage,
}: UseChatSocketParams) {
  useEffect(() => {
    if (canvas_id) {
      chatSocketService.connect(canvas_id);
    }

    chatSocketService.onNewMessage(onNewMessage);

    return () => {
      chatSocketService.disconnect();
    };
  }, [canvas_id, onNewMessage]);

  const sendMessage = useCallback((content: string) => {
    chatSocketService.sendMessage(content);
  }, []);

  return { sendMessage };
}
