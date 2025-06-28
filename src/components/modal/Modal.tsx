import React from 'react';
import ReactDOM from 'react-dom';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode; // ✨ 모달 안에 들어올 내용물
};

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  // Portal을 사용하여 modal-root에 렌더링
  return ReactDOM.createPortal(
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'
      onClick={onClose}
    >
      <div
        className='relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl'
        onClick={(e) => e.stopPropagation()}
      >
        {/* 3. 닫기 버튼 */}
        <button
          onClick={onClose}
          className='absolute top-2 right-2 rounded-full p-1 text-gray-500 hover:bg-gray-200'
        >
          {/* SVG로 만든 X 아이콘 */}
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6'
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
        {/* ✨ 4. 부모로부터 받은 내용물(children)을 이곳에 렌더링 */}
        {children}
      </div>
    </div>,
    document.getElementById('modal-root')! // public/index.html에 이 div가 있어야 함
  );
}
