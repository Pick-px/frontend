// src/components/modal/MyPageModalContent.tsx

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStrore';
import { authService } from '../../services/authService';
import { useModalStore } from '../../store/modalStore';
import {
  myPageService,
  type UserInfoResponse,
} from '../../services/myPageService';

export default function MyPageModalContent() {
  const { isLoggedIn, clearAuth } = useAuthStore();
  const { closeMyPageModal, openLoginModal } = useModalStore();
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyPageData = async () => {
      if (!isLoggedIn) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await myPageService.fetchUserInfo();
        setUserInfo(data);
      } catch (err) {
        setError('Failed to load user data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPageData();
  }, [isLoggedIn]);

  const handleLogout = async () => {
    await authService.logout();
    clearAuth();
    closeMyPageModal();
  };

  if (loading) {
    return (
      <div className='flex h-full flex-col items-center justify-center p-4 text-white'>
        <div
          className='h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-blue-500 motion-reduce:animate-[spin_1.5s_linear_infinite]'
          role='status'
        />
        <p className='mt-4 text-lg'>데이터 로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return <div className='p-6 text-center text-red-400'>오류: {error}</div>;
  }

  return (
    <div className='flex h-full flex-col bg-gray-900/50 text-white'>
      {isLoggedIn && userInfo ? (
        <>
          {/* Profile Header */}
          <div className='flex flex-col items-center bg-black/20 p-6'>
            <div className='mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-700'>
              {/* Placeholder for an avatar */}
              <span className='text-4xl'>🎨</span>
            </div>
            <h2 className='text-2xl font-bold'>{userInfo.nickName}</h2>
            {userInfo.email && (
              <p className='text-sm text-gray-400'>{userInfo.email}</p>
            )}
          </div>

          {/* Canvases Section */}
          <div className='flex-grow overflow-y-auto p-6'>
            <h3 className='mb-4 text-lg font-semibold'>내 캔버스 목록</h3>
            {userInfo.canvases && userInfo.canvases.length > 0 ? (
              <ul className='space-y-4'>
                {userInfo.canvases.map((canvas, index) => (
                  <li
                    key={index}
                    className='flex items-center justify-between rounded-lg bg-gray-800/60 p-4 transition-transform hover:scale-105'
                  >
                    <div>
                      <p className='font-semibold text-white'>{canvas.title}</p>
                      <p className='text-xs text-gray-400'>
                        {canvas.size_x}x{canvas.size_y} - 생성일:{' '}
                        {new Date(canvas.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {/* <button className='px-4 py-2 text-sm rounded-md bg-blue-600 hover:bg-blue-500 transition-colors'>
                      이동
                    </button> */}
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-center text-gray-500'>
                아직 생성된 캔버스가 없습니다.
              </p>
            )}
          </div>

          {/* Footer */}
          <div className='flex-shrink-0 border-t border-white/10 p-4'>
            <button
              onClick={handleLogout}
              className='w-full rounded-md bg-gray-700 py-2 text-white transition-colors hover:bg-gray-600'
            >
              로그아웃
            </button>
          </div>
        </>
      ) : (
        <div className='flex h-full flex-col items-center justify-center p-6 text-center'>
          <p className='mb-4 text-lg'>로그인이 필요한 서비스입니다.</p>
          <button
            onClick={() => {
              closeMyPageModal();
              openLoginModal();
            }}
            className='w-full max-w-xs rounded-md bg-blue-600 py-2 text-white transition-colors hover:bg-blue-500'
          >
            로그인 하러 가기
          </button>
        </div>
      )}
    </div>
  );
}
