import { useEffect, useCallback } from 'react';
import socketService from '../services/socketService';

interface ChatMessage {
  id: number;
  user: { id: number; user_name: string };
  message: string;
  created_at: string;
}

interface ChatError {
  message: string;
}

export const useChatSocket = (
  onMessageReceived: (message: any) => void,
  onChatError: (error: ChatError) => void,
  group_id: string,
  user_id: string,
  onImageReceived?: (imageData: any) => void
) => {
  useEffect(() => {
    // 유효하지 않은 group_id이면 소켓 연결 안 함
    if (!group_id || group_id === '0' || !user_id) {
      return;
    }

    // 채팅 이벤트 리스너 등록
    socketService.onChatMessage(onMessageReceived);
    socketService.onChatError(onChatError);

    // 이미지 업로드 알림 이벤트 리스너 등록
    if (onImageReceived) {
      socketService.onSendImage(onImageReceived);
    }

    // 채팅방 참여
    socketService.joinChat({ group_id });

    return () => {
      // 클린업 시 이벤트 리스너 제거
      socketService.offChatMessage(onMessageReceived);
      socketService.offChatError(onChatError);

      // 이미지 업로드 알림 이벤트 리스너 제거
      if (onImageReceived) {
        socketService.offSendImage(onImageReceived);
      }
    };
  }, [group_id, user_id, onChatError]);

  const sendMessage = useCallback(
    (message: string) => {
      if (!group_id) return;

      // 실제 소켓 전송
      socketService.sendChat({ group_id, message });
    },
    [group_id]
  );

  const sendImageMessage = useCallback(
    (imageData: {
      url: string;
      x: number;
      y: number;
      group_id: string;
      width: number;
      height: number;
    }) => {
      if (!group_id) return;

      // 이미지 업로드 소켓 전송
      socketService.sendImageMessage({
        ...imageData,
      });
    },
    [group_id]
  );

  const leaveChat = useCallback(() => {
    if (!group_id) return;
    socketService.leaveChat({ group_id });
  }, [group_id]);

  return { sendMessage, sendImageMessage, leaveChat };
};
