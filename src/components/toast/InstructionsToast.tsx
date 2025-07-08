import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const showInstructionsToast = () => {
  toast(
    <div className='mx-auto max-w-2xl space-y-3 rounded-xl border border-cyan-400/50 bg-gray-800 p-4 font-sans shadow-lg'>
      <div className='text-base font-medium text-cyan-300'>How to Play</div>
      <div className='flex items-center space-x-3'>
        <svg
          className='h-6 w-6 text-cyan-400'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <rect x='7' y='4' width='10' height='16' rx='5' ry='5'></rect>
          <line x1='12' y1='4' x2='12' y2='10'></line>
          <circle cx='9.5' cy='7' r='1.5' fill='currentColor'></circle>
        </svg>
        <p className='text-gray-300'>
          <span className='text-sm font-bold text-white'>마우스 좌클릭:</span>{' '}
          <span className='text-sm'>픽셀 선택</span>
        </p>
      </div>
      <div className='flex items-center space-x-3'>
        <svg
          className='h-6 w-6 text-cyan-400'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M12 6v6m0 0v6m0-6h6m-6 0H6'
          />
        </svg>
        <p className='text-gray-300'>
          <span className='text-sm font-bold text-white'>마우스 휠:</span>{' '}
          <span className='text-sm'>확대/축소</span>
        </p>
      </div>
      <div className='flex items-center space-x-3'>
        <svg
          className='h-6 w-6 text-cyan-400'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <rect x='7' y='4' width='10' height='16' rx='5' ry='5'></rect>
          <line x1='12' y1='4' x2='12' y2='10'></line>
          <circle cx='9.5' cy='7' r='1.5' fill='currentColor'></circle>
        </svg>
        {/* <svg
          className='h-6 w-6 text-cyan-400'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <rect x='7' y='4' width='10' height='16' rx='5' ry='5'></rect>
          <line x1='12' y1='4' x2='12' y2='10'></line>
          <circle cx='14.5' cy='7' r='1.5' fill='currentColor'></circle>
        </svg> */}
        <p className='text-gray-300'>
          <span className='text-sm font-bold text-white'>
            마우스 좌클릭 후 드래그:
          </span>{' '}
          <span className='text-sm'>캔버스 이동</span>
        </p>
      </div>
      <div className='flex items-center space-x-3'>
        <svg
          className='h-6 w-6 text-cyan-400'
          fill='none'
          viewBox='0 0 24 24'
          stroke='currentColor'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth='2'
            d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
          />
        </svg>
        <p className='text-gray-300'>
          <span className='text-sm font-bold text-white'>이미지 첨부:</span>{' '}
          <span className='text-sm'>좌상단 이미지 버튼 클릭</span>
        </p>
      </div>
    </div>,
    {
      position: 'top-center',
      autoClose: 5000,
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
