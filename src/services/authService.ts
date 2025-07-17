import apiClient from './apiClient';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-toastify';
import { useAuthStore } from '../store/authStrore';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
const KAKAO_CLIENT_ID = import.meta.env.VITE_KAKAO_CLIENT_ID;
const VITE_REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI;

const oauthLoginUrls = {
  google: `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${VITE_REDIRECT_URI}&response_type=code&scope=email profile&state=google`,
  naver: `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=naver`,
  kakao: `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&state=kakao`,
};

type Provider = 'google' | 'naver' | 'kakao';
type AuthResult = {
  accessToken: string;
  user: {
    userId: string;
    nickname?: string;
  };
};

type DecodedToken = {
  sub: {
    userId: string;
    nickName: string;
  };
  jti: string;
  exp: number;
  iat: number;
};

// const { isLoggedIn, setAuth, clearAuth } = useAuthStore();

// --- 서비스 객체 ---
export const authService = {
  /**
   * 지정된 소셜 로그인 페이지로 리디렉션합니다. (변경 없음)
   */
  redirectToProvider(provider: Provider) {
    const url = oauthLoginUrls[provider];
    if (url) {
      window.location.href = url;
    } else {
      console.error(`Unsupported provider: ${provider}`);
    }
  },

  async handleOAuthCallback(
    code: string,
    state: Provider
  ): Promise<AuthResult> {
    try {
      // state를 body에 담아 보내기.
      const response = await apiClient.post('/user/oauth/login', {
        code,
        state,
      });

      const authHeader = response.headers['authorization'];
      const accessToken = authHeader?.split(' ')[1];

      const decodedToken = jwtDecode<DecodedToken>(accessToken);
      console.log('--------로그인sub:', decodedToken.sub);
      const user = {
        userId: decodedToken.sub.userId,
        nickname: decodedToken.sub.nickName,
      };
      console.log('응답결과:', user);
      // 응답에서 AT와 사용자 정보를 추출하여 반환
      return { accessToken, user };
    } catch (error) {
      console.error(`${state} login failed`, error);
      toast.error('로그인에 실패했습니다.');
      throw error;
    }
  },

  /**
   * 앱 로딩 시 세션 유효성을 확인, 유효하다면 새 AT를 받아옵니다.
   * @returns { accessToken, user }
   */
  async checkAuthStatus(): Promise<AuthResult> {
    try {
      // 이 요청에는 브라우저가 자동으로 RT 쿠키를 실어 보냅니다.
      const response = await apiClient.post('/auth/refresh');
      const authHeader = response.headers['authorization'];
      const newAccessToken = authHeader?.split(' ')[1];
      console.log(newAccessToken);
      // setAuth(newAccessToken, response.data.user);
      return response.data;
    } catch (error) {
      console.error('Failed to refresh token', error);
      // clearAuth();
      toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');
      throw error;
    }
  },

  /**
   * 로그아웃을 요청
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/user/logout');
    } catch (error) {
      console.error('Logout failed', error);
      toast('로그아웃 실패');
      // 추후 clearAuth
    }
  },
};

// --- 비회원 로그인 ---
export const guestLogin = async (nickname: string) => {
  try {
    const response = await apiClient.post('/users/signup', {
      userName: nickname,
    });
    const authHeader = response.headers['authorization'];
    const accessToken = authHeader?.split(' ')[1];

    const decodedToken = jwtDecode<DecodedToken>(accessToken);
    const user = {
      userId: decodedToken.sub.userId,
      nickname: decodedToken.sub.nickName,
    };

    useAuthStore.getState().setAuth(accessToken, user);
    toast.success(`${nickname}님 환영합니다!`);
  } catch (error) {
    console.error('Login failed', error);
    toast.error('로그인에 실패했습니다.');
  }
};
