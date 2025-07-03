// src/components/modal/MyPageModalContent.tsx (새 파일)

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStrore';
import { authService } from '../../services/authService';
import { useModalStore } from '../../store/modalStore';
import {
  myPageService,
  type UserInfoResponse,
} from '../../services/myPageService';

export default function MyPageModalContent() {
  const { isLoggedIn, user, clearAuth } = useAuthStore();
  const { closeMyPageModal } = useModalStore();
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
      <div className='flex h-full flex-col items-center justify-center text-white p-4'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-blue-500 motion-reduce:animate-[spin_1.5s_linear_infinite]' role='status'>
          <span className='!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]'>Loading...</span>
        </div>
        <p className='mt-4 text-lg'>데이터 로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return <div>오류: {error}</div>;
  }

  return (
    <div className='flex h-full flex-col'>
      {/* 헤더 */}
      <div className='flex-shrink-0 border-b border-white/30 p-3'>
        <h2 className='text-md font-semibold'>마이페이지</h2>
      </div>

      {/* 콘텐츠 영역 */}
      <div className='flex-grow overflow-y-auto p-3'>
        {isLoggedIn && user && userInfo ? (
          <div className='flex flex-col gap-6'>
            {/* User Info Section */}
            <div className='flex flex-col items-center text-center'>
              <h3 className='text-2xl font-bold text-white'>
                {userInfo.user_name || user.nickname || user.userId}
              </h3>
              {userInfo.email && <p className='text-gray-300'>{userInfo.email}</p>}
            </div>

            {/* Canvases Section */}
            {userInfo.canvases && userInfo.canvases.length > 0 && (
              <div className='flex flex-col gap-3'>
                <h3 className='text-lg font-semibold text-white border-b border-white/20 pb-2'>내 캔버스</h3>
                <ul className='space-y-3'>
                  {userInfo.canvases.map((canvas, index) => (
                    <li key={index} className='rounded-md bg-white/10 p-3 flex flex-col gap-1'>
                      <p className='font-medium text-white'>{canvas.title}</p>
                      <p className='text-sm text-gray-300'>
                        크기: {canvas.size_x}x{canvas.size_y}
                      </p>
                      <p className='text-sm text-gray-300'>
                        생성일:{' '}
                        {new Date(canvas.created_at).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className='flex h-full flex-col items-center justify-center text-center'>
            <p className='mb-4'>로그인이 필요한 서비스입니다.</p>
            <button
              onClick={() => {
                closeMyPageModal();
                // openLoginModal();
              }}
              className='w-full rounded bg-blue-500 py-2 text-white transition-colors hover:bg-blue-600'
            >
              로그인
            </button>
          </div>
        )}
      </div>

      {/* 푸터 (로그아웃 버튼) */}
      {isLoggedIn && (
        <div className='flex-shrink-0 border-t border-white/30 p-3'>
          <button
            onClick={handleLogout}
            className='w-full rounded bg-red-500 py-2 text-white transition-colors hover:bg-red-600'
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
