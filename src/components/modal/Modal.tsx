import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  disableOutsideClick?: boolean; // 새로운 prop 추가
};

export default function Modal({
  isOpen,
  onClose,
  children,
  disableOutsideClick = false,
}: ModalProps) {
  if (!isOpen) return null;

  // ESC 키를 눌렀을 때 모달 닫기 (disableOutsideClick이 false일 때만)
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !disableOutsideClick) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, disableOutsideClick]);

  return ReactDOM.createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm'
      onClick={disableOutsideClick ? undefined : onClose} // 조건부 onClick
    >
      <div
        className='relative w-full max-w-md rounded-xl border border-white/30 text-white shadow-2xl backdrop-blur-md'
        onClick={(e) => e.stopPropagation()}
        style={{
          transitionProperty: 'height, min-height, max-height, transform',
          transformOrigin: 'top center', // 상단을 기준으로 애니메이션
        }}
      >
        {/* 닫기 버튼 (disableOutsideClick이 false일 때만 렌더링) */}
        {!disableOutsideClick && (
          <button
            onClick={onClose}
            className='absolute top-3 right-3 z-10 rounded-full p-2 text-white/70 transition-all duration-200 hover:bg-white/20 hover:text-white'
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
        )}

        {/* 모달 콘텐츠 - 자동 높이 조절 */}
        <div className='flex min-h-0 flex-col'>{children}</div>
      </div>
    </div>,
    document.getElementById('modal-root')!
  );
}
