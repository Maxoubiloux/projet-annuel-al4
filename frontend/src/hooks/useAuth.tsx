'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { AuthUser } from '@/types';
import { apiClient } from '@/services/api.client';
import keycloak from '@/services/keycloak';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | undefined;
  login: (loginHint?: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  updateAccount: (input: AccountUpdateInput) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getTwoFactorStatus: () => Promise<{ enabled: boolean }>;
  startTwoFactorSetup: () => Promise<void>;
  disableTwoFactor: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

function appUrl(path: string): string {
  if (typeof window === 'undefined') return `${BASE_PATH}${path}`;
  return `${window.location.origin}${BASE_PATH}${path}`;
}

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
    expiresIn: number;
    user: IamUserPayload;
  };
}

interface IamUserPayload {
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
}

type TokenClaims = {
  sub?: string;
  email?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  realm_access?: { roles?: string[] };
  phone?: string;
  address?: string;
  zipCode?: string;
  city?: string;
  licenseCategory?: 'A1' | 'A2' | 'A';
  licenseNumber?: string;
  createdAt?: string;
};

interface AccountUpdateResponse {
  success: boolean;
  data: {
    user: IamUserPayload;
  };
}

interface AccountResponse {
  success: boolean;
  data: {
    user: IamUserPayload;
  };
}

interface TwoFactorStatusResponse {
  success: boolean;
  data: { enabled: boolean };
}

function mapKeycloakUser(claims: TokenClaims): AuthUser {
  const roles = claims.realm_access?.roles ?? [];
  return {
    id: claims.sub ?? '',
    email: claims.email ?? '',
    firstName: claims.given_name ?? claims.preferred_username ?? '',
    lastName: claims.family_name ?? '',
    phone: claims.phone ?? '',
    address: claims.address ?? '',
    zipCode: claims.zipCode ?? '',
    city: claims.city ?? '',
    licenseCategory: claims.licenseCategory ?? 'A1',
    licenseNumber: claims.licenseNumber ?? '',
    createdAt: claims.createdAt ?? new Date().toISOString(),
    role: roles.includes('admin') ? 'admin' : 'user',
  };
}

function mapIamUser(user: IamUserPayload): AuthUser {
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
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | undefined>(() => getStoredToken());
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    const clearSession = () => {
      setToken(undefined);
      setUser(null);
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    };

    const persistKeycloakSession = () => {
      if (!keycloak.token || !keycloak.tokenParsed) {
        clearSession();
        return;
      }

      const nextUser = mapKeycloakUser(keycloak.tokenParsed as TokenClaims);
      window.localStorage.setItem(TOKEN_KEY, keycloak.token);
      window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      setToken(keycloak.token);
      setUser(nextUser);

      apiClient
        .get<AccountResponse>('/v1/auth/me')
        .then((res) => {
          const hydratedUser = mapIamUser(res.data.user);
          window.localStorage.setItem(USER_KEY, JSON.stringify(hydratedUser));
          setUser(hydratedUser);
        })
        .catch(() => undefined);
    };

    keycloak
      .init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        checkLoginIframe: false,
      })
      .then((authenticated) => {
        if (authenticated) {
          persistKeycloakSession();
        } else {
          clearSession();
        }
        setIsLoading(false);
      })
      .catch(() => {
        clearSession();
        setIsLoading(false);
      });

    keycloak.onAuthSuccess = persistKeycloakSession;
    keycloak.onAuthRefreshSuccess = persistKeycloakSession;
    keycloak.onAuthLogout = clearSession;
    keycloak.onTokenExpired = () => {
      keycloak.updateToken(60).catch(clearSession);
    };
  }, []);

  const login = useCallback(async (loginHint?: string) => {
    await keycloak.login({
      redirectUri: appUrl('/profile'),
      loginHint,
    });
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    await apiClient.post<AuthResponse>('/v1/auth/register', input);
    await login(input.email);
  }, [login]);

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
    await keycloak.login({
      redirectUri: appUrl('/profile'),
      action: 'CONFIGURE_TOTP',
    });
  }, []);

  const disableTwoFactor = useCallback(async () => {
    await apiClient.delete('/v1/auth/me/2fa');
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(undefined);
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(USER_KEY);
    keycloak.logout({ redirectUri: appUrl('/') });
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
