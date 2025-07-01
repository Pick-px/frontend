// src/services/canvasService.ts

import apiClient from '../services/apiClient';

export const canvasService = {
  /**
   * 특정 캔버스의 모든 픽셀 데이터를 불러옵니다.
   * @param canvasId - 조회할 캔버스의 ID
   */
  async getCanvasPixels(canvasId: string) {
    try {
      const response = await apiClient.get('/canvas/pixels', {
        params: { canvas_id: canvasId },
      });
      console.log(response);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch pixels for canvas ${canvasId}:`, error);
      throw error;
    }
  },

  // 나중에 캔버스 저장, 삭제 등 다른 API가 생기면 여기에 추가합니다.
};
