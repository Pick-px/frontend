import apiClient from './apiClient';

type Canvas = {
  canvasId: string;
  title: string;
  created_at: string;
  started_at: string;
  ended_at: string;
  try_count: number;
  own_count: number;
  size_x: number;
  size_y: number;
};

export type UserInfoResponse = {
  email: string;
  nickName: string;
  canvases: Canvas[];
};

export const myPageService = {
  async fetchUserInfo(): Promise<UserInfoResponse> {
    try {
      const response = await apiClient.get<UserInfoResponse>('/user/info');
      console.log(response);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      throw error;
    }
  },
};
