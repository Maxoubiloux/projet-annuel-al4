export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  roles: string[];
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
}

export abstract class AuthService {
  abstract login(): Promise<void>;
  abstract logout(): Promise<void>;
  abstract getCurrentUser(): AuthUser | null;
  abstract onAuthStateChanged(callback: (user: AuthUser | null) => void): void;
}
