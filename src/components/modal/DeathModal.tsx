import React from 'react';

interface DeathModalProps {
  isOpen: boolean;
}

const DeathModal: React.FC<DeathModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80">
      <div className="w-full max-w-md rounded-xl bg-gradient-to-b from-red-900/90 to-black/90 p-8 shadow-2xl border-2 border-red-500 text-center">
        <div className="text-8xl mb-4">☠️</div>
        <h2 className="text-4xl font-bold mb-6 text-red-400 animate-pulse">
          당신은 탈락했습니다!
        </h2>
        <p className="text-xl mb-8 text-white">모든 생명을 잃었습니다.</p>
        <p className="text-lg mb-2 text-gray-300">
          전장이 마무리될 때까지 잠시만 기다려주세요.
        </p>
      </div>
    </div>
  );
};

export default DeathModal;