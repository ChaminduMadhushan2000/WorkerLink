import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { useAuthStore } from '../store/auth.store';

const BASE_URL = import.meta.env['VITE_API_URL'] ?? 'http://localhost:3000';

export const apiClient: AxiosInstance = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  withCredentials: true, // needed for HttpOnly cookie (refresh token)
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach access token from memory store
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — on 401, attempt token refresh once
let isRefreshing = false;

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const status = error.response?.status;
    const originalRequest = error.config;

    if (status === 401 && !isRefreshing && originalRequest) {
      isRefreshing = true;
      try {
        const res = await apiClient.post<{ data: { accessToken: string } | null }>(
          '/auth/refresh'
        );
        const newToken = res.data.data?.accessToken;
        if (newToken) {
          useAuthStore.getState().setAccessToken(newToken);
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          isRefreshing = false;
          return apiClient(originalRequest);
        }
      } catch {
        useAuthStore.getState().clearAuth();
        window.location.href = '/login';
      }
      isRefreshing = false;
    }

    return Promise.reject(error);
  }
);