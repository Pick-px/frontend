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
    authService.redirectToProvider(provider);
  };

  return (
    <div className='flex h-full flex-col p-3'>
      <h2 className='text-md font-semibold text-white'>로그인</h2>
      <p className='mt-2 text-gray-300'>
        서비스를 이용하시려면 로그인해주세요.
      </p>
      <div className='mt-4 mb-4 flex flex-col gap-3'>
        <input
          type='text'
          placeholder='이메일을 입력해주세요'
          className='w-full rounded-none border-b border-white/20 bg-white/10 p-2 text-sm text-white placeholder-gray-300 outline-none focus:border-blue-500 focus:ring-blue-500'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type='password'
          placeholder='비밀번호를 입력해주세요'
          className='w-full rounded-none border-b border-white/20 bg-white/10 p-2 text-sm text-white placeholder-gray-300 outline-none focus:border-blue-500 focus:ring-blue-500'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className='mt-4 flex flex-col items-center gap-3'>
        <div className='w-[180px]'>
          <button
            onClick={handleLogin}
            className='w-full rounded bg-blue-500 py-2 text-white shadow-md transition-colors hover:bg-blue-600'
          >
            로그인하기
          </button>
        </div>
        <OAuthButton
          provider='google'
          onClick={() => handleOAuthLogin('google')}
        />
        <OAuthButton
          provider='naver'
          onClick={() => handleOAuthLogin('naver')}
        />
        <OAuthButton
          provider='kakao'
          onClick={() => handleOAuthLogin('kakao')}
        />
      </div>
    </div>
  );
}
