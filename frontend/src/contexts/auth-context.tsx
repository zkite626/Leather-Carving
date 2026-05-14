'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi, type LoginRequest, type RegisterRequest } from '@/lib/auth-api';
import { setAccessToken, removeTokens } from '@/lib/api-client';
import type { IUser } from '@/shared/types/user';

interface AuthContextValue {
  user: IUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setUser(null);
        return;
      }
      const currentUser = await authApi.getMe();
      setUser(currentUser);
    } catch {
      setUser(null);
      removeTokens();
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const login = useCallback(
    async (data: LoginRequest) => {
      const result = await authApi.login(data);
      setAccessToken(result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      setUser(result.user);
    },
    [],
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      const result = await authApi.register(data);
      setAccessToken(result.accessToken);
      localStorage.setItem('refreshToken', result.refreshToken);
      setUser(result.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore logout API errors
    }
    removeTokens();
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isAuthenticated: user !== null,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
