// src/router/Router.tsx

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import App from '../App';
import AuthCallbackPage from '../auth/AuthCallbackPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import CanvasManagement from '../pages/admin/CanvasManagement';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Navigate to='/canvas/pixels' replace />} />
        <Route path='/canvas/pixels' element={<App />} />
        {/* ✨ OAuth 콜백을 처리할 전용 경로 */}
        <Route path='/auth/callback' element={<AuthCallbackPage />} />

        {/* 관리자 페이지 경로 */}
        <Route path='/admin/dashboard' element={<AdminDashboard />} />
        <Route path='/admin/canvases' element={<CanvasManagement />} />
      </Routes>
    </BrowserRouter>
  );
}
