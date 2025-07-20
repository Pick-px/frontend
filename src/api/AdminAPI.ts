import { data } from 'react-router-dom';
import apiClient from '../services/apiClient';

// 관리자 API 함수들
export const AdminAPI = {
  // 캔버스 리스트
  getCanvases: async () => {
    const response = await apiClient.get('/admin/canvas/list');
    // 백엔드 응답의 canvasId를 id로 매핑
    return response.data.map((canvas: any) => ({
      ...canvas,
      id: canvas.canvasId,
    }));
  },

  // 캔버스 생성
  createCanvas: async (canvasData: {
    title: string;
    type: string;
    // created_at: string;
    started_at: string;
    ended_at: string | null;
    size_x: number;
    size_y: number;
  }) => {
    const response = await apiClient.post('/admin/canvas', canvasData);
    return response.data;
  },

  // 캔버스 삭제
  deleteCanvas: async (canvasId: number) => {
    const response = await apiClient.delete('/admin/canvas', {
      data: {
        canvasId: canvasId,
      },
    });

    return response.data;
  },

  // 게임 강제종료
  forceEnd: async (canvasId: number) => {
    // POST 요청의 body는 두 번째 인자로 바로 객체를 전달합니다.
    const response = await apiClient.post('/admin/force_end', {
      canvasId: canvasId,
    });
    return response.data;
  },
};
