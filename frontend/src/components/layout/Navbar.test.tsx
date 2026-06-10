import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Navbar from "@/components/layout/Navbar";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

function LoginButton() {
  const { login } = useAuth();

  return <button onClick={() => login("user@example.com")}>Login test</button>;
}

function renderNavbar() {
  render(
    <AuthProvider>
      <LoginButton />
      <Navbar />
    </AuthProvider>
  );
}

describe("Navbar", () => {
  it("affiche les liens de connexion quand l'utilisateur n'est pas authentifie", () => {
    renderNavbar();

    expect(screen.getByRole("link", { name: /se connecter/i })).toHaveAttribute(
      "href",
      "/login"
    );
    expect(screen.getByRole("link", { name: /créer un compte/i })).toHaveAttribute(
      "href",
      "/register"
    );
  });

  it("affiche l'etat connecte apres login", () => {
    renderNavbar();

    fireEvent.click(screen.getByRole("button", { name: /login test/i }));

    expect(screen.getByText(/bonjour/i)).toBeInTheDocument();
    expect(screen.getByText("Utilisateur")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /déconnexion/i })).toBeInTheDocument();
  });
});
