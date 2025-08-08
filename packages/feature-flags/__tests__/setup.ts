/**
 * Test Setup for Feature Flags Package
 *
 * This file contains shared test setup and configuration for all feature flag tests.
 * It's imported by the vitest configuration to ensure consistent test environment.
 */

import { setupBrowserMocks } from '@repo/qa/vitest/mocks/internal/browser';
import { afterEach, beforeEach, vi } from 'vitest';

// Set up centralized browser mocks (includes ResizeObserver, IntersectionObserver, matchMedia)
setupBrowserMocks();

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test to ensure test isolation
  vi.clearAllMocks();

  // Reset any module mocks
  vi.resetModules();

  // Ensure clean timers
  vi.useRealTimers();
});

afterEach(() => {
  // Clean up any remaining mocks
  vi.restoreAllMocks();
});

// Mock console methods to reduce noise in tests
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

beforeEach(() => {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.warn = originalConsoleWarn;
  console.error = originalConsoleError;
});

// Centralized browser mocks now handle matchMedia, IntersectionObserver, ResizeObserver

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
