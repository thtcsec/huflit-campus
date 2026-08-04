import { apiClient } from './client';
import type {
  AuthResponse,
  MicrosoftLoginRequest,
  GuestOtpRequest,
  GuestOtpVerifyRequest,
  UserProfile,
} from '@/types';

export const authApi = {
  microsoftLogin: (payload: MicrosoftLoginRequest) =>
    apiClient.post<AuthResponse>('/auth/microsoft-login', payload),

  requestGuestOtp: (payload: GuestOtpRequest) =>
    apiClient.post('/auth/guest/request-otp', payload),

  verifyGuestOtp: (payload: GuestOtpVerifyRequest) =>
    apiClient.post<AuthResponse>('/auth/guest/verify-otp', payload),

  logout: (refreshToken?: string) =>
    apiClient.post('/auth/logout', { refreshToken }),

  getMe: () =>
    apiClient.get<UserProfile>('/auth/me'),
};
