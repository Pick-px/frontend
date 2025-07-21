import React, { useEffect, useRef, useState } from 'react';

import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from '../../store/authStrore';
import { useModalStore } from '../../store/modalStore';
import { showInstructionsToast } from '../toast/InstructionsToast';
import { useCanvasUiStore } from '../../store/canvasUiStore';
import { CanvasType } from './canvasConstants';

// type HoverPos = { x: number; y: number } | null;

type CanvasUIProps = {
  onConfirm: () => void;
  onSelectColor: (color: string) => void;
  onImageAttach: (file: File) => void;
  onImageDelete: () => void;
  hasImage: boolean;
  colors: string[];
  onZoomIn: () => void;
  onZoomOut: () => void;
  isBgmPlaying: boolean;
  toggleBgm: () => void;
  canvasType: CanvasType;
};

export default function CanvasUIMobile({
  onConfirm,
  onSelectColor,
  onImageAttach,
  onImageDelete,
  hasImage,
  colors,
  onZoomIn,
  onZoomOut,
  isBgmPlaying,
  toggleBgm,
  canvasType,
}: CanvasUIProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [showConfirmEffect, setShowConfirmEffect] = useState(false);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  // Zustand 스토어에서 상태를 개별적으로 가져옵니다.
  const color = useCanvasUiStore((state) => state.color);
  const setColor = useCanvasUiStore((state) => state.setColor);
  const cooldown = useCanvasUiStore((state) => state.cooldown);
  const timeLeft = useCanvasUiStore((state) => state.timeLeft);
  const showPalette = useCanvasUiStore((state) => state.showPalette);
  const setShowPalette = useCanvasUiStore((state) => state.setShowPalette);
  const imageTransparency = useCanvasUiStore(
    (state) => state.imageTransparency
  );
  const setImageTransparency = useCanvasUiStore(
    (state) => state.setImageTransparency
  );
  const hoverPos = useCanvasUiStore((state) => state.hoverPos);
  const clearSelectedPixel = useCanvasUiStore(
    (state) => state.clearSelectedPixel
  );

  const {
    openLoginModal,
    openCanvasModal,
    openAlbumModal,
    openMyPageModal,
    openGroupModal,
    openHelpModal,
    openGameModal,
  } = useModalStore();

  // 사이드바 열림, 닫힘 상태
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  // useEffect(() => {
  //   showInstructionsToast();
  // }, []);

  useEffect(() => {
    if (!isSidebarOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      // 토글 버튼이나 사이드바 내부 클릭은 무시
      if (
        toggleButtonRef.current?.contains(target) ||
        sidebarRef.current?.contains(target)
      ) {
        return;
      }

      // 외부 클릭 시 사이드바 닫기
      setIsSidebarOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSidebarOpen]);

  return (
    <>
      <ToastContainer />
      {/* 컬러 피커 */}
      <div className='pointer-events-auto fixed top-2 right-2 flex gap-4'>
        <div className='pointer-events-auto fixed top-2 right-11 mx-3 flex flex-col items-center'>
          <span className='mb-1 text-xs text-gray-200'>확정</span>
          <button
            disabled={cooldown}
            onMouseDown={() => !cooldown && setIsPressed(true)}
            onMouseUp={() => {
              setIsPressed(false);
              if (cooldown) return;
              if (isLoggedIn) {
                setShowConfirmEffect(true);
                setTimeout(() => setShowConfirmEffect(false), 2000);
                onConfirm();
              } else {
                openLoginModal();
              }
            }}
            onMouseLeave={() => setIsPressed(false)}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300 ${
              cooldown
                ? 'cursor-not-allowed border-4 border-red-600 bg-red-500/40 text-red-300 shadow-lg shadow-red-500/50'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg hover:scale-105 hover:from-emerald-400 hover:to-cyan-400 hover:shadow-emerald-400/30'
            } ${isPressed ? 'scale-95' : 'scale-100'}`}
          >
            {cooldown ? (
              <div className='flex h-full w-full items-center justify-center'>
                <span className='animate-pulse font-mono text-lg font-bold tracking-wider text-red-300'>
                  {timeLeft}
                </span>
              </div>
            ) : (
              <svg
                className='h-6 w-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13L9 17L19 7'
                />
              </svg>
            )}
          </button>
        </div>
        {canvasType === CanvasType.EVENT_COLORLIMIT ? (
          <div className='flex flex-col gap-2'>
            {['#000000', '#808080', '#c0c0c0', '#ffffff'].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setColor(c);
                  onSelectColor(c);
                }}
                style={{ backgroundColor: c }}
                className={`h-8 w-8 cursor-pointer rounded-full transition-all duration-300 ${
                  color === c
                    ? 'scale-110 shadow-lg ring-2 shadow-cyan-400/60 ring-cyan-300 ring-offset-2 ring-offset-slate-800'
                    : 'border border-white/30 hover:border-cyan-300/50 hover:shadow-md hover:shadow-white/20'
                }`}
              />
            ))}
          </div>
        ) : (
          <div className='flex flex-col items-center'>
            <span className='mb-1 text-xs text-gray-200'>색상 선택</span>
            <input
              type='color'
              value={color}
              onChange={(e) => {
                const newColor = e.target.value;
                setColor(newColor);
                onSelectColor(newColor);
              }}
              className='h-8 w-8 cursor-pointer rounded-full border-2 border-blue-400 p-0 shadow-md'
              title='색상 선택'
            />
          </div>
        )}
      </div>

      {/* 이미지 첨부/투명도/삭제 UI - 하단 고정 */}
      <div className='pointer-events-auto fixed bottom-4 left-14 flex gap-2'>
        {onImageAttach && (
          <div className='flex flex-col gap-1'>
            <div className='flex items-center gap-2'>
              <label
                className='flex h-[40px] w-[40px] cursor-pointer items-center justify-center rounded-full bg-gray-700 text-white transition-colors duration-200 hover:bg-gray-600'
                title='이미지 첨부 (JPG, PNG, GIF, WebP)'
              >
                <svg
                  className='h-5 w-5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
                <input
                  type='file'
                  accept='image/jpeg,image/jpg,image/png,image/gif,image/webp'
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setShowPalette(false);
                      onImageAttach(file);
                    }
                    e.target.value = '';
                  }}
                  className='hidden'
                />
              </label>

              {hasImage && (
                <div className='flex items-center gap-2 rounded-md bg-gray-800/80 px-3 py-1'>
                  {setImageTransparency && (
                    <div className='flex items-center gap-2'>
                      <span className='text-xs whitespace-nowrap text-white'>
                        투명도
                      </span>
                      <input
                        type='range'
                        min='0.1'
                        max='1'
                        step='0.1'
                        value={imageTransparency}
                        onChange={(e) =>
                          setImageTransparency(parseFloat(e.target.value))
                        }
                        onTouchStart={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                        className='h-4 w-[60px] cursor-pointer touch-manipulation appearance-none rounded-lg bg-gray-600'
                        style={{
                          WebkitAppearance: 'none',
                          appearance: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          touchAction: 'manipulation',
                        }}
                        title='이미지 투명도 조절'
                      />
                      <span className='w-8 text-xs text-gray-300'>
                        {Math.round(imageTransparency * 100)}%
                      </span>
                    </div>
                  )}

                  {onImageDelete && (
                    <button
                      onClick={onImageDelete}
                      className='flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-full bg-red-600 text-white transition-colors duration-200 hover:bg-red-500'
                      title='이미지 삭제'
                    >
                      <svg
                        className='h-4 w-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 사이드바 토글 버튼 */}
      <button
        ref={toggleButtonRef}
        onClick={() => {
          console.log('토글 버튼 클릭됨, 현재 상태:', isSidebarOpen);
          setIsSidebarOpen(!isSidebarOpen);
        }}
        className='pointer-events-auto fixed top-[22px] left-[10px] z-[10000] flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl transition-all duration-300 hover:scale-110 hover:from-blue-600 hover:to-purple-700 active:scale-95'
        title={isSidebarOpen ? '메뉴 닫기' : '메뉴 열기'}
      >
        <div className='relative'>
          {/* 햄버거 아이콘 (사이드바가 닫혀있을 때) */}
          <svg
            className={`h-7 w-7 transition-all duration-300 ${
              isSidebarOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'
            }`}
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2.5}
              d='M4 6h16M4 12h16M4 18h16'
            />
          </svg>

          {/* X 아이콘 (사이드바가 열려있을 때) */}
          <svg
            className={`absolute inset-0 h-7 w-7 transition-all duration-300 ${
              isSidebarOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'
            }`}
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2.5}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>

          {/* 작은 알림 점 (사이드바가 닫혀있을 때만 표시) */}
          {!isSidebarOpen && (
            <div className='absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full bg-red-500'></div>
          )}
        </div>
      </button>

      {/* 사이드바 */}
      {isSidebarOpen && (
        <div
          ref={sidebarRef}
          className='pointer-events-auto fixed top-0 left-0 z-[9999] h-full w-64 bg-gray-800/95 shadow-xl backdrop-blur-sm'
        >
          <div className='flex h-full flex-col p-4'>
            {/* 사이드바 헤더 */}
            <div className='mb-6 flex items-center justify-between border-b border-gray-600 pb-4'>
              <h2 className='text-lg font-bold text-white'>{''}</h2>
            </div>

            {/* 메뉴 아이템들 */}
            <div className='flex flex-1 flex-col gap-2'>
              {/* 로그인/마이페이지 */}
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  if (isLoggedIn) {
                    openMyPageModal();
                  } else {
                    openLoginModal();
                  }
                }}
                className='flex items-center gap-3 rounded-lg px-4 py-3 text-left text-white transition-colors hover:bg-gray-700'
              >
                <svg
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                  />
                </svg>
                <span className='font-medium'>
                  {isLoggedIn ? '마이페이지' : '로그인'}
                </span>
              </button>

              {/* 그룹 */}
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  if (isLoggedIn) {
                    openGroupModal();
                  } else {
                    openLoginModal();
                  }
                }}
                className='flex items-center gap-3 rounded-lg px-4 py-3 text-left text-white transition-colors hover:bg-gray-700'
              >
                <svg
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
                  />
                </svg>
                <span className='font-medium'>그룹</span>
              </button>

              {/* 캔버스 */}
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  if (isLoggedIn) {
                    openCanvasModal();
                  } else {
                    openLoginModal();
                  }
                }}
                className='flex items-center gap-3 rounded-lg px-4 py-3 text-left text-white transition-colors hover:bg-gray-700'
              >
                <svg
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
                <span className='font-medium'>캔버스</span>
              </button>

              {/* 게임 */}
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  if (isLoggedIn) {
                    openGameModal();
                  } else {
                    openLoginModal();
                  }
                }}
                className='flex items-center gap-3 rounded-lg px-4 py-3 text-left text-white transition-colors hover:bg-gray-700'
              >
                <svg
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 12h4m-2-2v4m6-2h.01M13 12h.01M18 12h.01'
                  />
                  <rect
                    x='4'
                    y='8'
                    width='16'
                    height='8'
                    rx='2'
                    strokeWidth={1.5}
                  />
                </svg>
                <span className='font-medium'>게임 모드</span>
              </button>

              {/* 앨범 */}
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  openAlbumModal();
                }}
                className='flex items-center gap-3 rounded-lg px-4 py-3 text-left text-white transition-colors hover:bg-gray-700'
              >
                <svg
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
                <span className='font-medium'>앨범</span>
              </button>

              {/* BGM */}
              <button
                onClick={() => {
                  toggleBgm();
                }}
                className='flex items-center gap-3 rounded-lg px-4 py-3 text-left text-white transition-colors hover:bg-gray-700'
              >
                {isBgmPlaying ? (
                  <svg
                    className='h-5 w-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2'
                    />
                  </svg>
                ) : (
                  <svg
                    className='h-5 w-5'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z'
                    />
                  </svg>
                )}
                <span className='font-medium'>
                  {isBgmPlaying ? 'BGM 끄기' : 'BGM 켜기'}
                </span>
              </button>

              {/* 도움말 */}
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  openHelpModal();
                }}
                className='flex items-center gap-3 rounded-lg px-4 py-3 text-left text-white transition-colors hover:bg-gray-700'
              >
                <svg
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                <span className='font-medium'>도움말</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 좌표 표시창 */}
      <div className='pointer-events-none fixed right-4 bottom-5 z-[9999] rounded-[8px] bg-[rgba(0,0,0,0.8)] p-[10px] text-white'>
        {hoverPos ? `(${hoverPos.x}, ${hoverPos.y})` : 'OutSide'}
      </div>

      {/* 쿨타임 창 제거 - 확정 버튼으로 이동 */}
    </>
  );
}
