import { io, Socket } from 'socket.io-client';

interface PixelData {
  x: number;
  y: number;
  color: string;
}

class SocketService {
  private socket: Socket | null = null;

  connect() {
    this.socket = io('http://localhost:3000');
    
    this.socket.on('connect', () => {
      console.log('소켓 연결됨');
    });

    this.socket.on('disconnect', () => {
      console.log('소켓 연결 끊김');
    });
  }

  // 픽셀 그리기 서버로 전송
  drawPixel(pixelData: PixelData) {
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

  // 초기 캔버스 데이터 요청
  requestCanvasData() {
    if (this.socket) {
      this.socket.emit('get-canvas');
    }
  }

  // 초기 캔버스 데이터 수신
  onCanvasData(callback: (canvasData: string) => void) {
    if (this.socket) {
      this.socket.on('canvas-data', callback);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export default new SocketService();