import apiClient from '../../services/apiClient';

export const chatService = {
  /**
   * default Canvas의 canvas_id, 소속 그룹 리스트, 전체 채팅 메시지
   * @param canvasId - 조회할 그룹의 ID
   */
  async getChatInitMessages(canvasId: string) {
    try {
      const response = await apiClient.get('/init/chat', {
        params: { canvas_id: canvasId },
      });
      console.log(response);
      // return response.data;
      const { defaultGroupId, groups, messages } = response.data.data;
      return { defaultGroupId, groups, messages };
    } catch (error) {
      console.error(`Failed to fetch message for chat ${canvasId}:`, error);
      throw error;
    }
  },

  /**
   * 특정 그룹의 메시지 목록
   * @param groupId - 조회할 그룹의 ID
   */
  async getChatMessages(groupId: string, limit = 30) {
    try {
      const response = await apiClient.get('/chat', {
        // 이 엔드포인트는 예시입니다.
        params: { group_id: groupId, limit },
      });
      // 실제 API에서는 data.messages 형태로 올 수 있습니다.
      return response.data.messages;
    } catch (error) {
      console.error(`Failed to fetch messages for group ${groupId}:`, error);
      throw error;
    }
  },
};
