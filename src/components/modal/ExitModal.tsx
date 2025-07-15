import React from 'react';

interface ExitModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ExitModal: React.FC<ExitModalProps> = ({ isOpen, onCancel, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70'>
      <div className='w-full max-w-md rounded-xl bg-gray-900 p-6 shadow-2xl'>
        <div className='mb-4 flex items-center justify-between'>
          <h3 className='text-xl font-bold text-white'>게임 탈락</h3>
          <div className='rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white'>
            주의
          </div>
        </div>

        <p className='mb-6 text-lg text-white'>
          정말 게임을 포기하시겠습니까? 지금 나가면 모든 진행 상황이
          사라집니다! 😱
        </p>

        <div className='flex gap-4'>
          <button
            className='flex-1 rounded-lg bg-gray-700 py-3 font-bold text-gray-300 transition-all hover:bg-gray-600'
            onClick={onCancel}
          >
            계속하기
          </button>
          <button
            className='flex-1 rounded-lg bg-gradient-to-r from-red-500 to-red-700 py-3 font-bold text-white transition-all hover:from-red-600 hover:to-red-800'
            onClick={onConfirm}
          >
            나가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitModal;