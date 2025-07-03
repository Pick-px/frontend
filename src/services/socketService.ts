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
  private socket: Socket | null = null;

  connect(canvas_id: string) {
    const { accessToken } = useAuthStore.getState();
    this.socket = io(
      import.meta.env.VITE_SOCKET_URL || 'https://ws.pick-px.com',
      {
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
  }

  //==== 픽셀 관련 ====//
  //픽셀 드로잉 요청
  drawPixel(pixelData: PixelDataWithCanvas) {
    if (this.socket) {
      this.socket.emit('draw-pixel', pixelData);
    }
  }

  //
  onPixelUpdate(callback: (pixelData: PixelData) => void) {
    if (this.socket) {
      this.socket.on('pixel-update', callback);
    }
  }

  //==== 채팅 관련 ====//
  // 채팅방 참여
  joinChat(data: { group_id: string; user_id: string }) {
    if (this.socket) {
      this.socket.emit('join_chat', data);
    }
  }

  // 채팅 메시지 전송
  sendChat(data: { group_id: string; user_id: string; message: string }) {
    if (this.socket) {
      this.socket.emit('send_chat', data);
    }
  }

  // 채팅 메시지 수신
  onChatMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.on('chat-message', callback);
    }
  }

  // 채팅 에러 수신
  onChatError(callback: (error: any) => void) {
    if (this.socket) {
      this.socket.on('chat-error', callback);
    }
  }

  // 채팅 이벤트 리스너 제거
  offChatMessage(callback: (message: any) => void) {
    if (this.socket) {
      this.socket.off('chat-message', callback);
    }
  }

  offChatError(callback: (error: any) => void) {
    if (this.socket) {
      this.socket.off('chat-error', callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default new SocketService();
