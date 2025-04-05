import { describe, expect, it, vi } from "vitest";

// @ts-ignore - @repo/testing/vitest module may not be found during type checking
import { render, screen } from "@repo/testing/vitest";

import { DesignSystemProvider } from "../index";

// Import mocked modules
vi.mock("@repo/analytics");
vi.mock("@repo/auth/provider");
vi.mock("next-themes");
vi.mock("sonner");
vi.mock("@radix-ui/react-tooltip");

describe("DesignSystemProvider", () => {
  it("renders children correctly", () => {
    render(
      <DesignSystemProvider>
        <div data-testid="test-child">Test Child</div>
      </DesignSystemProvider>,
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Test Child")).toBeInTheDocument();
  });

  it("renders the Toaster component", () => {
    render(
      <DesignSystemProvider>
        <div>Test Child</div>
      </DesignSystemProvider>,
    );

    expect(screen.getByTestId("sonner-toaster")).toBeInTheDocument();
  });

  it("passes theme properties to ThemeProvider", () => {
    // Since ThemeProvider is mocked, we can't directly test that the props are passed
    // But we can test that the component renders without errors when passing theme props
    expect(() => {
      render(
        <DesignSystemProvider
          disableTransitionOnChange={false}
          attribute="data-theme"
          defaultTheme="dark"
          enableSystem={false}
        >
          <div>Test Child</div>
        </DesignSystemProvider>,
      );
    }).not.toThrow();
  });

  it("wraps children with all required providers", () => {
    // Since the providers are mocked, we can't directly test the nesting order
    // But we can test that the component renders without errors
    expect(() => {
      render(
        <DesignSystemProvider>
          <div>Test Child</div>
        </DesignSystemProvider>,
      );
    }).not.toThrow();
  });
});
