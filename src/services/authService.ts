const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
const GOOGLE_REDIRECT_URI = import.meta.env.VITE_GOOGLE_REDIRECT_URI;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

const oauthLoginUrls = {
  google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code&scope=email profile`,
  naver: `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=naver`,
  kakao: `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=kakao`,
};

type Provider = 'google' | 'naver' | 'kakao';

// provider 받아서 각각 해당하는 리디렉션 페이지로 이동
export const authService = {
  /**
   * 지정된 소셜 로그인 페이지로 리디렉션합니다.
   * @param provider
   */
  redirectToProvider(provider: Provider) {
    const url = oauthLoginUrls[provider];
    if (url) {
      window.location.href = url;
    } else {
      console.error(`Unsupported provider: ${provider}`);
    }
  },
};
