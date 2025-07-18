import apiClient from '../services/apiClient';

// 관리자 API 함수들
export const AdminAPI = {
  //임시 API 입니다 (수정 예정)

  // 캔버스 목록 조회
  getCanvases: async () => {
    const response = await apiClient.get('/admin/canvases');
    return response.data;
  },

  // 캔버스 생성
  createCanvas: async (canvasData: {
    title: string;
    type: string;
    width: number;
    height: number;
    duration?: number;
  }) => {
    const response = await apiClient.post('/admin/canvases', canvasData);
    return response.data;
  },

  // 캔버스 삭제
  deleteCanvas: async (canvasId: string) => {
    const response = await apiClient.delete(`/admin/canvases/${canvasId}`);
    return response.data;
  },

  // 대시보드 데이터 조회
  getDashboardData: async () => {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },

  // 관리자 인증 확인
  verifyAdmin: async () => {
    const response = await apiClient.get('/admin/verify');
    return response.data;
  },
};
