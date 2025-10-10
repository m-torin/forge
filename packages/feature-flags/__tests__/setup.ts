/**
 * Test Setup for Feature Flags Package
 *
 * This file contains shared test setup and configuration for all feature flag tests.
 * It's imported by the vitest configuration to ensure consistent test environment.
 */

import { afterEach, beforeEach, vi } from 'vitest';

// Mock console methods to reduce noise in tests
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test to ensure test isolation
  vi.clearAllMocks();

  // Reset any module mocks
  vi.resetModules();

  // Ensure clean timers
  vi.useRealTimers();

  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  // Clean up any remaining mocks
  vi.restoreAllMocks();
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

// Set up global test environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver if needed
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});

// Mock ResizeObserver if needed
Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});

// Set up global test constants
const TEST_CONSTANTS = {
  DEFAULT_TIMEOUT: 5000,
  PERFORMANCE_THRESHOLD: 100,
  MOCK_USER_ID: 'test-user-123',
  MOCK_FLAG_KEY: 'test-flag',
} as const;

// Make constants globally available
(globalThis as any).TEST_CONSTANTS = TEST_CONSTANTS;

// Export for use in tests
export { TEST_CONSTANTS };
