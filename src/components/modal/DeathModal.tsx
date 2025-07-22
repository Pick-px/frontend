import React, { useState, useEffect } from 'react';

interface DeathModalProps {
  isOpen: boolean;
}

const DeathModal: React.FC<DeathModalProps> = ({ isOpen }) => {
  const [isTransparent, setIsTransparent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // 3초 후에 투명 모드로 전환
      const timer = setTimeout(() => {
        setIsTransparent(true);
      }, 3000);

      return () => clearTimeout(timer);
    } else {
      setIsTransparent(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center ${isTransparent ? 'bg-black/20' : 'bg-black/40'} transition-all duration-700`}
    >
      <div
        className={`w-full max-w-md rounded-xl ${isTransparent ? 'border-red-500/30 bg-gradient-to-b from-red-900/20 to-black/20' : 'border-red-500 bg-gradient-to-b from-red-900/90 to-black/90'} border-2 p-8 text-center shadow-2xl transition-all duration-700`}
      >
        <div
          className={`mb-4 text-2xl font-bold transition-all duration-700 ${isTransparent ? 'text-white opacity-40' : 'opacity-100'}`}
        >
          {isTransparent ? (
            '관전모드로 변경되었습니다'
          ) : (
            <span className='mb-4 text-8xl'>☠️</span>
          )}
        </div>
        {!isTransparent && (
          <>
            <h2 className='mb-6 animate-pulse text-4xl font-bold text-red-400 transition-all duration-700'>
              당신은 탈락했습니다!
            </h2>
            <p className='mb-8 text-xl text-white transition-all duration-700'>
              모든 생명을 잃었습니다.
            </p>
            <p className='mb-2 text-lg text-gray-300 transition-all duration-700'>
              전장이 마무리될 때까지 잠시만 기다려주세요.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default DeathModal;
