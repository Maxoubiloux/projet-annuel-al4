import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import LoginPage from "@/app/login/page";
import { AuthProvider } from "@/hooks/useAuth";

const { pushMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("LoginPage", () => {
  it("connecte l'utilisateur puis redirige vers l'accueil", async () => {
    const user = userEvent.setup();

    render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    await user.type(screen.getByLabelText(/adresse e-mail/i), "pilote@example.com");
    await user.type(screen.getByLabelText(/mot de passe/i), "secret");
    await user.click(screen.getByRole("button", { name: /connexion/i }));

    expect(pushMock).toHaveBeenCalledWith("/");
    expect(localStorage.getItem("user")).toContain("pilote@example.com");
  });
});
