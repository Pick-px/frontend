import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const showInstructionsToast = () => {
  toast(
    <div className='mx-auto max-w-md space-y-3 rounded-xl border border-cyan-400/50 bg-gray-800 p-4 font-sans shadow-lg'>
      <div className='text-xl font-medium text-cyan-300'>How to Play</div>
      <div className='flex items-center space-x-3'>
        <svg
          className='h-8 w-8 text-cyan-400'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          stroke-width='2'
          stroke-linecap='round'
          stroke-linejoin='round'
        >
          <rect x='7' y='4' width='10' height='16' rx='5' ry='5'></rect>
          <line x1='12' y1='4' x2='12' y2='10'></line>
          <circle cx='9.5' cy='7' r='1.5' fill='currentColor'></circle>
        </svg>
        <p className='text-gray-300'>
          <span className='font-bold text-white'>마우스 좌클릭:</span> 픽셀 선택
        </p>
      </div>
      <div className='flex items-center space-x-3'>
        <svg
          className='h-8 w-8 text-cyan-400'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            stroke-linecap='round'
            stroke-linejoin='round'
            stroke-width='2'
            d='M12 6v6m0 0v6m0-6h6m-6 0H6'
          />
        </svg>
        <p className='text-gray-300'>
          <span className='font-bold text-white'>마우스 휠:</span> 확대/축소
        </p>
      </div>
      <div className='flex items-center space-x-3'>
        <svg
          className='h-8 w-8 text-cyan-400'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          stroke-width='2'
          stroke-linecap='round'
          stroke-linejoin='round'
        >
          <rect x='7' y='4' width='10' height='16' rx='5' ry='5'></rect>
          <line x1='12' y1='4' x2='12' y2='10'></line>
          <circle cx='14.5' cy='7' r='1.5' fill='currentColor'></circle>
        </svg>
        <p className='text-gray-300'>
          <span className='font-bold text-white'>마우스 우클릭 후 드래그:</span>{' '}
          이동
        </p>
      </div>
    </div>,
    {
      position: 'top-center',
      autoClose: 10000, // 10초간 표시
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: 'dark',
      style: { backgroundColor: '#1f2937', color: 'white' },
    }
  );
};
