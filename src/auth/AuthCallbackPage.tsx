// src/pages/AuthCallbackPage.tsx (수정)

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStrore';

type Provider = 'google' | 'naver' | 'kakao';

export default function AuthCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const code = searchParams.get('code');
    const provider = searchParams.get('state') as Provider; // 'state' 파라미터를 provider로 사용

    if (!code || !provider) {
      console.error('Authorization code or provider state is missing.');
      navigate('/login-failed');
      return;
    }

    const processLogin = async (prov: Provider, authCode: string) => {
      try {
        // authService에 code와 provider(state)를 모두 전달
        const { accessToken, user } = await authService.handleOAuthCallback(
          authCode,
          prov
        );

        console.log(accessToken);
        console.log(user);

        if (accessToken && user) {
          setAuth(accessToken, user);
          navigate('/'); // 성공! 메인 페이지로 이동
        } else {
          throw new Error('Authentication failed');
        }
      } catch (error) {
        navigate('/login-failed');
      }
    };

    processLogin(provider, code);
  }, [location, navigate, setAuth]);

  return <div>로그인 처리 중입니다...</div>;
}
