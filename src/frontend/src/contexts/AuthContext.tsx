import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/api';
import type { UserProfile, MicrosoftLoginRequest, GuestOtpVerifyRequest } from '@/types';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: MicrosoftLoginRequest) => Promise<void>;
  loginGuest: (payload: GuestOtpVerifyRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  loginGuest: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await authApi.getMe();
      setUser(data);
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.clear();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (payload: MicrosoftLoginRequest) => {
    const { data } = await authApi.microsoftLogin(payload);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
  };

  const loginGuest = async (payload: GuestOtpVerifyRequest) => {
    const { data } = await authApi.verifyGuestOtp(payload);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await authApi.logout(refreshToken || undefined);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.clear();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginGuest,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
