import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import keycloak from './keycloak';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin';
}

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  isAuthenticated: boolean;
  isUnauthorized: boolean;
  isLoading: boolean;
  token: string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseUser(): User | null {
  const t = keycloak.tokenParsed;
  if (!t) return null;
  const roles: string[] = t.realm_access?.roles ?? [];
  if (!roles.includes('admin')) return null;
  return {
    id: t.sub ?? '',
    name: (t.name as string) ?? (t.preferred_username as string) ?? '',
    email: (t.email as string) ?? '',
    role: 'admin',
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | undefined>(undefined);
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    keycloak
      .init({
        onLoad: 'check-sso',
        pkceMethod: 'S256',
        silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`,
        checkLoginIframe: false,
      })
      .then((authenticated) => {
        if (authenticated) {
          const parsed = parseUser();
          if (parsed) {
            setUser(parsed);
            setToken(keycloak.token);
          } else {
            setIsUnauthorized(true);
          }
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));

    keycloak.onTokenExpired = () => {
      keycloak
        .updateToken(60)
        .then(() => setToken(keycloak.token))
        .catch(() => {
          setUser(null);
          setToken(undefined);
        });
    };

    keycloak.onAuthSuccess = () => {
      const parsed = parseUser();
      if (parsed) {
        setUser(parsed);
        setToken(keycloak.token);
        setIsUnauthorized(false);
      } else {
        setIsUnauthorized(true);
      }
    };

    keycloak.onAuthLogout = () => {
      setUser(null);
      setToken(undefined);
      setIsUnauthorized(false);
    };
  }, []);

  const login = useCallback(() => {
    keycloak.login({ redirectUri: window.location.origin + '/' });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(undefined);
    setIsUnauthorized(false);
    keycloak.logout({ redirectUri: window.location.origin + '/login' });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isUnauthorized, isLoading, token }}>
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
