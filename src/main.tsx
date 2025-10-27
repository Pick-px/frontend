import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals';

import Router from './router/router.tsx';

// iOS Safari 웹뷰에서 핀치 줌 및 스크롤 방지

document.addEventListener(
  'touchmove',
  (event) => {
    event.preventDefault();
  },
  { passive: false }
);

// Web Vitals 측정
function sendToAnalytics(metric: any) {
  console.log('Web Vitals:', metric);
  // 여기에 분석 도구로 전송하는 코드를 추가할 수 있습니다
  // 예: Google Analytics, Mixpanel 등
}

onCLS(sendToAnalytics);
onFCP(sendToAnalytics);
onLCP(sendToAnalytics);
onTTFB(sendToAnalytics);

createRoot(document.getElementById('root')!).render(<Router />);
