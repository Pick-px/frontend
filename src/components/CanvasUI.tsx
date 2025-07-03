import React, { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/authStrore';
import { useModalStore } from '../store/modalStore';

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
}: CanvasUIProps) {
  const [isPressed, setIsPressed] = useState(false);
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
                    d={isLoggedIn ? 'M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z' : 'M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9'}
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
                onClick={openCanvasModal}
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
                onClick={openGroupModal}
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
      <div className='pointer-events-auto fixed top-[100px] right-[20px] z-[9999] flex flex-col gap-[8px] rounded-[8px] bg-[rgba(0,0,0,0.8)] p-[10px]'>
        {colors.map((c, index) => (
          <button
            key={index}
            onClick={() => {
              setColor(c); // 기존 색상 업데이트
              onSelectColor(c); // 선택된 색상으로 즉시 preview 칠하기
            }}
            style={{ backgroundColor: c }}
            className={`h-[40px] w-[40px] cursor-pointer rounded-[4px] ${
              color === c
                ? 'border-[3px] border-solid border-white'
                : 'border border-solid border-[#666]'
            }`}
          />
        ))}

        {/*확정 버튼 */}
        <button
          disabled={cooldown}
          onMouseDown={() => !cooldown && setIsPressed(true)}
          onMouseUp={() => {
            setIsPressed(false);
            if (cooldown) return;
            if (isLoggedIn) {
              onConfirm();
            } else {
              openLoginModal();
            }
          }}
          onMouseLeave={() => setIsPressed(false)}
          className={`mt-[8px] h-[40px] w-full cursor-pointer rounded-[4px] bg-white font-medium text-black transition-transform duration-100 ${
            isPressed ? 'scale-95' : 'scale-100'
          } ${cooldown ? 'cursor-not-allowed opacity-50' : ''} }`}
        >
          {cooldown ? `쿨다운` : '확정'}
        </button>
      </div>

      {/* 쿨타임 창 : 쿨타임 중에만 표시*/}
      {cooldown && (
        <div className='pointer-events-none fixed bottom-[20px] left-1/2 z-[9999] -translate-x-1/2 transform rounded-[8px] bg-red-600 p-[10px] font-bold text-white'>
          ⏳ {timeLeft}s
        </div>
      )}
    </>
  );
}
