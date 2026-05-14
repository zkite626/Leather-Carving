import { apiClient } from './api-client';
import type { ApiResponse } from '@/shared/types/api';
import type { IUser } from '@/shared/types/user';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
  phone?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

export interface RefreshRequest {
  refreshToken: string;
}

export const authApi = {
  async login(data: LoginRequest): Promise<TokenResponse> {
    const response = await apiClient.post<ApiResponse<TokenResponse>>('/auth/login', data);
    return response.data.data;
  },

  async register(data: RegisterRequest): Promise<TokenResponse> {
    const response = await apiClient.post<ApiResponse<TokenResponse>>('/auth/register', data);
    return response.data.data;
  },

  async refresh(data: RefreshRequest): Promise<TokenResponse> {
    const response = await apiClient.post<ApiResponse<TokenResponse>>('/auth/refresh', data);
    return response.data.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
  },

  async getMe(): Promise<IUser> {
    const response = await apiClient.get<ApiResponse<IUser>>('/users/me');
    return response.data.data;
  },

  async updateProfile(data: Partial<Pick<IUser, 'nickname' | 'avatar' | 'bio'>>): Promise<IUser> {
    const response = await apiClient.patch<ApiResponse<IUser>>('/users/me', data);
    return response.data.data;
  },
};
