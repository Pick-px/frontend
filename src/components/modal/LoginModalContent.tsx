import React, { useState } from 'react';
import OAuthButton from './OAuthButton';

type LoginModalContentProps = {
  onClose?: () => void;
};

export default function LoginModalContent({ onClose }: LoginModalContentProps) {
  // 로그인 폼 자체의 상태를 스스로 관리합니다.
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = ({}) => {
    // 실제 로그인 로직을
    console.log(`로그인 시도: ${username} / ${password}`);
    onClose?.();
  };

  const handleOAuthLogin = (provider: string) => {
    console.log(`${provider} 로그인 시작`);
    // 각 provider에 맞는 로그인 로직 호출
  };

  return (
    <>
      <h2 className='text-xl font-bold'>로그인</h2>
      <p className='mt-2 text-gray-600'>
        서비스를 이용하시려면 로그인해주세요.
      </p>
      <div className='mt-4 flex flex-col gap-3'>
        <input
          type='text'
          placeholder='이메일을 입력해주세요'
          className='rounded border p-2'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type='password'
          placeholder='비밀번호를 입력해주세요'
          className='rounded border p-2'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className='mt-4 flex flex-col items-center gap-3'>
        <button
          onClick={handleLogin}
          className='h-10 w-[180px] rounded bg-blue-500 py-2 text-white transition-transform active:scale-95'
        >
          로그인하기
        </button>
        <OAuthButton
          provider='google'
          onClick={() => handleOAuthLogin('Google')}
        />
        <OAuthButton
          provider='naver'
          onClick={() => handleOAuthLogin('Naver')}
        />
        <OAuthButton
          provider='kakao'
          onClick={() => handleOAuthLogin('Kakao')}
        />
      </div>
    </>
  );
}
