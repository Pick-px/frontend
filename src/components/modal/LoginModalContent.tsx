import React, { useState } from 'react';
import OAuthButton from './OAuthButton';
import { authService } from '../../services/authService';

type LoginModalContentProps = {
  onClose?: () => void;
};

export default function LoginModalContent({ onClose }: LoginModalContentProps) {
  // 로그인 폼 자체의 상태를 스스로 관리합니다.
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = ({}) => {
    // 실제 로그인 로직을
    onClose?.();
  };

  const handleOAuthLogin = (provider: 'google' | 'naver' | 'kakao') => {
    sessionStorage.setItem(
      'redirectPath',
      window.location.pathname + window.location.search
    );
    authService.redirectToProvider(provider);
  };

  return (
    <div className='flex h-full flex-col p-6 text-center'>
      <h2 className='text-2xl font-bold text-white'>Sign In</h2>
      <p className='mt-2 text-sm text-gray-400'>
        Pick-px에 오신것을 환영합니다!
      </p>

      {/* 이메일 및 비밀번호 입력 */}
      {/* <div className='mt-6 mb-4 flex flex-col gap-4 px-8'>
        <input
          type='text'
          placeholder='이메일'
          className='bg-gray-900 p-2 text-white placeholder-gray-500 focus:outline-none'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type='password'
          placeholder='비밀번호'
          className='bg-gray-900 p-2 text-white placeholder-gray-500 focus:outline-none'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div> */}

      {/* 로그인 버튼 */}
      <div className='mt-4 flex flex-col items-center gap-4'>
        {/* <div className='w-[200px]'>
          <button
            onClick={handleLogin}
            className='w-full bg-blue-600 py-2 font-bold text-white shadow-[4px_4px_0px_#1e40af] transition-all hover:bg-blue-500 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#1e40af]'
          >
            Sign In
          </button>
        </div> */}

        {/* 소셜 로그인 */}
        {/* <p className='text-xs text-gray-400'>구글 계정으로 로그인</p> */}
        <div className='flex w-full justify-center gap-6 pt-2'>
          <OAuthButton
            provider='google'
            onClick={() => handleOAuthLogin('google')}
          />
          {/* <OAuthButton
            provider='naver'
            onClick={() => handleOAuthLogin('naver')}
          />
          <OAuthButton
            provider='kakao'
            onClick={() => handleOAuthLogin('kakao')}
          /> */}
        </div>
      </div>
    </div>
  );
}
