import React from 'react';

export default function HelpModalContent() {
  return (
    <div className='bg-gradient-to-br from-slate-900/95 to-slate-800/95 p-6 rounded-xl'>
      {/* 헤더 */}
      <div className='mb-6 text-center'>
        <div className='mb-2 flex items-center justify-center'>
          <div className='rounded-full bg-blue-500/20 p-3'>
            <svg
              className='h-8 w-8 text-blue-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
        </div>
        <h2 className='text-2xl font-bold text-white'>게임 가이드</h2>
        <p className='text-sm text-gray-300'>픽셀 아트 게임의 규칙과 사용법</p>
      </div>

      {/* 콘텐츠 */}
      <div className='max-h-96 overflow-y-auto space-y-6'>
        {/* 게임 소개 */}
        <section>
          <h3 className='mb-3 flex items-center text-lg font-semibold text-blue-300'>
            <svg className='mr-2 h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' />
            </svg>
            게임 소개
          </h3>
          <p className='text-gray-300 leading-relaxed'>
            여러 사용자가 함께 참여하여 하나의 캔버스에 픽셀 아트를 그리는 협업 게임입니다. 
            각자의 창의성을 발휘하여 멋진 작품을 만들어보세요!
          </p>
        </section>

        {/* 기본 조작법 */}
        <section>
          <h3 className='mb-3 flex items-center text-lg font-semibold text-green-300'>
            <svg className='mr-2 h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
            기본 조작법
          </h3>
          <ul className='space-y-2 text-gray-300'>
            <li className='flex items-start'>
              <span className='mr-2 mt-1 h-2 w-2 rounded-full bg-green-400'></span>
              <span><strong>클릭:</strong> 선택한 색상으로 픽셀 칠하기</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-2 mt-1 h-2 w-2 rounded-full bg-green-400'></span>
              <span><strong>마우스 휠:</strong> 캔버스 확대/축소</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-2 mt-1 h-2 w-2 rounded-full bg-green-400'></span>
              <span><strong>드래그:</strong> 캔버스 이동</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-2 mt-1 h-2 w-2 rounded-full bg-green-400'></span>
              <span><strong>컬러 팔레트:</strong> 원하는 색상 선택</span>
            </li>
          </ul>
        </section>

        {/* 게임 규칙 */}
        <section>
          <h3 className='mb-3 flex items-center text-lg font-semibold text-yellow-300'>
            <svg className='mr-2 h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8zm6 2a1 1 0 100-2 1 1 0 000 2z' clipRule='evenodd' />
            </svg>
            게임 규칙
          </h3>
          <ul className='space-y-2 text-gray-300'>
            <li className='flex items-start'>
              <span className='mr-2 mt-1 h-2 w-2 rounded-full bg-yellow-400'></span>
              <span><strong>쿨타임:</strong> 픽셀을 칠한 후 일정 시간 대기 필요</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-2 mt-1 h-2 w-2 rounded-full bg-yellow-400'></span>
              <span><strong>로그인 필수:</strong> 픽셀을 칠하려면 로그인이 필요합니다</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-2 mt-1 h-2 w-2 rounded-full bg-yellow-400'></span>
              <span><strong>실시간 동기화:</strong> 다른 사용자의 작업이 실시간으로 반영됩니다</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-2 mt-1 h-2 w-2 rounded-full bg-yellow-400'></span>
              <span><strong>협업 정신:</strong> 다른 사용자의 작품을 존중해주세요</span>
            </li>
          </ul>
        </section>

        {/* 추가 기능 */}
        <section>
          <h3 className='mb-3 flex items-center text-lg font-semibold text-purple-300'>
            <svg className='mr-2 h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
              <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
            </svg>
            추가 기능
          </h3>
          <ul className='space-y-2 text-gray-300'>
            <li className='flex items-start'>
              <span className='mr-2 mt-1 h-2 w-2 rounded-full bg-purple-400'></span>
              <span><strong>이미지 업로드:</strong> 참고용 이미지를 업로드할 수 있습니다</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-2 mt-1 h-2 w-2 rounded-full bg-purple-400'></span>
              <span><strong>투명도 조절:</strong> 업로드한 이미지의 투명도를 조절할 수 있습니다</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-2 mt-1 h-2 w-2 rounded-full bg-purple-400'></span>
              <span><strong>채팅:</strong> 다른 사용자들과 실시간으로 소통할 수 있습니다</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-2 mt-1 h-2 w-2 rounded-full bg-purple-400'></span>
              <span><strong>그룹 기능:</strong> 그룹을 만들어 함께 작업할 수 있습니다</span>
            </li>
          </ul>
        </section>

        {/* 팁 */}
        <section>
          <h3 className='mb-3 flex items-center text-lg font-semibold text-red-300'>
            <svg className='mr-2 h-5 w-5' fill='currentColor' viewBox='0 0 20 20'>
              <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z' clipRule='evenodd' />
            </svg>
            유용한 팁
          </h3>
          <ul className='space-y-2 text-gray-300'>
            <li className='flex items-start'>
              <span className='mr-2 mt-1 h-2 w-2 rounded-full bg-red-400'></span>
              <span>작은 디테일부터 시작해서 점진적으로 확장해보세요</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-2 mt-1 h-2 w-2 rounded-full bg-red-400'></span>
              <span>다른 사용자들과 협력하여 더 큰 작품을 만들어보세요</span>
            </li>
            <li className='flex items-start'>
              <span className='mr-2 mt-1 h-2 w-2 rounded-full bg-red-400'></span>
              <span>채팅을 통해 작업 계획을 공유해보세요</span>
            </li>
          </ul>
        </section>
      </div>

      {/* 푸터 */}
      <div className='mt-6 pt-4 border-t border-gray-600 text-center'>
        <p className='text-sm text-gray-400'>
          즐거운 픽셀 아트 여행을 시작해보세요! 🎨
        </p>
      </div>
    </div>
  );
}
