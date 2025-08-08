import { setupBrowserMocks } from '@repo/qa/vitest/mocks/internal/browser';
import '@repo/qa/vitest/setup/next-app';

// Set up comprehensive browser API mocks (replaces 70+ lines of duplicate code)
setupBrowserMocks();

// App-specific mocks only (those not covered by centralized setup)
// Mock navigator.connection for network detection (app-specific behavior)
Object.defineProperty(navigator, 'connection', {
  writable: true,
  value: {
    effectiveType: '4g',
    downlink: 10,
    onchange: null,
  },
});

// Mock document.startViewTransition for progressive enhancement
Object.defineProperty(document, 'startViewTransition', {
  writable: true,
  value: undefined,
});
