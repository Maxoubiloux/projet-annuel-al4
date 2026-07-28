import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/login/page";

const { loginMock, resetPasswordMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
  resetPasswordMock: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    token: undefined,
    login: loginMock,
    register: vi.fn(),
    resetPassword: resetPasswordMock,
    updateAccount: vi.fn(),
    updatePassword: vi.fn(),
    getTwoFactorStatus: vi.fn(),
    startTwoFactorSetup: vi.fn(),
    disableTwoFactor: vi.fn(),
    logout: vi.fn(),
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    loginMock.mockClear();
    resetPasswordMock.mockClear();
    loginMock.mockResolvedValue(undefined);
  });

  it("redirige vers Keycloak avec l'email en indice de connexion", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/adresse e-mail/i), "pilote@example.com");
    await user.click(screen.getByRole("button", { name: /se connecter avec keycloak/i }));

    expect(loginMock).toHaveBeenCalledWith("pilote@example.com");
  });
});
