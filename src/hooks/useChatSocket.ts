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
  onMessageReceived: (message: ChatMessage) => void,
  onChatError: (error: ChatError) => void,
  group_id: string,
  user_id: string
) => {
  useEffect(() => {
    // 빈 값이거나 anonymous면 소켓 연결 안 함
    // if (!group_id || !user_id || group_id === '1' && user_id === 'anonymous') {
    //   console.log('소켓 연결 스킵: 빈 값');
    //   return;
    // }

    // 채팅 이벤트 리스너 등록
    socketService.onChatMessage(onMessageReceived);
    socketService.onChatError(onChatError);

    // 채팅방 참여
    socketService.joinChat({ group_id, user_id });
    console.log(`채팅방 참여: group_id=${group_id}, user_id=${user_id}`);

    return () => {
      // 클린업 시 이벤트 리스너 제거
      socketService.offChatMessage(onMessageReceived);
      socketService.offChatError(onChatError);
    };
  }, [group_id, user_id, onMessageReceived, onChatError]);

  const sendMessage = useCallback(
    (message: string) => {
      if (!group_id || !user_id) return;

      // 실제 소켓 전송
      socketService.sendChat({ group_id, user_id, message });

      // 백엔드 없이 테스트: 3초 후 가짜 응답 시뮬레이션
      setTimeout(() => {
        const fakeResponse: ChatMessage = {
          id: Date.now(),
          user: { id: parseInt(user_id.split('@')[0]) || 123, user_name: user_id },
          message: `"${message}"에 대한 내 응답`,
          created_at: new Date().toISOString(),
        };
        console.log('가짜 메시지 수신 시뮬레이션:', fakeResponse);
        onMessageReceived(fakeResponse);
      }, 3000);
    },
    [group_id, user_id, onMessageReceived]
  );

  return { sendMessage };
};
