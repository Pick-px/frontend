import React from 'react';

const Preloader = () => {
  const pixels = Array.from({ length: 64 }); // 8x8 그리드를 위해 64개의 픽셀 생성

  return (
    <div
      className='fixed inset-0 z-50 flex flex-col items-center justify-center'
      style={{
        backgroundImage: `url('/Creatives.png')`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundColor: '#2d3748', // PixelCanvas의 VIEWPORT_BACKGROUND_COLOR와 동일하게 설정
      }}
    >
      <div className='loader'>
        {pixels.map((_, index) => (
          <div
            key={index}
            className='pixel'
            style={{ animationDelay: `${Math.random() * 2}s` }} // 무작위 애니메이션 지연 시간 적용
          ></div>
        ))}
      </div>
      <p className='mt-8 text-xl font-bold text-white'>Loading Pixels...</p>
      <style>{`
        .loader {
          display: grid;
          grid-template-columns: repeat(8, 20px);
          grid-template-rows: repeat(8, 20px);
          gap: 4px;
        }

        .pixel {
          width: 20px;
          height: 20px;
          background-color: #333;
          animation: jump 2s infinite; /* 애니메이션 시간을 2초로 유지 */
        }

        @keyframes jump {
          0%, 100% {
            transform: translateY(0);
            background-color: #333;
          }
          8% {
            transform: translateY(-10px);
            background-color: #ff0000; /* Red */
          }
          16% {
            transform: translateY(0);
            background-color: #ffa500; /* Orange */
          }
          24% {
            transform: translateY(-10px);
            background-color: #ffff00; /* Yellow */
          }
          32% {
            transform: translateY(0);
            background-color: #008000; /* Green */
          }
          40% {
            transform: translateY(-10px);
            background-color: #0000ff; /* Blue */
          }
          48% {
            transform: translateY(0);
            background-color: #4b0082; /* Indigo */
          }
          56% {
            transform: translateY(-10px);
            background-color:rgba(0, 0, 0, 0); /* Violet */
          }
          64% {
            transform: translateY(0);
            background-color: #333;
          }
        }
      `}</style>
    </div>
  );
};

export default Preloader;
