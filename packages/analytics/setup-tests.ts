import { vi } from "vitest";

import "@repo/testing/src/vitest/setup/core";

// Polyfill removed - handled in polyfills.ts or by test environment

// Mock ResizeObserver for test environment
// These methods are intentionally empty as we don't need actual resize observation in tests
global.ResizeObserver = class ResizeObserver {
  // No-op implementation - resize observation not needed in tests
  observe() {}
  // No-op implementation - resize observation not needed in tests
  unobserve() {}
  // No-op implementation - resize observation not needed in tests
  disconnect() {}
};

// Mock window.matchMedia (only in browser-like environments)
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    value: vi.fn().mockImplementation((query: string) => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: false,
      media: query,
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    })),
    writable: true,
  });
}
