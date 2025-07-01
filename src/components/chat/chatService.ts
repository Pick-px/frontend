// src/services/chatSocketService.ts

import { io, Socket } from 'socket.io-client';

interface MessageData {
  messageId: string;
  user: { userId: string; nickname?: string };
  content: string;
  timestamp: string;
}

class ChatSocketService {
  private socket: Socket | null = null;
  private currentCanvasId: string = '';

  public connect(canvas_id: string): void {
    if (this.socket && this.currentCanvasId === canvas_id) return;
    if (this.socket) this.disconnect();

    this.currentCanvasId = canvas_id;
    // 백엔드 주소가 동일하다고 가정합니다.
    this.socket = io('http://localhost:3000');

    this.socket.on('connect', () => {
      console.log(`Chat Socket connected: ${this.socket?.id}`);
      this.socket!.emit('join_chat_room', { canvas_id: this.currentCanvasId });
    });

    this.socket.on('disconnect', () => {
      console.log('Chat Socket disconnected');
      this.socket = null;
    });
  }

  public disconnect(): void {
    this.socket?.disconnect();
  }

  public sendMessage(content: string): void {
    this.socket?.emit('send_message', {
      canvas_id: this.currentCanvasId,
      content,
    });
  }

  public onNewMessage(callback: (messageData: MessageData) => void): void {
    this.socket?.on('new_message', callback);
  }
}

export const chatSocketService = new ChatSocketService();
