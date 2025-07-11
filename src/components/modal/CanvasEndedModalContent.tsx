import React from 'react';
import { useNavigate } from 'react-router-dom';

type CanvasEndedModalContentProps = {
  onClose: () => void;
};

const CanvasEndedModalContent: React.FC<CanvasEndedModalContentProps> = ({ onClose }) => {
  const navigate = useNavigate();

  const handleGoToMain = () => {
    onClose();
    navigate('/');
  };

  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-bold text-white mb-4">캔버스 종료</h2>
      <p className="text-gray-300 mb-6">이 캔버스는 현재 종료되었습니다.</p>
      <button
        onClick={handleGoToMain}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
      >
        메인으로 이동
      </button>
    </div>
  );
};

export default CanvasEndedModalContent;
