import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStrore';

interface PixelData {
  x: number;
  y: number;
  color: string;
}

interface PixelDataWithCanvas extends PixelData {
  canvas_id: string;
}

class SocketService {
  socket: Socket | null = null;

  connect(canvas_id: string) {
    const { accessToken } = useAuthStore.getState();
    this.socket = io(
      import.meta.env.VITE_SOCKET_URL || 'https://ws.pick-px.com',
      {
        transports: ['polling', 'websocket'],
        withCredentials: true, // 반드시 설정!
        auth: {
          token: accessToken,
        },
      }
    );

    this.socket.on('connect', () => {
      console.log('소켓 연결됨');
      this.socket!.emit('join_canvas', { canvas_id });
    });

    this.socket.on('disconnect', () => {
      console.log('소켓 연결 끊김');
    });

    this.socket.on('connect_error', (error) => {
      console.error('소켓 연결 실패:', error.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  //==== 픽셀 관련 ====//
  // 픽셀 드로잉 요청
  drawPixel(pixelData: PixelDataWithCanvas) {
    if (this.socket) {
      this.socket.emit('draw_pixel', pixelData);
    }
  }
  // 픽셀 업데이트 수신
  onPixelUpdate(callback: (pixelData: PixelData) => void) {
    if (this.socket) {
      this.socket.on('pixel_update', callback);
    }
  }
  // 쿨다운 정보 수신
  onCooldownInfo(
    callback: (data: { cooldown: boolean; remaining: number }) => void
  ) {
    if (this.socket) {
      this.socket.on('cooldown_info', callback);
    }
  }
  // 픽셀 에러 수신 (쿨다운 중, 서버 오류 등)
  onPixelError(
    callback: (error: { message: string; remaining?: number }) => void
  ) {
    if (this.socket) {
      this.socket.on('pixel_error', callback);
    }
  }
  // 픽셀 에러 리스너 제거
  offPixelError(
    callback: (error: { message: string; remaining?: number }) => void
  ) {
    if (this.socket) {
      this.socket.off('pixel_error', callback);
    }
  }

  //==== 채팅 관련 ====//
  // 채팅방 참여
  joinChat(data: { group_id: string }) {
    if (this.socket) {
      this.socket.emit('join_chat', data);
    }
  }
  // 채팅방 나가기
  leaveChat(data: { group_id: string }) {
    if (this.socket) {
      this.socket.emit('leave_chat', data);
    }
  }
  // 채팅 메시지 전송
  sendChat(data: { group_id: string; message: string }) {
    if (this.socket) {
      this.socket.emit('send_chat', data);
    }
  }
  // 채팅 메시지 수신
  onChatMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('chat_message', callback);
    }
  }
  // 채팅 메시지 리스너 제거
  offChatMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.off('chat_message', callback);
    }
  }

  //=== 이미지 관련 ===//
  // 이미지 업로드 메시지 전송
  sendImageMessage(data: {
    group_id: string;
    url: string;
    x: number;
    y: number;
    width: number;
    height: number;
  }) {
    if (this.socket) {
      this.socket.emit('upload_img', data);
    }
  }

  // 이미지 동기화 요청
  joinImg(data: { group_id: string }) {
    if (this.socket) {
      this.socket.emit('join_img', data);
    }
  }

  // 이미지 업로드 알림 수신 (팀원들이 받는 이벤트)
  onSendImage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('send_img', callback);
    }
  }
  // 이미지 업로드 알림 리스너 제거
  offSendImage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.off('send_img', callback);
    }
  }
  // 채팅 에러 수신
  onChatError(callback: (error: { message: string }) => void) {
    if (this.socket) {
      this.socket.on('chat_error', callback);
    }
  }
  // 채팅 에러 리스너 제거
  offChatError(callback: (error: { message: string }) => void) {
    if (this.socket) {
      this.socket.off('chat_error', callback);
    }
  }

  //==== 인증 관련 ====//
  // 인증 에러 수신 (유저 정보가 없거나 JWT토큰 파싱에 실패한 경우)
  onAuthError(callback: (error: { message: string }) => void) {
    if (this.socket) {
      this.socket.on('auth_error', callback);
    }
  }
  // 인증 에러 리스너 제거
  offAuthError(callback: (error: { message: string }) => void) {
    if (this.socket) {
      this.socket.off('auth_error', callback);
    }
  }

  //==== 게임 캠버스 관련 ====//

  // 게임 결과 전송 (문제 풀기 결과)
  sendGameResult(data: {
    canvas_id: string;
    x: number;
    y: number;
    color: string;
    result: boolean;
  }) {
    if (this.socket) {
      this.socket.emit('send_result', data);
    } else {
      console.error('SocketService: Cannot emit send_result, socket is null');
    }
  }
  // 게임 픽셀 업데이트 수신
  onGamePixelUpdate(callback: (pixelData: PixelData) => void) {
    if (this.socket) {
      this.socket.on('pixel_update', (data) => {
        console.log(
          'SocketService: Received pixel_update for game canvas',
          data
        );
        callback(data);
      });
    }
  }

  // 죽은 픽셀 이벤트 수신
  onDeadPixels(
    callback: (data: {
      pixels: Array<{ x: number; y: number; color: string }>;
      username: string;
    }) => void
  ) {
    if (this.socket) {
      this.socket.on('dead_user', callback);
    }
  }

  // 게임 픽셀 업데이트 리스너 제거
  offGamePixelUpdate(callback: (pixelData: PixelData) => void) {
    if (this.socket) {
      this.socket.off('pixel_update', callback);
    }
  }

  // 죽은 픽셀 이벤트 리스너 제거
  offDeadPixels(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.off('dead_user', callback);
    }
  }
}

export default new SocketService();
