'use client';

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from 'react';
import { AuthUser } from '@/types';
import { apiClient } from '@/services/api.client';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | undefined;
  login: (email: string, password: string, otp?: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  updateAccount: (input: AccountUpdateInput) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getTwoFactorStatus: () => Promise<{ enabled: boolean }>;
  startTwoFactorSetup: () => Promise<TwoFactorSetup>;
  enableTwoFactor: (secret: string, code: string) => Promise<void>;
  disableTwoFactor: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';
const USER_KEY = 'auth_user';

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  zipCode: string;
  city: string;
  licenseCategory: 'A1' | 'A2' | 'A';
  licenseNumber: string;
}

interface AccountUpdateInput {
  email: string;
  phone: string;
  address: string;
  zipCode: string;
  city: string;
  licenseCategory: 'A1' | 'A2' | 'A';
}

interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
      address: string;
      zipCode: string;
      city: string;
      licenseCategory: 'A1' | 'A2' | 'A';
      licenseNumber: string;
      createdAt: string;
      roles: string[];
    };
  };
}

interface AccountUpdateResponse {
  success: boolean;
  data: {
    user: AuthResponse['data']['user'];
  };
}

interface TwoFactorSetup {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

interface TwoFactorStatusResponse {
  success: boolean;
  data: { enabled: boolean };
}

interface TwoFactorSetupResponse {
  success: boolean;
  data: TwoFactorSetup;
}

function mapUser(user: AuthResponse['data']['user']): AuthUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    address: user.address,
    zipCode: user.zipCode,
    city: user.city,
    licenseCategory: user.licenseCategory,
    licenseNumber: user.licenseNumber,
    createdAt: user.createdAt,
    role: user.roles.includes('admin') ? 'admin' : 'user',
  };
}

function getStoredToken(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return window.localStorage.getItem(TOKEN_KEY) ?? undefined;
}

function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const storedUser = window.localStorage.getItem(USER_KEY);
  if (!storedUser) return null;
  try {
    return JSON.parse(storedUser) as AuthUser;
  } catch {
    window.localStorage.removeItem(USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [isLoading] = useState(false);
  const [token, setToken] = useState<string | undefined>(() => getStoredToken());

  useEffect(() => {
    const syncRefreshedSession = () => {
      const storedToken = window.localStorage.getItem(TOKEN_KEY);
      const storedUser = window.localStorage.getItem(USER_KEY);
      if (!storedToken || !storedUser) return;
      setToken(storedToken);
      setUser(JSON.parse(storedUser) as AuthUser);
    };

    window.addEventListener('auth:refreshed', syncRefreshedSession);
    return () => window.removeEventListener('auth:refreshed', syncRefreshedSession);
  }, []);

  const persistSession = useCallback((data: AuthResponse['data']) => {
    const nextUser = mapUser(data.user);
    window.localStorage.setItem(TOKEN_KEY, data.accessToken);
    if (data.refreshToken) {
      window.localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    }
    window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(data.accessToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(async (email: string, password: string, otp?: string) => {
    const res = await apiClient.post<AuthResponse>('/v1/auth/login', { email, password, otp });
    persistSession(res.data);
  }, [persistSession]);

  const register = useCallback(async (input: RegisterInput) => {
    const res = await apiClient.post<AuthResponse>('/v1/auth/register', input);
    persistSession(res.data);
  }, [persistSession]);

  const updateAccount = useCallback(async (input: AccountUpdateInput) => {
    const res = await apiClient.patch<AccountUpdateResponse>('/v1/auth/me', input);
    setUser((current) => {
      if (!current) return current;
      const nextUser: AuthUser = {
        ...current,
        email: res.data.user.email,
        phone: res.data.user.phone,
        address: res.data.user.address,
        zipCode: res.data.user.zipCode,
        city: res.data.user.city,
        licenseCategory: res.data.user.licenseCategory,
      };
      window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  const updatePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await apiClient.patch('/v1/auth/me/password', { currentPassword, newPassword });
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await apiClient.post('/v1/auth/forgot-password', { email });
  }, []);

  const getTwoFactorStatus = useCallback(async () => {
    const res = await apiClient.get<TwoFactorStatusResponse>('/v1/auth/me/2fa');
    return res.data;
  }, []);

  const startTwoFactorSetup = useCallback(async () => {
    const res = await apiClient.post<TwoFactorSetupResponse>('/v1/auth/me/2fa/setup', {});
    return res.data;
  }, []);

  const enableTwoFactor = useCallback(async (secret: string, code: string) => {
    await apiClient.post('/v1/auth/me/2fa/enable', { secret, code });
  }, []);

  const disableTwoFactor = useCallback(async () => {
    await apiClient.delete('/v1/auth/me/2fa');
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(undefined);
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        token,
        login,
        register,
        updateAccount,
        updatePassword,
        resetPassword,
        getTwoFactorStatus,
        startTwoFactorSetup,
        enableTwoFactor,
        disableTwoFactor,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
