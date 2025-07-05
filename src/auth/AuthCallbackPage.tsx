// src/pages/AuthCallbackPage.tsx (수정)

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStrore';
import Preloader from '../components/Preloader';

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
        // const { accessToken, user } = await authService.handleOAuthCallback(
        //   authCode,
        //   prov
        // );

        // if (accessToken && user) {
        //   setAuth(accessToken, user);그
        //   console.log(user);
        //   navigate('/canvas'); // 성공! 메인 페이지로 이동
        // }

        const authResult = await authService.handleOAuthCallback(
          authCode,
          prov
        );
        console.log(authResult);

        if (authResult?.accessToken && authResult?.user) {
          // ✨ 1. 객체를 JSON 문자열로 변환합니다.
          const authResultString = JSON.stringify(authResult);

          // ✨ 2. 'authResult'라는 키(key)로 sessionStorage에 저장합니다.
          sessionStorage.setItem('authResult', authResultString);

          const redirectPath = sessionStorage.getItem('redirectPath');
          sessionStorage.removeItem('redirectPath');
          navigate(redirectPath || '/');
        } else {
          throw new Error('Authentication failed');
        }
      } catch (error) {
        navigate('/');
      }
    };

    processLogin(provider, code);
  }, [location, navigate, setAuth]);

  return <Preloader />;
}
