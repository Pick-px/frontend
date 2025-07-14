import apiClient from '../../services/apiClient';

export const albumServices = {
  async getAlbumList() {
    try {
      const response = await apiClient.get(`/gallery`);
      console.log('get', response);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch albumList `);
      throw error;
    }
  },
};
