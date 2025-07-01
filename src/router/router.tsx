// src/router/Router.tsx (새 파일)

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from '../App';
import AuthCallbackPage from '../auth/AuthCallbackPage';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to='/canvas/pixels' replace />} />
        <Route path='/canvas/pixels' element={<App />} />
        {/* ✨ OAuth 콜백을 처리할 전용 경로 */}
        <Route path='/auth/callback' element={<AuthCallbackPage />} />
        {/* 나중에 추가될 다른 페이지 경로들... */}
      </Routes>
    </BrowserRouter>
  );
}
