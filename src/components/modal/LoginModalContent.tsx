import React, { useState } from 'react';

type LoginModalContentProps = {
  onClose?: () => void;
};

export default function LoginModalContent({ onClose }: LoginModalContentProps) {
  // 로그인 폼 자체의 상태를 스스로 관리합니다.
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // 실제 로그인 로직을
    console.log(`로그인 시도: ${username} / ${password}`);
    // 로그인이 성공하면 부모로부터 받은 onClose 함수를 호출하여 모달을 닫을 수 있습니다.
    onClose?.();
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
        <button
          onClick={handleLogin}
          className='rounded bg-blue-500 py-2 text-white'
        >
          로그인하기
        </button>
      </div>
    </>
  );
}
