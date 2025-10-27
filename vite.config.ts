import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  base: '/', // ✨ 루트 경로 명시
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 핵심 React 라이브러리
          'react-vendor': ['react', 'react-dom'],

          // 라우팅
          router: ['react-router-dom'],

          // UI/스타일링
          ui: ['react-slick', 'slick-carousel', 'react-toastify'],

          // 상태 관리
          state: ['zustand'],

          // 네트워크/통신
          network: ['axios', 'socket.io-client'],

          // 유틸리티
          utils: ['jwt-decode', 'react-responsive', 'use-sound'],
        },
      },
    },
  },
});
