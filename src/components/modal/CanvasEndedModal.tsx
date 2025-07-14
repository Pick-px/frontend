import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useModalStore } from '../../store/modalStore'; // useModalStore import 추가

const CanvasEndedModal = () => {
  const navigate = useNavigate();
  const { closeCanvasEndedModal } = useModalStore(); // closeCanvasEndedModal 가져오기

  const handleGoToMain = () => {
    closeCanvasEndedModal(); // 모달 닫기
    navigate('/');
  };

  return (
    <div className='bg-opacity-75 fixed inset-0 z-900 flex items-center justify-center bg-black'>
      <div className='rounded-lg bg-gray-800 p-8 text-center shadow-xl'>
        <h2 className='mb-4 text-2xl font-bold text-white'>
          캔버스 이벤트 종료
        </h2>
        <p className='mb-6 text-gray-300'>
          캔버스 이벤트가 종료되었습니다. <br /> 참여해주셔서 감사합니다.
        </p>
        <button
          onClick={handleGoToMain}
          className='rounded bg-blue-600 px-6 py-2 font-semibold text-white transition-colors duration-200 hover:bg-blue-700'
        >
          메인으로 이동
        </button>
      </div>
    </div>
  );
};

export default CanvasEndedModal;
