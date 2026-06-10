import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import React from "react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.clearAllMocks();
});

vi.mock("next/image", () => ({
  default: (imageProps: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean;
    priority?: boolean;
  }) => {
    const props = { ...imageProps } as Record<string, unknown>;
    const src = typeof props.src === "string" ? props.src : "";
    const alt = typeof props.alt === "string" ? props.alt : "";

    delete props.src;
    delete props.alt;
    delete props.fill;
    delete props.priority;

    return React.createElement("img", {
      ...props,
      src,
      alt,
    });
  },
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
    href: string | { pathname?: string };
    children: React.ReactNode;
  }) =>
    React.createElement(
      "a",
      {
        ...props,
        href: typeof href === "string" ? href : href.pathname ?? "",
      },
      children
    ),
}));
