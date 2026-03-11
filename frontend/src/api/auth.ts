import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// 인증이 필요한 요청용 인스턴스 (인터셉터 적용)
export const authApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청을 보낼 때마다 Zustand 스토어에서 최신 토큰을 가져와 헤더에 주입
authApi.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 에러 (ex: 401 만료 등) 시 로그아웃 처리
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
