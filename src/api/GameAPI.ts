import apiClient from '../services/apiClient';

export interface GameCanvasInfo {
  canvas_id: string; // Changed to canvas_id to match API response
  title: string;
  type: string;
  startedAt: string;
  endedAt: string;
  canvasSize: { width: number; height: number };
  color: string; // Added color to GameCanvasInfo
}

export interface GameQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number;
}

export interface WaitingRoomData extends GameCanvasInfo {
  questions: GameQuestion[];
}

export interface WaitingRoomResponse {
  success: boolean;
  data: WaitingRoomData;
}

// 목업 데이터 제거

export const GameAPI = {
  /**
   * 게임 대기실 정보를 가져옵니다.
   * @param canvasId 캔버스 ID
   * @returns 게임 대기실 정보
   */
  getWaitingRoomInfo: async (canvasId: string): Promise<WaitingRoomData> => {
    try {
      const response = await apiClient.get<WaitingRoomResponse>(
        `/game/waitingroom`,
        {
          params: { canvasId },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching waiting room info:', error);
      throw error;
    }
  },
  
  /**
   * 게임 캔버스 데이터를 가져옵니다.
   * @param canvasId 캔버스 ID
   * @returns 게임 캔버스 정보
   */
  fetchGameCanvasData: async (canvasId: string): Promise<WaitingRoomData> => {
    try {
      const response = await apiClient.get<WaitingRoomResponse>(
        `/game/waitingroom`,
        {
          params: { canvasId },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching game canvas data:', error);
      throw error;
    }
  }
};
