import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import MotosPage from "@/app/motos/page";

describe("MotosPage", () => {
  it("affiche les motos avec un kilometrage formate en francais", () => {
    render(<MotosPage />);

    expect(screen.getByRole("heading", { name: /nos motos/i })).toBeInTheDocument();
    expect(screen.getByText("MT-07")).toBeInTheDocument();
    expect(screen.getByText(/15\s230 km/)).toBeInTheDocument();
  });

  it("filtre les motos par style", async () => {
    const user = userEvent.setup();

    render(<MotosPage />);

    await user.click(screen.getByRole("button", { name: "SPORTIVE" }));

    expect(screen.getByText("S1000RR")).toBeInTheDocument();
    expect(screen.queryByText("Africa Twin")).not.toBeInTheDocument();
  });
});
