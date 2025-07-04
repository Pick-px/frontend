// Request시 AT 헤더 추가 및 만료시 재발급

// src/services/apiClient.ts (수정)

import axios from 'axios';
import { useAuthStore } from '../store/authStrore';
import socketService from './socketService';
import { useCanvasStore } from '../store/canvasStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://pick-px.com/api',
  withCredentials: true, // 쿠키 주고 받기위함
});

// request 전 intercept & AT 확인
apiClient.interceptors.request.use(
  (config) => {
    // Zustand 스토어에서 액세스 토큰가져오기.
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      // 토큰이 있으면 Authorization 헤더 추가.
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// AT 만료시 RT를 활용한 재발급 로직
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // 401 unAuthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await apiClient.post('/auth/refresh');
        // console.log(res);

        // 새로 발급받은 AT를 응답 헤더에서 꺼냅니다.
        // const newAccessToken = res.data.accessToken;
        // console.log(res);
        const authHeader = res.headers['authorization'];
        const newAccessToken = authHeader?.split(' ')[1];

        // 전역 스토어의 토큰을 업데이트
        useAuthStore
          .getState()
          .setAuth(newAccessToken, useAuthStore.getState().user!);

        // 새 토큰으로 교체하여 로그인 처리
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        // 소켓 끊고 재연결

        // Hook❌
        // const canvas_id = useCanvasStore((state) => state.canvas_id);
        // 일반함수
        const canvas_id = useCanvasStore.getState().canvas_id;
        socketService.disconnect();
        socketService.connect(canvas_id);

        return apiClient(originalRequest);
      } catch (refreshError) {
        // RT마저 만료되면 로그아웃
        useAuthStore.getState().clearAuth();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
