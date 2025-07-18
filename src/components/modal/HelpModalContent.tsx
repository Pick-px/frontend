import React, { useEffect, useState, useRef } from 'react';
import { useViewport } from '../../hooks/useViewport';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// 캐러셀 커스텀 스타일
const carouselStyles = `
  .help-carousel .slick-prev,
  .help-carousel .slick-next {
    z-index: 10;
    width: 30px;
    height: 30px;
  }
  
  .help-carousel .slick-prev {
    left: -5px;
  }
  
  .help-carousel .slick-next {
    right: -5px;
  }
  
  .help-carousel .slick-prev:before,
  .help-carousel .slick-next:before {
    font-size: 24px;
    opacity: 0.7;
  }
  
  .help-carousel .slick-dots {
    bottom: -25px;
  }
  
  .carousel-container {
    padding: 0 20px;
  }
`;

type HelpModalContentProps = {
  onClose?: () => void;
};

type TabType = 'group' | 'chat' | 'gallery' | 'canvas' | 'sound';

// 캐러셀 아이템 타입 정의
type CarouselItem = {
  title: string;
  description: string;
  image: string; // 이미지 경로 또는 placeholder
  color: string;
};

export default function HelpModalContent({ onClose }: HelpModalContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>('group');
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [contentHeight, setContentHeight] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const { width } = useViewport();
  const isMobile = width < 768;

  // 캐러셀 설정
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: false,
    arrows: true,
    adaptiveHeight: true,
    className: 'help-carousel',
  };

  // 그룹 탭 캐러셀 아이템
  const groupCarouselItems: CarouselItem[] = [
    {
      title: '그룹 생성하기',
      description: '원하는 이름과 최대 인원수를 설정하여 나만의 그룹을 만들 수 있습니다. 그룹을 만들면 다른 사용자들과 함께 작업할 수 있는 공간이 생성됩니다.',
      image: '/placeholder-group-create.png', // 실제 이미지로 교체 필요
      color: 'blue',
    },
    {
      title: '그룹 참여하기',
      description: '다른 사용자가 만든 그룹에 참여할 수 있습니다. 그룹 이름으로 검색하거나 목록에서 원하는 그룹을 찾아 참여해보세요.',
      image: '/placeholder-group-join.png', // 실제 이미지로 교체 필요
      color: 'green',
    },
    {
      title: '그룹 채팅',
      description: '그룹 멤버들과 실시간으로 소통할 수 있는 채팅 기능을 제공합니다. 작업 계획을 공유하고 협업하세요.',
      image: '/placeholder-group-chat.png', // 실제 이미지로 교체 필요
      color: 'purple',
    },
  ];

  // 채팅 탭 캐러셀 아이템
  const chatCarouselItems: CarouselItem[] = [
    {
      title: '전체 채팅',
      description: '모든 사용자와 실시간으로 소통할 수 있는 전체 채팅 기능입니다. 다양한 아이디어를 공유해보세요.',
      image: '/placeholder-chat-all.png', // 실제 이미지로 교체 필요
      color: 'green',
    },
    {
      title: '그룹 채팅',
      description: '그룹 멤버들과만 소통할 수 있는 비공개 채팅 기능입니다. 그룹 작업에 집중해보세요.',
      image: '/placeholder-chat-group.png', // 실제 이미지로 교체 필요
      color: 'blue',
    },
    {
      title: '이모티콘 사용하기',
      description: '다양한 이모티콘을 사용하여 더 풍부한 소통을 할 수 있습니다. 감정을 표현해보세요.',
      image: '/placeholder-chat-emoji.png', // 실제 이미지로 교체 필요
      color: 'yellow',
    },
  ];

  // 갤러리 탭 캐러셀 아이템
  const galleryCarouselItems: CarouselItem[] = [
    {
      title: '작품 감상하기',
      description: '다른 사용자들이 만든 다양한 픽셀 아트 작품을 감상할 수 있습니다. 새로운 영감을 얻어보세요.',
      image: '/placeholder-gallery-view.png', // 실제 이미지로 교체 필요
      color: 'yellow',
    },
    {
      title: '작품 저장하기',
      description: '마음에 드는 작품을 저장하여 나중에 다시 볼 수 있습니다. 나만의 컬렉션을 만들어보세요.',
      image: '/placeholder-gallery-save.png', // 실제 이미지로 교체 필요
      color: 'green',
    },
    {
      title: '작품 공유하기',
      description: 'SNS에 작품을 공유하여 더 많은 사람들에게 자신의 창작물을 보여줄 수 있습니다.',
      image: '/placeholder-gallery-share.png', // 실제 이미지로 교체 필요
      color: 'blue',
    },
  ];

  // 캔버스 탭 캐러셀 아이템
  const canvasCarouselItems: CarouselItem[] = [
    {
      title: '픽셀 그리기',
      description: isMobile 
        ? '터치하여 픽셀을 선택하고 색상을 입힐 수 있습니다.' 
        : '마우스 클릭으로 픽셀을 선택하고 색상을 입힐 수 있습니다.',
      image: '/placeholder-canvas-draw.png', // 실제 이미지로 교체 필요
      color: 'purple',
    },
    {
      title: '캔버스 확대/축소',
      description: isMobile 
        ? '두 손가락으로 확대/축소하여 세부적인 작업을 할 수 있습니다.' 
        : '마우스 휠을 사용하여 캔버스를 확대/축소할 수 있습니다.',
      image: '/placeholder-canvas-zoom.png', // 실제 이미지로 교체 필요
      color: 'blue',
    },
    {
      title: '이미지 업로드',
      description: '참고용 이미지를 업로드하여 픽셀 아트 작업에 활용할 수 있습니다. 투명도 조절도 가능합니다.',
      image: '/placeholder-canvas-upload.png', // 실제 이미지로 교체 필요
      color: 'green',
    },
  ];

  // 사운드 탭 캐러셀 아이템
  const soundCarouselItems: CarouselItem[] = [
    {
      title: '배경 음악',
      description: '게임 플레이 중 다양한 배경 음악을 선택하고 조절할 수 있습니다. 작업에 몰입해보세요.',
      image: '/placeholder-sound-bgm.png', // 실제 이미지로 교체 필요
      color: 'red',
    },
    {
      title: '효과음',
      description: '픽셀을 칠하거나 다양한 액션 시 효과음을 들을 수 있습니다. 게임의 재미를 더해줍니다.',
      image: '/placeholder-sound-effect.png', // 실제 이미지로 교체 필요
      color: 'yellow',
    },
    {
      title: '음량 조절',
      description: '배경 음악과 효과음의 음량을 개별적으로 조절할 수 있습니다. 자신에게 맞는 환경을 만들어보세요.',
      image: '/placeholder-sound-volume.png', // 실제 이미지로 교체 필요
      color: 'purple',
    },
  ];

  // 콘텐츠 높이 측정 및 애니메이션
  useEffect(() => {
    if (contentRef.current) {
      const measureHeight = () => {
        const newHeight = contentRef.current?.scrollHeight || 0;
        if (newHeight !== contentHeight && newHeight > 0) {
          setContentHeight(newHeight);
        }
      };

      // ResizeObserver를 사용하여 콘텐츠 크기 변화 감지
      const resizeObserver = new ResizeObserver(() => {
        measureHeight();
      });

      resizeObserver.observe(contentRef.current);

      // 초기 높이 측정
      measureHeight();

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [activeTab, contentHeight]);

  const handleTabChange = (tab: TabType) => {
    if (tab !== activeTab) {
      setIsTransitioning(true);
      setActiveTab(tab);

      // 전환 애니메이션 완료 후 상태 리셋
      setTimeout(() => {
        setIsTransitioning(false);
      }, 200);
    }
  };

  // 캐러셀 아이템 렌더링 함수
  const renderCarouselItem = (item: CarouselItem) => {
    return (
      <div className="px-2 py-6">
        <div className="flex flex-col items-center">
          {/* 이미지 플레이스홀더 (실제 이미지로 교체 필요) */}
          <div className={`mb-4 h-48 w-full rounded-lg bg-${item.color}-900/30 flex items-center justify-center`}>
            <div className={`text-${item.color}-400 text-5xl`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          
          {/* 제목과 설명 */}
          <h3 className={`mb-2 text-xl font-bold text-${item.color}-400`}>{item.title}</h3>
          <p className="text-center text-gray-300">{item.description}</p>
        </div>
      </div>
    );
  };

  // 현재 탭에 따른 캐러셀 아이템 선택
  const getCurrentCarouselItems = () => {
    switch (activeTab) {
      case 'group':
        return groupCarouselItems;
      case 'chat':
        return chatCarouselItems;
      case 'gallery':
        return galleryCarouselItems;
      case 'canvas':
        return canvasCarouselItems;
      case 'sound':
        return soundCarouselItems;
      default:
        return groupCarouselItems;
    }
  };

  return (
    <div className='flex flex-col rounded-xl bg-gradient-to-br from-slate-900/95 to-slate-800/95'>
      {/* 인라인 스타일 추가 */}
      <style>{carouselStyles}</style>
      
      {/* 헤더 - 고정 높이 */}
      <div className='flex-shrink-0 border-b border-white/20 p-4'>
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
        <h2 className='text-center text-2xl font-bold text-white'>게임 가이드</h2>
        <p className='text-center text-sm text-gray-300'>픽셀 아트 게임의 규칙과 사용법</p>
      </div>

      {/* 탭 네비게이션 - 고정 높이 */}
      <div className='flex-shrink-0 px-4 pt-4'>
        <div className='flex border-b border-white/20'>
          <button
            onClick={() => handleTabChange('group')}
            className={`flex-1 px-2 py-3 text-center text-sm font-medium transition-all duration-300 ${
              activeTab === 'group'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            그룹
          </button>
          <button
            onClick={() => handleTabChange('chat')}
            className={`flex-1 px-2 py-3 text-center text-sm font-medium transition-all duration-300 ${
              activeTab === 'chat'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            채팅
          </button>
          <button
            onClick={() => handleTabChange('gallery')}
            className={`flex-1 px-2 py-3 text-center text-sm font-medium transition-all duration-300 ${
              activeTab === 'gallery'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            갤러리
          </button>
          <button
            onClick={() => handleTabChange('canvas')}
            className={`flex-1 px-2 py-3 text-center text-sm font-medium transition-all duration-300 ${
              activeTab === 'canvas'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            캔버스
          </button>
          <button
            onClick={() => handleTabChange('sound')}
            className={`flex-1 px-2 py-3 text-center text-sm font-medium transition-all duration-300 ${
              activeTab === 'sound'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            사운드
          </button>
        </div>
      </div>

      {/* 탭 컨텐츠 - 높이 애니메이션 적용 */}
      <div
        className='overflow-hidden transition-all duration-400 ease-out'
        style={{
          height: contentHeight > 0 ? `${contentHeight}px` : 'auto',
        }}
      >
        <div
          ref={contentRef}
          className={`transition-all duration-200 ease-out ${
            isTransitioning ? 'opacity-70' : 'opacity-100'
          }`}
        >
          {/* 캐러셀 컨텐츠 */}
          <div className="px-8 py-2">
            <div className="carousel-container relative">
              <Slider {...sliderSettings}>
                {getCurrentCarouselItems().map((item, index) => (
                  <div key={index}>
                    {renderCarouselItem(item)}
                  </div>
                ))}
              </Slider>
            </div>
          </div>
          
          {/* 탭 설명 */}
          <div className="mt-4 px-6 pb-4">
            {activeTab === 'group' && (
              <div className="rounded-lg bg-blue-900/20 p-4">
                <h4 className="mb-2 text-lg font-semibold text-blue-300">그룹 기능 팁</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start">
                    <span className="mt-1 mr-2 h-2 w-2 rounded-full bg-blue-400"></span>
                    <span>그룹을 만들어 특정 영역을 함께 작업해보세요</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mt-1 mr-2 h-2 w-2 rounded-full bg-blue-400"></span>
                    <span>그룹 채팅을 통해 작업 계획을 공유하세요</span>
                  </li>
                </ul>
              </div>
            )}
            
            {activeTab === 'chat' && (
              <div className="rounded-lg bg-green-900/20 p-4">
                <h4 className="mb-2 text-lg font-semibold text-green-300">채팅 기능 팁</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start">
                    <span className="mt-1 mr-2 h-2 w-2 rounded-full bg-green-400"></span>
                    <span>채팅을 통해 작업 영역을 조율해보세요</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mt-1 mr-2 h-2 w-2 rounded-full bg-green-400"></span>
                    <span>다른 사용자의 의견을 존중해주세요</span>
                  </li>
                </ul>
              </div>
            )}
            
            {activeTab === 'gallery' && (
              <div className="rounded-lg bg-yellow-900/20 p-4">
                <h4 className="mb-2 text-lg font-semibold text-yellow-300">갤러리 기능 팁</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start">
                    <span className="mt-1 mr-2 h-2 w-2 rounded-full bg-yellow-400"></span>
                    <span>다른 사용자의 작품에서 영감을 얻어보세요</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mt-1 mr-2 h-2 w-2 rounded-full bg-yellow-400"></span>
                    <span>완성된 작품을 친구들과 공유해보세요</span>
                  </li>
                </ul>
              </div>
            )}
            
            {activeTab === 'canvas' && (
              <div className="rounded-lg bg-purple-900/20 p-4">
                <h4 className="mb-2 text-lg font-semibold text-purple-300">캔버스 기능 팁</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start">
                    <span className="mt-1 mr-2 h-2 w-2 rounded-full bg-purple-400"></span>
                    <span>작은 디테일부터 시작해서 점진적으로 확장해보세요</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mt-1 mr-2 h-2 w-2 rounded-full bg-purple-400"></span>
                    <span>다른 사용자들과 협력하여 더 큰 작품을 만들어보세요</span>
                  </li>
                </ul>
              </div>
            )}
            
            {activeTab === 'sound' && (
              <div className="rounded-lg bg-red-900/20 p-4">
                <h4 className="mb-2 text-lg font-semibold text-red-300">사운드 기능 팁</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start">
                    <span className="mt-1 mr-2 h-2 w-2 rounded-full bg-red-400"></span>
                    <span>배경 음악은 집중력을 높이는 데 도움이 됩니다</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mt-1 mr-2 h-2 w-2 rounded-full bg-red-400"></span>
                    <span>효과음은 게임의 몰입감을 높여줍니다</span>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <div className='mt-4 border-t border-gray-600 p-4 text-center'>
        <p className='text-sm text-gray-400'>
          즐거운 픽셀 아트 여행을 시작해보세요! 🎨
        </p>
      </div>
    </div>
  );
}
