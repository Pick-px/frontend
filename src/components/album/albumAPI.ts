import apiClient from '../../services/apiClient';

export const albumServices = {
  async getAlbumList(userId: string | undefined, canvasId: string) {
    try {
      const response = await apiClient.get(`/album`, {
        params: { user_id: userId, canvas_id: canvasId },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch albumList ${userId}`, userId);
      throw error;
    }
  },
};
