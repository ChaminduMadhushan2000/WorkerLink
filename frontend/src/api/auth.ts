import { apiClient } from './client';
import type { ApiResponse, AuthTokens, User } from '../types';

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: 'customer' | 'contractor';
}

export interface LoginPayload {
  email: string;
  password: string;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    apiClient.post<ApiResponse<{ user: User }>>('/auth/register', data),

  login: (data: LoginPayload) =>
    apiClient.post<ApiResponse<AuthTokens>>('/auth/login', data),

  logout: () => apiClient.post<ApiResponse<null>>('/auth/logout'),

  refresh: () =>
    apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>('/auth/refresh'),
};