import { AuthUser, AuthService } from "@/types/auth";

/**
 * Mock implementation of AuthService for initial development.
 * This will be replaced by a real implementation (Keycloak/Firebase) later.
 */
class MockAuthService extends AuthService {
  private currentUser: AuthUser | null = null;
  private listeners: ((user: AuthUser | null) => void)[] = [];

  async login(): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    this.currentUser = {
      id: "1",
      email: "test@example.com",
      displayName: "Jean Moto",
      roles: ["user"]
    };
    this.notify();
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    this.notify();
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): void {
    this.listeners.push(callback);
    callback(this.currentUser);
  }

  private notify() {
    this.listeners.forEach(callback => callback(this.currentUser));
  }
}

export const authService = new MockAuthService();
