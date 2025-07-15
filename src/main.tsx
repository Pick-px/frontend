import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import Router from './router/router.tsx';

// iOS Safari 웹뷰에서 핀치 줌 및 스크롤 방지

document.addEventListener(
  'touchmove',
  (event) => {
    event.preventDefault();
  },
  { passive: false }
);

createRoot(document.getElementById('root')!).render(<Router />);
