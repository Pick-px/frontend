import React, { useEffect, useRef, useState } from 'react';

import { ToastContainer, toast } from 'react-toastify';

import 'react-toastify/dist/ReactToastify.css';
import { useAuthStore } from '../../store/authStrore';
import { useModalStore } from '../../store/modalStore';
import { showInstructionsToast } from '../toast/InstructionsToast';
import { useCanvasUiStore } from '../../store/canvasUiStore';
import UserCount from './UserCount';
import { CanvasType } from './canvasConstants';

// type HoverPos = { x: number; y: number } | null;

type CanvasUIProps = {
  onConfirm: () => void;
  onSelectColor: (color: string) => void;
  onImageAttach: (file: File) => void;
  onImageDelete: () => void;
  hasImage: boolean;
  colors: string[];
  isBgmPlaying: boolean;
  toggleBgm: () => void;
  canvasType: CanvasType;
};

export default function CanvasUIPC({
  onConfirm,
  onSelectColor,
  onImageAttach,
  onImageDelete,
  hasImage,
  colors,
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

  // 드롭다움 열림, 닫힘 상태
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   showInstructionsToast();
  // }, []);

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
      {/* 이미지 업로드 */}
      <div className='pointer-events-auto fixed bottom-4 left-14 z-[100] flex gap-2'>
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
                        min='0'
                        max='1'
                        step='0.1'
                        value={imageTransparency}
                        onChange={(e) =>
                          setImageTransparency(parseFloat(e.target.value))
                        }
                        className='h-2 w-[60px] cursor-pointer appearance-none rounded-lg bg-gray-600'
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

      <div
        ref={menuRef}
        className='pointer-events-auto fixed top-[10px] left-[10px] z-60'
      >
        {/* 항상 보이는 메뉴 토글 버튼 (햄버거 아이콘) */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className='font-press-start relative inline-block bg-[#E76E55] px-6 py-2 text-xs text-white no-underline shadow-[inset_-2px_-2px_0px_0px_#8C2022] before:absolute before:-top-[4px] before:left-0 before:box-content before:h-full before:w-full before:border-t-[4px] before:border-b-[4px] before:border-gray-700 before:content-[""] after:absolute after:top-0 after:-left-[4px] after:box-content after:h-full after:w-full after:border-r-[4px] after:border-l-[4px] after:border-gray-700 after:content-[""] hover:bg-[#CE372B] hover:shadow-[inset_-3px_-3px_0px_0px_#8C2022] active:shadow-[inset_2px_2px_0px_0px_#8C2022]'
        >
          <span style={{ fontFamily: '"Press Start 2P", cursive' }}>Menu</span>
        </button>

        {/* 도움말 버튼 - 메뉴 버튼 오른쪽에 배치 */}
        <button
          onClick={openHelpModal}
          className='font-press-start relative ml-2 inline-block bg-[#92CD41] px-4 py-2 text-xs text-white no-underline shadow-[inset_-2px_-2px_0px_0px_#45841B] before:absolute before:-top-[4px] before:left-0 before:box-content before:h-full before:w-full before:border-t-[4px] before:border-b-[4px] before:border-gray-700 before:content-[""] after:absolute after:top-0 after:-left-[4px] after:box-content after:h-full after:w-full after:border-r-[4px] after:border-l-[4px] after:border-gray-700 after:content-[""] hover:bg-[#7CB342] hover:shadow-[inset_-3px_-3px_0px_0px_#366915] active:shadow-[inset_2px_2px_0px_0px_#366915]'
          title='게임 가이드'
        >
          <span style={{ fontFamily: '"Press Start 2P", cursive' }}>?</span>
        </button>

        {/* isMenuOpen이 true일 때만 드롭다운 메뉴가 보입니다. */}
        {isMenuOpen && (
          <div className='absolute top-full mt-3 flex min-w-[80px] flex-col gap-3'>
            {/* 로그인/마이페이지 버튼 */}
            <button
              onClick={isLoggedIn ? openMyPageModal : openLoginModal}
              className='font-press-start relative inline-block w-full bg-yellow-500 px-4 py-2 text-center text-[10px] text-white no-underline shadow-[inset_-2px_-2px_0px_0px_#92400E] before:absolute before:-top-[4px] before:left-0 before:box-content before:h-full before:w-full before:border-t-[4px] before:border-b-[4px] before:border-gray-700 before:content-[""] after:absolute after:top-0 after:-left-[4px] after:box-content after:h-full after:w-full after:border-r-[4px] after:border-l-[4px] after:border-gray-700 after:content-[""] hover:bg-yellow-600 hover:shadow-[inset_-3px_-3px_0px_0px_#713F12] active:shadow-[inset_2px_2px_0px_0px_#713F12]'
            >
              <span style={{ fontFamily: '"Press Start 2P", cursive' }}>
                {isLoggedIn ? 'MyPage' : 'Login'}
              </span>
            </button>
            {/* 그룹 버튼 */}
            <button
              onClick={isLoggedIn ? openGroupModal : openLoginModal}
              className='font-press-start relative inline-block w-full bg-[#92CD41] px-4 py-2 text-center text-[10px] text-white no-underline shadow-[inset_-2px_-2px_0px_0px_#45841B] before:absolute before:-top-[4px] before:left-0 before:box-content before:h-full before:w-full before:border-t-[4px] before:border-b-[4px] before:border-gray-700 before:content-[""] after:absolute after:top-0 after:-left-[4px] after:box-content after:h-full after:w-full after:border-r-[4px] after:border-l-[4px] after:border-gray-700 after:content-[""] hover:bg-[#7CB342] hover:shadow-[inset_-3px_-3px_0px_0px_#366915] active:shadow-[inset_2px_2px_0px_0px_#366915]'
            >
              <span style={{ fontFamily: '"Press Start 2P", cursive' }}>
                Group
              </span>
            </button>
            {/* 캔버스 버튼 */}
            <button
              onClick={isLoggedIn ? openCanvasModal : openLoginModal}
              className='font-press-start relative inline-block w-full bg-[#92CD41] px-4 py-2 text-center text-[10px] text-white no-underline shadow-[inset_-2px_-2px_0px_0px_#45841B] before:absolute before:-top-[4px] before:left-0 before:box-content before:h-full before:w-full before:border-t-[4px] before:border-b-[4px] before:border-gray-700 before:content-[""] after:absolute after:top-0 after:-left-[4px] after:box-content after:h-full after:w-full after:border-r-[4px] after:border-l-[4px] after:border-gray-700 after:content-[""] hover:bg-[#7CB342] hover:shadow-[inset_-3px_-3px_0px_0px_#366915] active:shadow-[inset_2px_2px_0px_0px_#366915]'
            >
              <span style={{ fontFamily: '"Press Start 2P", cursive' }}>
                Canvas
              </span>
            </button>
            {/* 게임 버튼 */}
            <button
              onClick={isLoggedIn ? openGameModal : openLoginModal}
              className='font-press-start relative inline-block w-full bg-[#92CD41] px-4 py-2 text-center text-[10px] text-white no-underline shadow-[inset_-2px_-2px_0px_0px_#45841B] before:absolute before:-top-[4px] before:left-0 before:box-content before:h-full before:w-full before:border-t-[4px] before:border-b-[4px] before:border-gray-700 before:content-[""] after:absolute after:top-0 after:-left-[4px] after:box-content after:h-full after:w-full after:border-r-[4px] after:border-l-[4px] after:border-gray-700 after:content-[""] hover:bg-[#7CB342] hover:shadow-[inset_-3px_-3px_0px_0px_#366915] active:shadow-[inset_2px_2px_0px_0px_#366915]'
            >
              <span style={{ fontFamily: '"Press Start 2P", cursive' }}>
                Game
              </span>
            </button>
            {/* 갤러리 버튼 */}
            <button
              onClick={openAlbumModal}
              className='font-press-start relative inline-block w-full bg-[#92CD41] px-4 py-2 text-center text-[10px] text-white no-underline shadow-[inset_-2px_-2px_0px_0px_#45841B] before:absolute before:-top-[4px] before:left-0 before:box-content before:h-full before:w-full before:border-t-[4px] before:border-b-[4px] before:border-gray-700 before:content-[""] after:absolute after:top-0 after:-left-[4px] after:box-content after:h-full after:w-full after:border-r-[4px] after:border-l-[4px] after:border-gray-700 after:content-[""] hover:bg-[#7CB342] hover:shadow-[inset_-3px_-3px_0px_0px_#366915] active:shadow-[inset_2px_2px_0px_0px_#366915]'
            >
              <span style={{ fontFamily: '"Press Start 2P", cursive' }}>
                Album
              </span>
            </button>
            {/* BGM 버튼 */}
            <button
              onClick={toggleBgm}
              className='font-press-start relative inline-block w-full bg-[#92CD41] px-4 py-2 text-center text-[8px] text-white no-underline shadow-[inset_-2px_-2px_0px_0px_#45841B] before:absolute before:-top-[4px] before:left-0 before:box-content before:h-full before:w-full before:border-t-[4px] before:border-b-[4px] before:border-gray-700 before:content-[""] after:absolute after:top-0 after:-left-[4px] after:box-content after:h-full after:w-full after:border-r-[4px] after:border-l-[4px] after:border-gray-700 after:content-[""] hover:bg-[#7CB342] hover:shadow-[inset_-3px_-3px_0px_0px_#366915] active:shadow-[inset_2px_2px_0px_0px_#366915]'
            >
              <span style={{ fontFamily: '"Press Start 2P", cursive' }}>
                {isBgmPlaying ? 'BGM Off' : 'BGM On'}
              </span>
            </button>
          </div>
        )}
      </div>
      {/* 팔레트 */}
      <div
        className={`pointer-events-auto fixed top-1/2 z-[9999] -translate-y-1/2 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-slate-900/90 to-black/80 p-5 shadow-2xl backdrop-blur-xl transition-all duration-500 ease-out ${
          showPalette
            ? 'right-[20px] scale-100 opacity-100'
            : 'right-[-300px] scale-95 opacity-0'
        }`}
      >
        {/* 좌표 표시창 */}
        <div className='pointer-events-none top-[100px] right-[20px] z-[9999] w-20 rounded-[8px] bg-transparent p-[10px] text-center text-xs font-bold text-white'>
          {hoverPos ? `(${hoverPos.x},${hoverPos.y})` : 'OutSide'}
        </div>
        {canvasType !== CanvasType.EVENT_COLORLIMIT && (
          <input
            type='color'
            value={color}
            onChange={(e) => {
              const newColor = e.target.value;
              setColor(newColor);
              onSelectColor(newColor);
            }}
            id='color-picker'
            className='mb-3 h-[40px] w-20 cursor-pointer rounded-[4px] border-2 border-solid border-white p-0'
            title='색상 선택'
          />
        )}
        <button
          onClick={clearSelectedPixel}
          className='absolute top-0 right-1 cursor-pointer p-1 text-gray-400 transition-colors hover:text-white'
          title='닫기'
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
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
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
              ? 'cursor-not-allowed border-4 border-red-600 bg-red-500/40 text-red-300 shadow-lg shadow-red-500/50'
              : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg hover:scale-105 hover:from-emerald-400 hover:to-cyan-400 hover:shadow-emerald-400/30'
          } ${isPressed ? 'scale-95' : 'scale-100'}`}
        >
          {cooldown ? (
            <div className='flex items-center justify-center'>
              <span className='animate-pulse font-mono text-xl font-bold tracking-wider text-red-300'>
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
      {/* 접속자수 표시 */}
      <UserCount />

      {/* 쿨타임 창 제거 - 확정 버튼으로 이동 */}
    </>
  );
}
