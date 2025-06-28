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
  private currentCanvasId: string = '';

  connect(canvas_id: string) {
    this.currentCanvasId = canvas_id;
    this.socket = io('http://localhost:3000');
    
    this.socket.on('connect', () => {
      console.log('소켓 연결됨');
      this.socket!.emit('join', { canvas_id: this.currentCanvasId });
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

  // 초기 캔버스 데이터 요청
  requestCanvasData(canvas_id: string) {
    if (this.socket) {
      this.socket.emit('get-canvas', { canvas_id });
    }
  }

  // 초기 캔버스 데이터 수신
  onCanvasData(callback: (canvasData: PixelData[]) => void) {
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