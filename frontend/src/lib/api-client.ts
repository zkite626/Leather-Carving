import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiResponse } from '@/shared/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0`;
}

function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', token);
  setCookie('accessToken', token, 7);
}

function removeTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  deleteCookie('accessToken');
}

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown): void {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(undefined);
    }
  });
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => apiClient(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken =
          typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;

        if (!refreshToken) {
          removeTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        const response = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        setAccessToken(accessToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        processQueue(null);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        removeTokens();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export { apiClient, getAccessToken, setAccessToken, removeTokens };
