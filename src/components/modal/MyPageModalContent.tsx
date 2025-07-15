// src/components/modal/MyPageModalContent.tsx

import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStrore';
import { authService } from '../../services/authService';
import { useModalStore } from '../../store/modalStore';
import {
  myPageService,
  type UserInfoResponse,
} from '../../services/myPageService';
import { useCanvasStore } from '../../store/canvasStore';

export default function MyPageModalContent() {
  const { isLoggedIn, clearAuth } = useAuthStore();
  const { closeMyPageModal, openLoginModal } = useModalStore();
  const [userInfo, setUserInfo] = useState<UserInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { canvas_id } = useCanvasStore();

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
          <div className='flex-grow p-6'>
            <div className='mb-4 flex items-center justify-between'>
              <h3 className='text-lg font-semibold'>내 캔버스 목록</h3>
              {userInfo.canvases && userInfo.canvases.length > 3 && (
                <span className='text-xs text-gray-400'>
                  총 {userInfo.canvases.length}개
                </span>
              )}
            </div>
            {userInfo.canvases && userInfo.canvases.length > 0 ? (
              <div className='max-h-72 overflow-y-auto rounded-lg border border-gray-700/30 bg-gray-800/20 p-2'>
                <ul className='space-y-3'>
                  {userInfo.canvases.map((canvas, index) => (
                    <li
                      key={index}
                      className={`flex items-center justify-between rounded-md p-3 transition-all duration-200 hover:scale-[1.02] ${
                        canvas.own_count === null
                          ? 'border border-gray-600/30 bg-gray-700/40'
                          : 'border border-gray-600/20 bg-gray-700/20 opacity-90'
                      }`}
                    >
                      <div className='flex-grow'>
                        <div className='flex items-center gap-2'>
                          <p className='font-semibold text-white'>
                            {canvas.title}
                          </p>
                          {canvas.own_count !== null && (
                            <span className='rounded-full bg-red-600 px-2 py-1 text-xs text-white'>
                              종료됨
                            </span>
                          )}
                        </div>

                        <p className='mt-1 text-xs text-gray-400'>
                          크기 : {canvas.size_x}x{canvas.size_y}
                        </p>
                        {canvas.own_count !== null && canvas.ended_at && (
                          <p className='text-xs text-gray-400'>
                            진행 기간:{' '}
                            {new Date(canvas.created_at).toLocaleDateString()} ~{' '}
                            {new Date(canvas.ended_at).toLocaleDateString()}
                          </p>
                        )}
                        <p className='text-xs text-gray-400'>
                          시도 횟수: {canvas.try_count}
                        </p>
                        {canvas.own_count !== null && (
                          <p className='text-xs text-gray-400'>
                            점유 픽셀 수: {canvas.own_count}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
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
