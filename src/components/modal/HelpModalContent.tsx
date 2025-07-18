import React from 'react';
import Slider from 'react-slick';
import { useViewport } from '../../hooks/useViewport';

export default function HelpModalContent() {
  const { width } = useViewport();
  const isMobile = width < 768;

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
  };

  const sections = [
    {
      title: '게임 소개',
      iconColor: 'blue',
      content: (
        <p className='leading-relaxed text-gray-300'>
          여러 사용자가 함께 참여하여 하나의 캔버스에 픽셀 아트를 그리는 협업
          게임입니다. 각자의 창의성을 발휘하여 멋진 작품을 만들어보세요!
          <p>(모바일도 게임을 즐길 수 있지만 PC에 최적화 되었어요!)</p>
        </p>
      ),
    },
    {
      title: '기본 조작법',
      iconColor: 'green',
      content: isMobile ? (
        <ul className='space-y-2 text-gray-300'>
          <li className='flex items-start'>
            <span className='mt-1 mr-2 h-2 w-2 rounded-full bg-green-400'></span>
            <span>
              <strong>터치:</strong> 픽셀 선택
            </span>
          </li>
          <li className='flex items-start'>
            <span className='mt-1 mr-2 h-2 w-2 rounded-full bg-green-400'></span>
            <span>
              <strong>두 손가락으로 확대/축소:</strong> 캔버스 확대/축소
            </span>
          </li>
          <li className='flex items-start'>
            <span className='mt-1 mr-2 h-2 w-2 rounded-full bg-green-400'></span>
            <span>
              <strong>한 손가락으로 드래그:</strong> 캔버스 이동
            </span>
          </li>
          <li className='flex items-start'>
            <span className='mt-1 mr-2 h-2 w-2 rounded-full bg-green-400'></span>
            <span>
              <strong>우측 최상단 컬러 피커:</strong> 원하는 색상 선택
            </span>
          </li>
          <li className='flex items-start'>
            <span className='mt-1 mr-2 h-2 w-2 rounded-full bg-green-400'></span>
            <span>
              <strong>우측 최상단 체크 버튼:</strong> 색상 칠하기
            </span>
          </li>
        </ul>
      ) : (
        <ul className='space-y-2 text-gray-300'>
          <li className='flex items-start'>
            <span className='mt-1 mr-2 h-2 w-2 rounded-full bg-green-400'></span>
            <span>
              <strong>클릭:</strong> 선택한 색상으로 픽셀 칠하기
            </span>
          </li>
          <li className='flex items-start'>
            <span className='mt-1 mr-2 h-2 w-2 rounded-full bg-green-400'></span>
            <span>
              <strong>마우스 휠:</strong> 캔버스 확대/축소
            </span>
          </li>
          <li className='flex items-start'>
            <span className='mt-1 mr-2 h-2 w-2 rounded-full bg-green-400'></span>
            <span>
              <strong>드래그:</strong> 캔버스 이동
            </span>
          </li>
          <li className='flex items-start'>
            <span className='mt-1 mr-2 h-2 w-2 rounded-full bg-green-400'></span>
            <span>
              <strong>컬러 팔레트:</strong> 원하는 색상 선택
            </span>
          </li>
          <li className='flex items-start'>
            <span className='mt-1 mr-2 h-2 w-2 rounded-full bg-green-400'></span>
            <span>
              <strong>키보드 방향키:</strong> 선택 픽셀 이동
            </span>
          </li>
          <li className='flex items-start'>
            <span className='mt-1 mr-2 h-2 w-2 rounded-full bg-green-400'></span>
            <span>
              <strong>Enter:</strong> 선택 색상으로 픽셀 칠하기
            </span>
          </li>
        </ul>
      ),
    },
    {
      title: '게임 규칙',
      iconColor: 'yellow',
      content: (
        <ul className='space-y-2 text-gray-300'>
          <li className='flex items-start'>
            <span className='mt-1 mr-2 h-2 w-2 rounded-full bg-yellow-400'></span>
            <span>
              <strong>쿨타임:</strong> 픽셀을 칠한 후 일정 시간 대기 필요
            </span>
          </li>
          <li className='flex items-start'>
            <span className='mt-1 mr-2 h-2 w-2 rounded-full bg-yellow-400'></span>
            <span>
              <strong>로그인 필수:</strong> 픽셀을 칠하려면 로그인이 필요합니다
            </span>
          </li>
          <li className='flex items-start'>
            <span className='mt-1 mr-2 h-2 w-2 rounded-full bg-yellow-400'></span>
            <span>
              <strong>실시간 동기화:</strong> 다른 사용자의 작업이 실시간으로
              반영됩니다
            </span>
          </li>
          <li className='flex items-start'>
            <span className='mt-1 mr-2 h-2 w-2 rounded-full bg-yellow-400'></span>
            <span>
              <strong>협업 정신:</strong> 다른 사용자의 작품을 존중해주세요
            </span>
          </li>
        </ul>
      ),
    },
    {
      title: '추가 기능',
      iconColor: 'purple',
      content: (
        <ul className='space-y-2 text-gray-300'>
          <li className='flex items-start'>
            <span className='mt-1 mr-2 h-2 w-2 rounded-full bg-purple-400'></span>
            <span>
              <strong>이미지 업로드:</strong> 참고용 이미지를 업로드할 수
              있습니다
            </span>
          </li>
          <li className='flex items-start'>
            <span className='mt-1 mr-2 h-2 w-2 rounded-full bg-purple-400'></span>
            <span>
              <strong>투명도 조절:</strong> 업로드한 이미지의 투명도를 조절할 수
              있습니다
            </span>
          </li>
          <li className='flex items-start'>
            <span className='mt-1 mr-2 h-2 w-2 rounded-full bg-purple-400'></span>
            <span>
              <strong>채팅:</strong> 다른 사용자들과 실시간으로 소통할 수
              있습니다
            </span>
          </li>
          <li className='flex items-start'>
            <span className='mt-1 mr-2 h-2 w-2 rounded-full bg-purple-400'></span>
            <span>
              <strong>그룹 기능:</strong> 그룹을 만들어 함께 작업할 수 있습니다
            </span>
          </li>
        </ul>
      ),
    },
    {
      title: '유용한 팁',
      iconColor: 'red',
      content: (
        <ul className='space-y-2 text-gray-300'>
          <li className='flex items-start'>
            <span className='mt-1 mr-2 h-2 w-2 rounded-full bg-red-400'></span>
            <span>작은 디테일부터 시작해서 점진적으로 확장해보세요</span>
          </li>
          <li className='flex items-start'>
            <span className='mt-1 mr-2 h-2 w-2 rounded-full bg-red-400'></span>
            <span>다른 사용자들과 협력하여 더 큰 작품을 만들어보세요</span>
          </li>
          <li className='flex items-start'>
            <span className='mt-1 mr-2 h-2 w-2 rounded-full bg-red-400'></span>
            <span>채팅을 통해 작업 계획을 공유해보세요</span>
          </li>
        </ul>
      ),
    },
  ];

  const renderSections = () => {
    return sections.map((section, index) => (
      <section key={index}>
        <h3
          className={`mb-3 flex items-center text-lg font-semibold text-${section.iconColor}-300`}
        >
          {section.title}
        </h3>
        {section.content}
      </section>
    ));
  };

  return (
    <div className='rounded-xl bg-gradient-to-br from-slate-900/95 to-slate-800/95 p-6'>
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
      {isMobile ? (
        <Slider {...settings}>
          {sections.map((section, index) => (
            <div key={index} className='px-2'>
              <h3
                className={`mb-3 flex items-center text-lg font-semibold text-${section.iconColor}-300`}
              >
                {section.title}
              </h3>
              {section.content}
            </div>
          ))}
        </Slider>
      ) : (
        <div className='max-h-96 space-y-6 overflow-y-auto'>
          {renderSections()}
        </div>
      )}

      {/* 푸터 */}
      <div className='mt-6 border-t border-gray-600 pt-4 text-center'>
        <p className='text-sm text-gray-400'>
          즐거운 픽셀 아트 여행을 시작해보세요! 🎨
        </p>
      </div>
    </div>
  );
}
