import { CanvasType } from '../components/canvas/canvasConstants';
import apiClient from '../services/apiClient';

export interface Canvas {
  canvasId: number;
  title: string;
  created_at: string;
  size_x: number;
  size_y: number;
  type: CanvasType;
  ended_at: string;
  started_at?: string; // Add started_at field
  status?: 'active' | 'inactive' | 'archived';
  // 향후 이미지 관련 필드 추가 예정
  // thumbnail?: string;        // 썸네일 이미지 URL
  // preview_image?: string;    // 미리보기 이미지 URL
  // canvas_data?: string;      // 캔버스 픽셀 데이터 (JSON 또는 Base64)
}

export interface CanvasListResponse {
  canvases: Canvas[];
  total?: number;
  page?: number;
  limit?: number;
}

// 향후 이미지 데이터 형식 예시
/*
interface CanvasImageData {
  pixels: Array<Array<{
    r: number;  // Red (0-255)
    g: number;  // Green (0-255)
    b: number;  // Blue (0-255)
    a: number;  // Alpha (0-1)
  }>>;
  width: number;
  height: number;
  format: 'RGBA' | 'RGB' | 'PNG' | 'JPEG';
}

interface CanvasWithImage extends Canvas {
  image_data?: CanvasImageData;
  thumbnail_base64?: string;    // Base64 인코딩된 썸네일
  last_modified?: string;       // 마지막 수정 시간
  file_size?: number;          // 파일 크기 (bytes)
}
*/

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

  // 활성 캔버스 목록 조회
  async getActiveCanvases(): Promise<CanvasListResponse> {
    try {
      const response = await apiClient.get<CanvasListResponse>(
        '/canvas/list?status=active'
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching active canvases:', error);
      throw new Error('활성 캔버스 목록을 불러오는데 실패했습니다.');
    }
  },

  // 모든 캔버스 목록 조회 (상태별 필터링 가능)
  async getCanvases(
    status?: 'active' | 'inactive' | 'archived'
  ): Promise<CanvasListResponse> {
    try {
      const params = status ? `?status=${status}` : '';
      const response = await apiClient.get<CanvasListResponse>(
        `/canvas/list${params}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching canvases:', error);
      throw new Error('캔버스 목록을 불러오는데 실패했습니다.');
    }
  },

  // 특정 캔버스 조회 (이동 시 사용)
  async getCanvas(canvasId: number): Promise<Canvas> {
    try {
      const response = await apiClient.get<Canvas>(`/canvas/${canvasId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching canvas:', error);
      throw new Error('캔버스 정보를 불러오는데 실패했습니다.');
    }
  },

  // 향후 이미지 관련 API 추가 예정
  /*
  // 캔버스 이미지 데이터 조회
  async getCanvasImageData(canvasId: number): Promise<CanvasImageData> {
    try {
      const response = await apiClient.get<CanvasImageData>(`/api/canvas/${canvasId}/image`);
      return response.data;
    } catch (error) {
      console.error('Error fetching canvas image data:', error);
      throw new Error('캔버스 이미지 데이터를 불러오는데 실패했습니다.');
    }
  },

  // 캔버스 썸네일 조회
  async getCanvasThumbnail(canvasId: number): Promise<string> {
    try {
      const response = await apiClient.get<{thumbnail: string}>(`/api/canvas/${canvasId}/thumbnail`);
      return response.data.thumbnail;
    } catch (error) {
      console.error('Error fetching canvas thumbnail:', error);
      throw new Error('캔버스 썸네일을 불러오는데 실패했습니다.');
    }
  }
  */
};

export default canvasService;
