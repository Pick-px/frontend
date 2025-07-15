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
  id: number;
  context: string;
  answer: number; // Changed to number to match API response
}

export interface WaitingRoomData extends GameCanvasInfo {
  questions: GameQuestion[];
}

export interface WaitingRoomResponse {
  success: boolean;
  data: WaitingRoomData;
}

const mockWaitingRoomData: WaitingRoomData = {
  canvas_id: 'mock-game-id',
  title: 'Mock Game Canvas',
  type: 'mock',
  startedAt: new Date(Date.now() + 10 * 1000).toISOString(), // 10초 후 시작
  endedAt: new Date(Date.now() + 60 * 1000).toISOString(), // 60초 후 종료
  canvasSize: { width: 50, height: 50 },
  color: '#FF00FF',
  questions: [
    { id: 1, context: 'Mock Question 1', answer: 0 },
    { id: 2, context: 'Mock Question 2', answer: 1 },
  ],
};

export const GameAPI = {
  getWaitingRoomInfo: async (canvasId: string): Promise<WaitingRoomData> => {
    // MockData 활용
    if (canvasId === 'mock-game-id') {
      console.log('Returning mock waiting room info for', canvasId);
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockWaitingRoomData), 500); // 0.5초 지연
      });
    }

    try {
      const response = await apiClient.get<WaitingRoomResponse>(
        `/game/waitingroom`,
        {
          params: { canvasId },
        }
      );
      console.log('Wait', response);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching waiting room info:', error);
      throw error;
    }
  },
};
