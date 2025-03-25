import { vi } from 'vitest';
import '@repo/testing/src/vitest/setup/core';

// Polyfill TextEncoder for esbuild
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = class TextEncoder {
    encode(input) {
      const buf = new Uint8Array(input.length);
      for (let i = 0; i < input.length; i++) {
        buf[i] = input.charCodeAt(i);
      }
      return buf;
    }
  };
}

// Add any package-specific test setup here
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.matchMedia (only in browser-like environments)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}
