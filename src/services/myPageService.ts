import apiClient from './apiClient';
import { dummyUserInfo } from '../data/dummyUserInfo';

type Canvas = {
  title: string;
  created_at: string;
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
      // return new Promise((resolve) => {
      //   setTimeout(() => {
      //     resolve(dummyUserInfo);
      //   }, 500);
      // });
    } catch (error) {
      console.error('Failed to fetch user info:', error);
      throw error;
    }
  },
};
