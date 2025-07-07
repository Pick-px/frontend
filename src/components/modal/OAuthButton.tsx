// src/components/auth/OAuthButton.tsx

import React from 'react';

// 1. 각 이미지 파일을 직접 import 합니다.
import googleButtonImage from '../../assets/google_login_icon.png';
import googleLongBtnImage from '../../assets/web_light_sq_ctn@3x.png';
import naverButtonImage from '../../assets/naver_login_icon.png';
import kakaoButtonImage from '../../assets/kakao_login_icon.png';

// provider의 타입 정의
type Provider = 'google' | 'naver' | 'kakao';

type OAuthButtonProps = {
  provider: Provider;
  onClick: () => void;
};

// 2. provider 이름과 이미지 소스, alt 텍스트를 매핑하는 객체
const providerInfo = {
  google: {
    // src: googleButtonImage,
    src: googleLongBtnImage,
    alt: 'Google로 로그인',
  },
  naver: {
    src: naverButtonImage,
    alt: '네이버로 로그인',
  },
  kakao: {
    src: kakaoButtonImage,
    alt: '카카오로 로그인',
  },
};

export default function OAuthButton({ provider, onClick }: OAuthButtonProps) {
  // 3. prop으로 받은 provider에 맞는 정보를 가져옵니다.
  const info = providerInfo[provider];

  return (
    <button
      onClick={onClick}
      // 공통 스타일: 클릭 시 눌리는 효과만 적용
      className='transition-transform active:scale-95'
    >
      {/* <img src={info.src} alt={info.alt} className='h-[40px] w-[40px]' /> */}
      <img src={info.src} alt={info.alt} className='h-[45px] w-[220px]' />
    </button>
  );
}
