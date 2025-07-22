import apiClient from '../../services/apiClient';
import { useAuthStore } from '../../store/authStrore';

export const chatService = {
  /**
   * default Canvas의 canvas_id, 소속 그룹 리스트, 전체 채팅 메시지
   * @param canvasId - 조회할 그룹의 ID
   */
  async getChatInitMessages(canvasId: string) {
    console.log('getChatInitMessages 호출됨:', canvasId);
    try {
      const response = await apiClient.get('/group/init/chat', {
        params: { canvas_id: canvasId },
      });

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
      const sortedGroups = groups.sort(
        (a: { group_id: string }, b: { group_id: string }) =>
          Number(a.group_id) - Number(b.group_id)
      );
      return {
        defaultGroupId,
        groups: sortedGroups,
        messages: sortedMessages,
      };
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
      console.log(response.data.data);
      const newMessages = response.data.data.messages.sort(
        (
          a: { timestamp: any; created_at: any },
          b: { timestamp: any; created_at: any }
        ) =>
          new Date(a.timestamp || a.created_at).getTime() -
          new Date(b.timestamp || b.created_at).getTime()
      );
      const madeBy = response.data.data.group.made_by;

      // 메시지를 시간순으로 정렬
      return { newMessages, madeBy };
    } catch (error) {
      console.error(`Failed to fetch messages for group ${groupId}:`, error);
      throw error;
    }
  },

  /**
   * 그룹 이미지 업로드를 위한 URL 요청
   * @param groupId - 그룹 ID
   * @param contentType - 이미지 타입 (예: image/png)
   */
  async getGroupImageUploadUrl(groupId: string, contentType: string) {
    try {
      // authStore에서 토큰 가져오기
      const { accessToken } = useAuthStore.getState();
      const response = await apiClient.post(
        '/group/upload',
        {
          group_id: groupId,
          contentType: contentType,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data.url;
    } catch (error) {
      console.error(
        `Failed to get image upload URL for group ${groupId}:`,
        error
      );
      throw error;
    }
  },
};
