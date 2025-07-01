import { io, Socket } from 'socket.io-client';

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
    this.socket = io('http://localhost:3000');

    this.socket.on('connect', () => {
      console.log('소켓 연결됨');
      this.socket!.emit('join_canvas', { canvas_id });
    });

    this.socket.on('disconnect', () => {
      console.log('소켓 연결 끊김');
    });
  }

  // 픽셀 그리기 서버로 전송
  drawPixel(pixelData: PixelDataWithCanvas) {
    if (this.socket) {
      this.socket.emit('draw-pixel', pixelData);
    }
  }

  // 다른 사용자 픽셀 변경 수신
  onPixelUpdate(callback: (pixelData: PixelData) => void) {
    if (this.socket) {
      this.socket.on('pixel-update', callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default new SocketService();
