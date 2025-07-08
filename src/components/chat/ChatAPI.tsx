import apiClient from '../../services/apiClient';

export const chatService = {
  /**
   * default Canvas의 canvas_id, 소속 그룹 리스트, 전체 채팅 메시지
   * @param canvasId - 조회할 그룹의 ID
   */
  async getChatInitMessages(canvasId: string) {
    console.log('getChatInitMessages 호출됨:', canvasId);
    try {
      console.log('API 요청 시작');
      const response = await apiClient.get('/group/init/chat', {
        params: { canvas_id: canvasId },
      });
      console.log(response);
      const { defaultGroupId, groups, messages } = response.data.data;
      // 메시지를 시간순으로 정렬 (오래된 것부터)
      const sortedMessages = messages.sort(
        (
          a: { timestamp: any; created_at: any },
          b: { timestamp: any; created_at: any }
        ) =>
          new Date(a.timestamp || a.created_at).getTime() -
          new Date(b.timestamp || b.created_at).getTime()
      );
      return { defaultGroupId, groups, messages: sortedMessages };
    } catch (error) {
      console.error(`Failed to fetch message for chat ${canvasId}:`, error);
      throw error;
    }
  },

  /**
   * 특정 그룹의 메시지 목록
   * @param groupId - 조회할 그룹의 ID
   */
  async getChatMessages(groupId: string, limit = 50) {
    try {
      const response = await apiClient.get('group/chat', {
        // 이 엔드포인트는 예시입니다.
        params: { group_id: groupId, limit },
      });
      // 실제 API에서는 data.messages 형태로 올 수 있습니다.
      const messages = response.data.data.messages;
      // 메시지를 시간순으로 정렬
      return messages.sort(
        (
          a: { timestamp: any; created_at: any },
          b: { timestamp: any; created_at: any }
        ) =>
          new Date(a.timestamp || a.created_at).getTime() -
          new Date(b.timestamp || b.created_at).getTime()
      );
    } catch (error) {
      console.error(`Failed to fetch messages for group ${groupId}:`, error);
      throw error;
    }
  },
};
