import React from 'react';
import ReactDOM from 'react-dom';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'
      onClick={onClose}
    >
      <div
        className='relative w-full max-w-lg max-h-[80vh] rounded-xl border border-white/30 shadow-2xl backdrop-blur-md text-white bg-gradient-to-br from-slate-900/90 to-slate-800/90 transition-all duration-300 ease-out'
        onClick={(e) => e.stopPropagation()}
        style={{
          transitionProperty: 'height, min-height, max-height, transform',
          transformOrigin: 'top center', // 상단을 기준으로 애니메이션
        }}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className='absolute top-3 right-3 z-10 rounded-full p-2 text-white/70 hover:text-white hover:bg-white/20 transition-all duration-200'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
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
        
        {/* 모달 콘텐츠 - 자동 높이 조절 */}
        <div className='flex flex-col min-h-0'>
          {children}
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')!
  );
}
