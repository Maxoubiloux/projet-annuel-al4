import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import MotosPage from "@/app/motos/page";

const motos = [
  {
    id: "mt07",
    brand: "Yamaha",
    model: "MT-07",
    registration: "AA-123-AA",
    category: "A2",
    style: "Roadster",
    status: "PUBLISHED",
    currentKm: 15230,
    pricePerDay: 85,
    imageUrl: "/images/motos/mt07.jpg",
    description: "Roadster",
    createdAt: "2026-01-01",
    year: 2025,
    hp: 73,
    torque: 67,
    consumption: 4.2,
    range: 300,
  },
  {
    id: "s1000rr",
    brand: "BMW",
    model: "S1000RR",
    registration: "BB-123-BB",
    category: "A",
    style: "Sportive",
    status: "PUBLISHED",
    currentKm: 4200,
    pricePerDay: 180,
    imageUrl: "/images/motos/s1000rr.jpg",
    description: "Sportive",
    createdAt: "2026-01-01",
    year: 2025,
    hp: 210,
    torque: 113,
    consumption: 6.4,
    range: 260,
  },
] as const;

const { getAllMock, getReservedTodayIdsMock, getFavoriteIdsMock, pushMock } = vi.hoisted(() => ({
  getAllMock: vi.fn(),
  getReservedTodayIdsMock: vi.fn(),
  getFavoriteIdsMock: vi.fn(),
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
    login: vi.fn(),
    register: vi.fn(),
    updateAccount: vi.fn(),
    updatePassword: vi.fn(),
    resetPassword: vi.fn(),
    logout: vi.fn(),
  }),
}));

vi.mock("@/services/motos.service", () => ({
  motosService: {
    getAll: getAllMock,
    getReservedTodayIds: getReservedTodayIdsMock,
  },
}));

vi.mock("@/services/favorites.service", () => ({
  favoritesService: {
    getIds: getFavoriteIdsMock,
    add: vi.fn(),
    remove: vi.fn(),
  },
}));

describe("MotosPage", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/motos");
    getAllMock.mockResolvedValue(motos);
    getReservedTodayIdsMock.mockResolvedValue([]);
    getFavoriteIdsMock.mockResolvedValue([]);
    pushMock.mockClear();
  });

  it("affiche les motos chargees depuis le service", async () => {
    render(<MotosPage />);

    expect(screen.getByRole("heading", { name: /nos motos/i })).toBeInTheDocument();
    expect(await screen.findByText("MT-07")).toBeInTheDocument();
    expect(screen.getByText("S1000RR")).toBeInTheDocument();
  });

  it("filtre les motos par style", async () => {
    const user = userEvent.setup();

    render(<MotosPage />);

    await screen.findByText("MT-07");
    await user.click(screen.getByRole("button", { name: "Sportive" }));

    expect(screen.getByText("S1000RR")).toBeInTheDocument();
    expect(screen.queryByText("MT-07")).not.toBeInTheDocument();
  });

  it("applique le filtre style depuis l'URL", async () => {
    window.history.replaceState(null, "", "/motos?style=Sportive");

    render(<MotosPage />);

    expect(await screen.findByText("S1000RR")).toBeInTheDocument();
    expect(screen.queryByText("MT-07")).not.toBeInTheDocument();
  });
});
