import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStrore';
import { useModalStore } from '../store/modalStore';
import { ToastContainer, toast } from 'react-toastify';
import { showInstructionsToast } from './toast/InstructionsToast';
import 'react-toastify/dist/ReactToastify.css';

type HoverPos = { x: number; y: number } | null;

type CanvasUIProps = {
  color: string;
  setColor: React.Dispatch<React.SetStateAction<string>>;
  hoverPos: HoverPos;
  colors: string[];
  onSelectColor: (color: string) => void;
  onConfirm: () => void;
  cooldown: boolean;
  timeLeft: number;
  showPalette: boolean;
  setShowPalette: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function CanvasUI({
  color,
  setColor,
  hoverPos,
  colors,
  onConfirm,
  onSelectColor,
  cooldown,
  timeLeft,
  showPalette,
  setShowPalette,
}: CanvasUIProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [showConfirmEffect, setShowConfirmEffect] = useState(false);
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);

  const {
    openLoginModal,
    openCanvasModal,
    openAlbumModal,
    openMyPageModal,
    openGroupModal,
  } = useModalStore();

  // 드롭다움 열림, 닫힘 상태
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    showInstructionsToast();
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false); // 메뉴를 닫습니다.
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
      <ToastContainer />
      {/* 컬러 피커 */}
      <div className='pointer-events-auto fixed top-[10px] left-[10px] z-[9999]'>
        <input
          type='color'
          value={color}
          onChange={(e) => {
            const newColor = e.target.value;
            setColor(newColor);
            onSelectColor(newColor);
          }}
          className='h-[40px] w-[40px] cursor-pointer rounded-[4px] border-2 border-solid border-white p-0'
        />
      </div>
      <div
        ref={menuRef}
        className='pointer-events-auto fixed top-[60px] left-[10px] z-60'
      >
        {/* 항상 보이는 메뉴 토글 버튼 (햄버거 아이콘) */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-white shadow-lg transition-transform hover:bg-gray-600 active:scale-95'
        >
          <svg
            className='h-6 w-6'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M4 6h16M4 12h16M4 18h16'
            />
          </svg>
        </button>

        {/* isMenuOpen이 true일 때만 드롭다운 메뉴가 보입니다. */}
        {isMenuOpen && (
          <div className='absolute top-full mt-2 flex w-auto flex-col gap-2'>
            {/* 로그인/마이페이지 버튼 */}
            <div className='group relative'>
              <button
                onClick={isLoggedIn ? openMyPageModal : openLoginModal}
                className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-white shadow-lg transition-transform hover:bg-gray-600 active:scale-95'
              >
                <svg
                  className='h-6 w-6'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d={
                      isLoggedIn
                        ? 'M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z'
                        : 'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9'
                    }
                  />
                </svg>
              </button>
              <span className='absolute top-1/2 left-full ml-3 -translate-y-1/2 scale-0 rounded bg-gray-900 p-2 text-xs text-white transition-all group-hover:scale-100'>
                {isLoggedIn ? '마이페이지' : '로그인'}
              </span>
            </div>
            {/* 캔버스 버튼 */}
            <div className='group relative'>
              <button
                onClick={isLoggedIn ? openCanvasModal : openLoginModal}
                className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-white shadow-lg transition-transform hover:bg-gray-600 active:scale-95'
              >
                <svg
                  className='h-6 w-6'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125'
                  />
                </svg>
              </button>
              <span className='absolute top-1/2 left-full ml-3 -translate-y-1/2 scale-0 rounded bg-gray-900 p-2 text-xs text-white transition-all group-hover:scale-100'>
                캔버스
              </span>
            </div>
            {/* 앨범 버튼 */}
            <div className='group relative'>
              <button
                onClick={openAlbumModal}
                className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-white shadow-lg transition-transform hover:bg-gray-600 active:scale-95'
              >
                <svg
                  className='h-6 w-6'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z'
                  />
                </svg>
              </button>
              <span className='absolute top-1/2 left-full ml-3 -translate-y-1/2 scale-0 rounded bg-gray-900 p-2 text-xs text-white transition-all group-hover:scale-100'>
                앨범
              </span>
            </div>

            {/* 그룹 버튼 */}
            <div className='group relative'>
              <button
                onClick={isLoggedIn ? openGroupModal : openLoginModal}
                className='flex h-10 w-10 items-center justify-center rounded-full bg-gray-700 text-white shadow-lg transition-transform hover:bg-gray-600 active:scale-95'
              >
                <svg
                  className='h-6 w-6'
                  xmlns='http://www.w3.org/2000/svg'
                  fill='none'
                  viewBox='0 0 24 24'
                  strokeWidth={1.5}
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a3.75 3.75 0 015.962 0L12 15.75M12 15.75l-2.47-4.772a3.75 3.75 0 015.962 0L12 15.75zM21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </button>
              <span className='absolute top-1/2 left-full ml-3 -translate-y-1/2 scale-0 rounded bg-gray-900 p-2 text-xs text-white transition-all group-hover:scale-100'>
                그룹
              </span>
            </div>
          </div>
        )}
      </div>
      {/* 좌표 표시창 */}
      <div className='pointer-events-none fixed top-[50px] right-[20px] z-[9999] rounded-[8px] bg-[rgba(0,0,0,0.8)] p-[10px] text-white'>
        {hoverPos ? `(${hoverPos.x}, ${hoverPos.y})` : 'Canvas outside'}
      </div>

      {/* 팔레트 */}
      <div
        className={`pointer-events-auto fixed top-[100px] z-[9999] rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-slate-900/90 to-black/80 p-5 shadow-2xl backdrop-blur-xl transition-all duration-500 ease-out ${
          showPalette
            ? 'right-[20px] scale-100 opacity-100'
            : 'right-[-300px] scale-95 opacity-0'
        }`}
      >
        <div className='mb-5 grid grid-cols-2 gap-3'>
          {colors.map((c, index) => (
            <button
              key={index}
              onClick={() => {
                setColor(c);
                onSelectColor(c);
              }}
              style={{ backgroundColor: c }}
              className={`h-8 w-8 cursor-pointer rounded-full transition-all duration-300 hover:scale-125 hover:rotate-12 ${
                color === c
                  ? 'scale-110 shadow-lg ring-2 shadow-cyan-400/60 ring-cyan-300 ring-offset-2 ring-offset-slate-800'
                  : 'border border-white/30 hover:border-cyan-300/50 hover:shadow-md hover:shadow-white/20'
              }`}
            />
          ))}
        </div>

        {/*확정 버튼 */}
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
          className={`flex h-12 w-full items-center justify-center rounded-full transition-all duration-300 ${
            cooldown
              ? 'cursor-not-allowed border border-red-500/30 bg-red-500/20 text-red-400'
              : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg hover:scale-105 hover:from-emerald-400 hover:to-cyan-400 hover:shadow-emerald-400/30'
          } ${isPressed ? 'scale-95' : 'scale-100'}`}
        >
          {cooldown ? (
            <svg
              className='h-6 w-6 animate-spin'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              ></circle>
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
              ></path>
            </svg>
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
                strokeWidth={3}
                d='M13 10V3L4 14h7v7l9-11h-7z'
              />
            </svg>
          )}
        </button>
      </div>

      {/* 쿨타임 창 : 쿨타임 중에만 표시*/}
      {cooldown && (
        <div className='pointer-events-none fixed bottom-[20px] left-1/2 z-[9999] -translate-x-1/2 transform'>
          <div className='relative'>
            {/* 외부 링 */}
            <div
              className='h-16 w-16 animate-spin rounded-full border-4 border-red-500/60'
              style={{ animationDuration: '2s' }}
            ></div>
            {/* 중간 링 */}
            <div
              className='absolute inset-1 animate-spin rounded-full border-2 border-orange-400/50'
              style={{
                animationDuration: '1.5s',
                animationDirection: 'reverse',
              }}
            ></div>
            {/* 내부 원 */}
            <div className='absolute inset-3 flex animate-pulse items-center justify-center rounded-full border border-red-400/60 bg-gradient-to-br from-red-900/80 to-black/70 shadow-2xl backdrop-blur-xl'>
              <span className='animate-pulse font-mono text-xl font-bold tracking-wider text-red-300'>
                {timeLeft}
              </span>
            </div>
            {/* 글로우 효과 */}
            <div className='absolute inset-0 animate-ping rounded-full bg-red-500/15'></div>
            <div
              className='absolute inset-0 animate-ping rounded-full bg-orange-400/10'
              style={{ animationDelay: '1s' }}
            ></div>
          </div>
        </div>
      )}
    </>
  );
}
