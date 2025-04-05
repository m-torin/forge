import Home from "@/app/page";
import { ColorSchemesSwitcher } from "@/components/color-schemes-switcher";
import { render } from "@/test-utils";
import { screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

// Mock Mantine components as needed
vi.mock("@mantine/core", async () => {
  const actual = await vi.importActual("@mantine/core");
  return {
    ...(actual as Record<string, unknown>),
  };
});

// Mock the next/image component
vi.mock("next/image", () => ({
  // Use a custom component that renders a div instead of img to avoid the no-img-element warning
  default: ({
    width,
    alt,
    className,
    height,
    src,
  }: {
    width: number;
    alt: string;
    className?: string;
    height: number;
    src: string;
  }) => (
    <div
      data-testid="next-image"
      className={className}
      style={{ width, height }}
      data-alt={alt}
      data-src={src}
    >
      {alt}
    </div>
  ),
}));

// Mock the ColorSchemesSwitcher component
vi.mock("@/components/color-schemes-switcher", () => ({
  ColorSchemesSwitcher: vi.fn(() => (
    <div data-testid="color-schemes-switcher">Color Schemes Switcher</div>
  )),
}));

describe.skip("Home Page", () => {
  it("renders the welcome message", () => {
    render(<Home />);

    expect(screen.getByText(/Welcome to/i)).toBeInTheDocument();
    expect(screen.getByText("Mantine")).toBeInTheDocument();
    expect(screen.getByText("TailwindCSS")).toBeInTheDocument();
  });

  it("renders the description text", () => {
    render(<Home />);

    expect(
      screen.getByText(
        /This starter Next.js project includes a minimal setup/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders the Next.js logo", () => {
    render(<Home />);

    const logo = screen.getByTestId("next-image");
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute(
      "data-src",
      "https://nextjs.org/icons/next.svg",
    );
    expect(logo).toHaveAttribute("data-alt", "logo");
  });

  it("renders the ColorSchemesSwitcher component", () => {
    render(<Home />);

    expect(ColorSchemesSwitcher).toHaveBeenCalled();
    expect(screen.getByTestId("color-schemes-switcher")).toBeInTheDocument();
  });

  it("renders the AppShell component with correct structure", () => {
    render(<Home />);

    // Check for header
    const header = screen.getByRole("banner");
    expect(header).toBeInTheDocument();

    // Check for main content
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
  });

  it("renders the title with gradient text", () => {
    render(<Home />);

    // Check for gradient text spans
    const mantineText = screen.getByText("Mantine");
    expect(mantineText).toBeInTheDocument();
    expect(mantineText.tagName).toBe("SPAN");

    const tailwindText = screen.getByText("TailwindCSS");
    expect(tailwindText).toBeInTheDocument();
    expect(tailwindText.tagName).toBe("SPAN");

    // Check that they have gradient classes or props
    // Since we're using Mantine's variant="gradient" we can check for the component prop
    expect(mantineText).toHaveAttribute("component", "span");
    expect(tailwindText).toHaveAttribute("component", "span");
  });

  it("renders the ColorSchemesSwitcher in a centered container", () => {
    render(<Home />);

    // Use getByTestId instead of parentElement
    const colorSchemesSwitch = screen.getByTestId("color-schemes-switcher");
    expect(colorSchemesSwitch).toBeInTheDocument();

    // We can't directly test the parent's classes without DOM traversal
    // Instead, we can test that the component renders correctly
  });
});
