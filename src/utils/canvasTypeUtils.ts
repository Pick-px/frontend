import { CanvasType } from '../components/canvas/canvasConstants';

// 캔버스 타입으로 게임 캔버스 여부를 확인하는 유틸리티 함수
export const isGameCanvas = (
  canvasType: string | null | undefined
): boolean => {
  if (!canvasType) return false;

  // 캔버스 타입이 'game_calculation'인지 확인
  return canvasType === CanvasType.GAME_CALCULATION;
};

// // canvas_id로 게임 캔버스 여부를 확인하는 함수 (백엔드에서 type 정보를 받아오기 전에 임시로 사용)
export const isGameCanvasById = (canvasId: string | undefined): boolean => {
  if (!canvasId) return false;

  // 현재는 ID 2를 게임 캔버스로 설정
  return canvasId === '11';
};
