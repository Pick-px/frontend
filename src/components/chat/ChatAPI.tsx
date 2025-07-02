import apiClient from '../../services/apiClient';

export const chatService = {
  /**
   * default Canvas의 canvas_id, 소속 그룹 리스트, 전체 채팅 메시지
   * @param canvasId - 조회할 그룹의 ID
   */
  async getChatInitMessages(canvasId: string) {
    try {
      const response = await apiClient.get('/chat/init', {
        params: { canvas_id: canvasId },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch message for chat ${canvasId}:`, error);
      throw error;
    }
  },

  /**
   * 특정 그룹의 메시지 목록
   * @param groupId - 조회할 그룹의 ID
   */
  async getChatMessages(groupId: string) {
    try {
      const response = await apiClient.get('/chat/messages', {
        // 이 엔드포인트는 예시입니다.
        params: { group_id: groupId },
      });
      // 실제 API에서는 data.messages 형태로 올 수 있습니다.
      return response.data.messages || response.data;
    } catch (error) {
      console.error(`Failed to fetch messages for group ${groupId}:`, error);
      throw error;
    }
  },
};
