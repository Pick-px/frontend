import { useEffect, useRef, useState } from 'react';
import socketService from '../services/socketService';
import { useAuthStore } from '../store/authStrore';
import { toast } from 'react-toastify';
import { useToastStore } from '../store/toastStore'; // 추가
import { useTimeSyncStore } from '../store/timeSyncStore';

interface PixelData {
  x: number;
  y: number;
  color: string;
}

interface CooldownData {
  cooldown: boolean;
  remaining: number;
}

//canvas_id : zustand 동기화 수정 예정
export const useSocket = (
  onPixelReceived: (pixel: PixelData) => void,
  canvas_id: string | undefined,
  onCooldownReceived?: (cooldown: CooldownData) => void
) => {
  const { accessToken, user } = useAuthStore();
  const pixelCallbackRef = useRef(onPixelReceived);
  const cooldownCallbackRef = useRef(onCooldownReceived);
  const [isConnected, setIsConnected] = useState(false);
  const showToast = useToastStore((state) => state.showToast);

  // 콜백 함수 업데이트
  pixelCallbackRef.current = onPixelReceived;
  cooldownCallbackRef.current = onCooldownReceived;

  useEffect(() => {
    const { updateServerTimeOffset } = useTimeSyncStore.getState();

    if (!canvas_id) return;

    // 이미 연결된 경우 중복 연결 방지
    // if (isConnected) return;

    // 토큰이나 user 정보가 변경되면 소켓 재연결
    socketService.disconnect();
    socketService.connect(canvas_id);
    setIsConnected(true);

    // 픽셀 업데이트 이벤트 리스너
    socketService.onPixelUpdate((pixel) => {
      pixelCallbackRef.current(pixel);
    });

    // 쿨다운 정보 이벤트 리스너
    if (cooldownCallbackRef.current) {
      socketService.onCooldownInfo((cooldown) => {
        cooldownCallbackRef.current?.(cooldown);
      });
    }

    // canvas_open_alarm 이벤트 리스너 추가
    socketService.onCanvasOpenAlarm(
      (data: {
        canvas_id: number;
        title: string;
        started_at: string;
        remain_time: number;
      }) => {
        console.log('onCanvasOpenAlarm:', data);
        updateServerTimeOffset(
          data.started_at,
          data.remain_time ?? 0, // Ensure remaining_time is a number
          Date.now()
        );
        showToast(
          `게임 시작 30초 전: ${data.title}`,
          String(data.canvas_id),
          25000
        ); // 25초 후 자동 사라짐
      }
    );

    // 인증 에러 이벤트 리스너
    socketService.onAuthError((error) => {
      toast.error(`인증 오류: ${error.message}`);
    });

    // 픽셀 에러 이벤트 리스너
    socketService.onPixelError((error) => {
      if (error.remaining) {
        toast.warning(
          `픽셀 오류: ${error.message} (남은 시간: ${error.remaining}초)`
        );
      } else {
        toast.error(`픽셀 오류: ${error.message}`);
      }
    });

    // 채팅 에러 이벤트 리스너
    socketService.onChatError((error) => {
      toast.error(`채팅 오류: ${error.message}`);
    });

    // 컴포넌트 언마운트 시 정리
    return () => {
      socketService.disconnect();
      setIsConnected(false);
    };
  }, [canvas_id, accessToken, showToast]); // showToast 의존성 추가

  const sendPixel = (pixel: PixelData) => {
    if (!canvas_id) return;
    socketService.drawPixel({ ...pixel, canvas_id });
  };

  return { sendPixel };
};
