import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/login/page";

const { loginMock, resetPasswordMock, pushMock } = vi.hoisted(() => ({
  loginMock: vi.fn(),
  resetPasswordMock: vi.fn(),
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
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
    logout: vi.fn(),
  }),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    loginMock.mockClear();
    resetPasswordMock.mockClear();
    pushMock.mockClear();
    loginMock.mockResolvedValue(undefined);
  });

  it("connecte avec le formulaire frontend puis ouvre le profil", async () => {
    const user = userEvent.setup();

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/adresse e-mail/i), "pilote@example.com");
    await user.type(screen.getByLabelText(/mot de passe/i), "motdepasse");
    await user.click(screen.getByRole("button", { name: /se connecter/i }));

    expect(loginMock).toHaveBeenCalledWith("pilote@example.com", "motdepasse", undefined);
    expect(pushMock).toHaveBeenCalledWith("/profile");
  });
});
