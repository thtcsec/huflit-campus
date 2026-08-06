import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { AuthResponse, RefreshTokenRequest } from '@/types';

const API_BASE = '/api';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      const accessToken = localStorage.getItem('accessToken');

      // Stale/missing tokens: clear auth and retry once without Authorization
      // so AllowAnonymous endpoints (e.g. browse events) still work.
      if (!refreshToken || !accessToken) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        isRefreshing = false;
        processQueue(error as Error, null);

        if (originalRequest.headers?.Authorization) {
          delete originalRequest.headers.Authorization;
          return apiClient(originalRequest);
        }

        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post<AuthResponse>(
          `${API_BASE}/auth/refresh`,
          {
            accessToken,
            refreshToken,
          } as RefreshTokenRequest
        );

        const { accessToken: newToken, refreshToken: newRefresh } = data;
        localStorage.setItem('accessToken', newToken);
        localStorage.setItem('refreshToken', newRefresh);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        processQueue(null, newToken);
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        isRefreshing = false;

        if (originalRequest.headers?.Authorization) {
          delete originalRequest.headers.Authorization;
          return apiClient(originalRequest);
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
