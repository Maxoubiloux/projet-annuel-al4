import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Navbar from "@/components/layout/Navbar";

const { replaceMock, useAuthMock } = vi.hoisted(() => ({
  replaceMock: vi.fn(),
  useAuthMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: replaceMock,
  }),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: useAuthMock,
}));

describe("Navbar", () => {
  beforeEach(() => {
    useAuthMock.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: undefined,
      login: vi.fn(),
      register: vi.fn(),
      resetPassword: vi.fn(),
      accountManagement: vi.fn(),
      logout: vi.fn(),
    });
  });

  it("affiche le lien de connexion quand l'utilisateur n'est pas authentifie", () => {
    render(<Navbar />);

    expect(screen.getByRole("link", { name: /connexion/i })).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("affiche le menu utilisateur quand l'utilisateur est authentifie", () => {
    const logout = vi.fn();
    useAuthMock.mockReturnValue({
      user: {
        id: "1",
        email: "user@example.com",
        firstName: "Alice",
        lastName: "Martin",
        role: "user",
      },
      isAuthenticated: true,
      isLoading: false,
      token: "token",
      login: vi.fn(),
      register: vi.fn(),
      resetPassword: vi.fn(),
      accountManagement: vi.fn(),
      logout,
    });

    render(<Navbar />);

    fireEvent.click(screen.getByRole("button", { name: /alice martin/i }));

    expect(screen.getAllByText("Alice Martin")).toHaveLength(2);
    fireEvent.click(screen.getByRole("menuitem", { name: /déconnexion/i }));
    expect(logout).toHaveBeenCalled();
  });
});
