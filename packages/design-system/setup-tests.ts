import "@testing-library/jest-dom";
import React from "react";
import { vi } from "vitest";
// Add jest-dom matchers to vitest
import { expect } from "vitest";

// Make React available globally for JSX
global.React = React;

// Mock dependencies
vi.mock("next-themes", () => ({
  useTheme: vi.fn().mockReturnValue({
    resolvedTheme: "light",
    setTheme: vi.fn(),
    systemTheme: "light",
    theme: "light",
    themes: ["light", "dark", "system"],
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    info: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
  },
  Toaster: () =>
    React.createElement("div", { "data-testid": "sonner-toaster" }),
}));

vi.mock("@repo/analytics", () => ({
  useAnalytics: vi.fn().mockReturnValue({
    trackEvent: vi.fn(),
  }),
}));

vi.mock("@repo/auth/provider", () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));

vi.mock("@radix-ui/react-tooltip", () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  Tooltip: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  TooltipContent: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
  TooltipTrigger: ({ children }: { children: React.ReactNode }) =>
    React.createElement(React.Fragment, null, children),
}));
expect.extend({});
