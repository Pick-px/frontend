import React, { useState, useEffect, useRef } from 'react';
import { useViewport } from '../../hooks/useViewport';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

// 캐러셀 커스텀 스타일
const carouselStyles = `
  .help-carousel .slick-prev,
  .help-carousel .slick-next {
    z-index: 10;
    width: 40px;
    height: 40px;
  }
  
  .help-carousel .slick-prev {
    left: 10px;
  }
  
  .help-carousel .slick-next {
    right: 10px;
  }
  
  .help-carousel .slick-prev:before,
  .help-carousel .slick-next:before {
    font-size: 30px;
    opacity: 0.8;
  }
  
  .help-carousel .slick-dots {
    bottom: -30px;
  }
  
  .carousel-container {
    padding: 0;
    overflow: hidden;
    width: 100%;
  }
  
  .help-carousel .slick-slide {
    padding: 0;
  }
`;

type HelpModalContentProps = {
  onClose?: () => void;
};

type TabType = 'pixel' | 'chat' | 'imageguide' | 'group' | 'canvas' | 'mypage';

// 캐러셀 아이템 타입 정의
type CarouselItem = {
  title: string;
  description: string;
  image: string; // 이미지 경로 또는 placeholder
  color: string;
};

export default function HelpModalContent({ onClose }: HelpModalContentProps) {
  const [activeTab, setActiveTab] = useState<TabType>('pixel');
  const { width } = useViewport();
  const isMobile = width < 768;
  const sliderRef = useRef<Slider>(null);

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

  const addSlideNumbers = (
    items: CarouselItem[],
    color: string
  ): CarouselItem[] => {
    return items.map((item, index) => ({
      ...item,
      title: `${index + 1}. ${item.title}`,
      color,
    }));
  };

  const pixelCarouselItems: CarouselItem[] = addSlideNumbers(
    [
      {
        title: '휠로 확대/축소',
        description:
          '마우스 휠을 사용해 원하는 범위를 확대하거나 축소할 수 있어요.',
        image: '/help-images/pick_1.PNG',
        color: '',
      },
      {
        title: '화면 이동하기',
        description:
          '마우스를 드래그하면 원하는 위치로 자유롭게 이동할 수 있어요.',
        image: '/help-images/pick_2.PNG',
        color: '',
      },
      {
        title: '픽셀 색상 고르기',
        description: '픽셀을 클릭한 뒤, 팔레트에서 원하는 색을 선택해보세요.',
        image: '/help-images/pick_3.PNG',
        color: '',
      },
      {
        title: '색칠 확정하기',
        description: '체크 버튼을 눌러 선택한 색으로 픽셀을 확정할 수 있어요.',
        image: '/help-images/pick_4.PNG',
        color: '',
      },
      {
        title: '쿨타임 안내',
        description: '색칠 후에는 일정 시간(3초) 쿨타임이 적용됩니다.',
        image: '/help-images/pick_5.PNG',
        color: '',
      },
      {
        title: '쿨타임 후 다시 색칠',
        description: '쿨타임이 끝나면 다음 픽셀을 자유롭게 칠할 수 있어요.',
        image: '/help-images/pick_6.PNG',
        color: '',
      },
    ],
    'yellow'
  );

  const chatCarouselItems: CarouselItem[] = addSlideNumbers(
    [
      {
        title: '채팅창 열기',
        description:
          '화면 좌측 하단의 채팅 버튼을 눌러 채팅을 시작할 수 있어요.',
        image: '/help-images/chat_1.PNG',
        color: '',
      },
      {
        title: '전체 그룹 채팅',
        description: '처음 입장 시, 전체 그룹 채팅방으로 자동 연결됩니다.',
        image: '/help-images/chat_2.PNG',
        color: '',
      },
      {
        title: '그룹 이동하기',
        description:
          '그룹을 직접 생성하거나 참가할 수 있으며, 채팅창에서 확인할 수 있어요.',
        image: '/help-images/chat_3.PNG',
        color: '',
      },
    ],
    'green'
  );

  const imageGuideCarouselItems: CarouselItem[] = addSlideNumbers(
    [
      {
        title: '이미지 가이드 시작하기',
        description:
          '채팅 버튼 오른쪽의 아이콘을 눌러 이미지 가이드를 시작하세요.',
        image: '/help-images/imageguide_1.PNG',
        color: '',
      },
      {
        title: '이미지 업로드',
        description:
          '참고하고 싶은 이미지를 업로드해 캔버스 위에 덧붙일 수 있어요.',
        image: '/help-images/imageguide_2.PNG',
        color: '',
      },
      {
        title: '이미지 위치 조정',
        description:
          '마우스로 크기와 위치를 조절하며 캔버스에 잘 맞게 배치하세요.',
        image: '/help-images/imageguide_3.PNG',
        color: '',
      },
      {
        title: '캔버스 시점 조절',
        description: '마우스로 캔버스를 이동하거나 확대/축소할 수 있어요.',
        image: '/help-images/imageguide_4.PNG',
        color: '',
      },
      {
        title: '투명도 조절하기',
        description:
          '이미지가 너무 진하거나 흐릴 땐, 투명도 슬라이더를 조절해보세요.',
        image: '/help-images/imageguide_5.PNG',
        color: '',
      },
      {
        title: '이미지 고정하기',
        description:
          '위치와 크기를 조절한 후, [확정] 버튼으로 이미지를 고정하세요.',
        image: '/help-images/imageguide_6.PNG',
        color: '',
      },
      {
        title: '그림 그리기',
        description:
          '이제 이미지를 참고하여 픽셀을 하나씩 채워 그림을 완성해보세요.',
        image: '/help-images/imageguide_7.PNG',
        color: '',
      },
      {
        title: '이미지 가이드 따라 그리기',
        description:
          '투명도를 조절하며 원본 이미지를 참고해 정확하게 색칠해보세요.',
        image: '/help-images/imageguide_8.PNG',
        color: '',
      },
      {
        title: '컬러피커 활용하기',
        description:
          '컬러피커 도구로 이미지에서 직접 색상을 추출하여 사용할 수 있어요.',
        image: '/help-images/imageguide_9.PNG',
        color: '',
      },
      {
        title: '이미지 저장 안내',
        description:
          '개인 업로드 이미지는 저장되지 않아요. 이미지 저장 및 공유를 원하시면 그룹 기능을 이용해주세요! ',
        image: '/help-images/imageguide_10.PNG',
        color: '',
      },
    ],
    'blue'
  );

  const groupCarouselItems: CarouselItem[] = addSlideNumbers(
    [
      {
        title: '그룹 만들기',
        description:
          '원하는 이름과 최대 인원수를 설정해 나만의 그룹을 만들 수 있어요.',
        image: '/help-images/group_1.PNG',
        color: '',
      },
      {
        title: '그룹 참여하기',
        description: '다른 사용자가 만든 그룹을 선택해 함께 참여할 수 있어요.',
        image: '/help-images/group_2.PNG',
        color: '',
      },
      {
        title: '그룹 이미지 공유 기능',
        description:
          '그룹장은 모든 멤버가 함께 볼 수 있는 이미지를 업로드할 수 있어요.',
        image: '/help-images/group_3.PNG',
        color: '',
      },
      {
        title: '그룹 이미지 업로드',
        description:
          '개인 이미지와 동일한 방식으로 그룹에서 공유할 이미지를 업로드합니다.',
        image: '/help-images/group_4.PNG',
        color: '',
      },
      {
        title: '그룹 이미지 동기화',
        description:
          '팀원들은 동기화 버튼을 눌러 그룹장이 업로드한 이미지를 불러올 수 있어요.',
        image: '/help-images/group_5.PNG',
        color: '',
      },
      {
        title: '이미지 동기화 완료',
        description:
          '동기화된 이미지는 모든 그룹원의 캔버스에 동일하게 표시되어 협업이 가능해요.',
        image: '/help-images/group_6.PNG',
        color: '',
      },
      {
        title: '좌표 공유하기',
        description:
          '채팅창에서 좌표를 공유하면 클릭 시 해당 위치로 바로 이동할 수 있어요.',
        image: '/help-images/group_7.PNG',
        color: '',
      },
    ],
    'purple'
  );

  const canvasCarouselItems: CarouselItem[] = addSlideNumbers(
    [
      {
        title: '캔버스 선택하기',
        description:
          '상단 메뉴에서 캔버스 아이콘을 클릭해 다양한 캔버스를 확인해보세요.',
        image: '/help-images/canvas_1.PNG',
        color: '',
      },
      {
        title: '캔버스 모드 선택',
        description:
          '일반, 이벤트, 게임 등 다양한 모드의 캔버스를 즐길 수 있어요.',
        image: '/help-images/canvas_2.PNG',
        color: '',
      },
      {
        title: '특별 캔버스 참여',
        description:
          '이벤트 모드에서는 흑백, 제한 색상 등 특별한 규칙의 캔버스가 제공됩니다.',
        image: '/help-images/canvas_3.PNG',
        color: '',
      },
    ],
    'teal'
  );

  const mypageCarouselItems: CarouselItem[] = addSlideNumbers(
    [
      {
        title: '내 프로필 보기',
        description:
          '상단 메뉴의 프로필 아이콘을 클릭해 내 정보를 확인할 수 있어요.',
        image: '/help-images/mypage_1.PNG',
        color: '',
      },
      {
        title: '참여한 작품들',
        description:
          '내가 참여했던 모든 캔버스 기록과 통계를 한눈에 볼 수 있어요.',
        image: '/help-images/mypage_2.PNG',
        color: '',
      },
    ],
    'orange'
  );

  // 탭 변경 시 슬라이더 초기화
  useEffect(() => {
    if (sliderRef.current) {
      setTimeout(() => {
        if (sliderRef.current) {
          sliderRef.current.slickGoTo(0);
        }
      }, 0);
    }
  }, [activeTab]);

  // 현재 탭에 따른 캐러셀 아이템 선택
  const getCurrentCarouselItems = () => {
    switch (activeTab) {
      case 'pixel':
        return pixelCarouselItems;
      case 'chat':
        return chatCarouselItems;
      case 'imageguide':
        return imageGuideCarouselItems;
      case 'group':
        return groupCarouselItems;
      case 'canvas':
        return canvasCarouselItems;
      case 'mypage':
        return mypageCarouselItems;
      default:
        return pixelCarouselItems;
    }
  };

  // 탭 변경 핸들러
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // 캐러셀 아이템 렌더링 함수
  const renderCarouselItem = (item: CarouselItem) => {
    return (
      <div className='px-2 py-2'>
        <div className='flex flex-col items-center'>
          {/* 이미지 */}
          <div
            className={`mb-2 h-96 w-full rounded-lg bg-${item.color}-900/30 flex items-center justify-center overflow-hidden`}
          >
            <img
              src={item.image}
              alt={item.title}
              className='h-auto max-h-full w-full max-w-full rounded-md object-contain shadow-lg'
              onError={(e) => {
                // 이미지 로드 실패 시 플레이스홀더 표시
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  const svg = document.createElementNS(
                    'http://www.w3.org/2000/svg',
                    'svg'
                  );
                  svg.setAttribute('class', 'h-16 w-16');
                  svg.setAttribute('fill', 'none');
                  svg.setAttribute('viewBox', '0 0 24 24');
                  svg.setAttribute('stroke', 'currentColor');

                  const path = document.createElementNS(
                    'http://www.w3.org/2000/svg',
                    'path'
                  );
                  path.setAttribute('stroke-linecap', 'round');
                  path.setAttribute('stroke-linejoin', 'round');
                  path.setAttribute('stroke-width', '1');
                  path.setAttribute(
                    'd',
                    'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                  );

                  svg.appendChild(path);
                  parent.appendChild(svg);
                }
              }}
            />
          </div>

          {/* 제목과 설명 */}
          <h3 className={`mb-2 text-2xl font-bold text-${item.color}-400`}>
            {item.title}
          </h3>
          <p className='text-center text-lg text-gray-300'>
            {item.description}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className='flex h-[70vh]  flex-col rounded-xl bg-gradient-to-br from-slate-900/95 to-slate-800/95'>
      {/* 인라인 스타일 추가 */}
      <style>{carouselStyles}</style>

      {/* 헤더 - 고정 높이 */}
      <div className='flex-shrink-0 border-b border-white/20 p-3'>
        <div className='mb-1 flex items-center justify-center'>
          <div className='rounded-full bg-blue-500/20 p-2'>
            <svg
              className='h-6 w-6 text-blue-400'
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
        <h2 className='text-center text-2xl font-bold text-white'>
          게임 가이드
        </h2>
        <p className='text-center text-base text-gray-300'>
          픽셀 아트 게임의 규칙과 사용법
        </p>
        <div className='mt-1 flex justify-center'>
          <a
            href='https://www.youtube.com/watch?v=QdUDfx3wgMU'
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-2 rounded-md bg-red-600/20 px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-600/30'
          >
            <svg className='h-4 w-4' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z' />
            </svg>
            더 자세한 설명은 영상 가이드를 참고하세요
          </a>
        </div>
      </div>

      {/* 탭 네비게이션 - 고정 높이 */}
      <div className='flex-shrink-0 px-4 pt-1'>
        <div className='grid grid-cols-6 border-b border-white/20'>
          <button
            onClick={() => handleTabChange('pixel')}
            className={`py-2 text-center text-base font-medium transition-all duration-300 ${
              activeTab === 'pixel'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            픽셀
          </button>
          <button
            onClick={() => handleTabChange('chat')}
            className={`py-2 text-center text-base font-medium transition-all duration-300 ${
              activeTab === 'chat'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            채팅
          </button>
          <button
            onClick={() => handleTabChange('imageguide')}
            className={`py-2 text-center text-base font-medium transition-all duration-300 ${
              activeTab === 'imageguide'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            이미지
          </button>
          <button
            onClick={() => handleTabChange('group')}
            className={`py-2 text-center text-base font-medium transition-all duration-300 ${
              activeTab === 'group'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            그룹
          </button>
          <button
            onClick={() => handleTabChange('canvas')}
            className={`py-2 text-center text-base font-medium transition-all duration-300 ${
              activeTab === 'canvas'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            캔버스
          </button>
          <button
            onClick={() => handleTabChange('mypage')}
            className={`py-2 text-center text-base font-medium transition-all duration-300 ${
              activeTab === 'mypage'
                ? 'border-b-2 border-blue-500 text-blue-400'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            마이페이지
          </button>
        </div>
      </div>

      {/* 콘텐츠 영역 - 스크롤 가능 */}
      <div className='flex-grow overflow-y-auto p-2 pt-2'>
        <div className='carousel-container'>
          <Slider ref={sliderRef} {...sliderSettings}>
            {getCurrentCarouselItems().map((item, index) => (
              <div key={index}>{renderCarouselItem(item)}</div>
            ))}
          </Slider>
        </div>
      </div>

      {/* 푸터 영역 제거 */}
    </div>
  );
}