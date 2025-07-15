// Base test setup for all packages
// Import this in your vitest.setup.ts file

import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest';
import { cleanupEnvironmentMocks, resetAllMocks, setupEnvironmentMocks } from '../mocks';

// Suppress console errors in tests unless explicitly needed
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

// Setup environment before all tests
beforeAll(() => {
  // Set up test environment
  setupEnvironmentMocks();

  // Set up global PostHog mock for client-side tests
  if (typeof globalThis !== 'undefined') {
    (globalThis as any).posthog = {
      __loaded: true,
      init: vi.fn(),
      capture: vi.fn(),
      identify: vi.fn(),
      alias: vi.fn(),
      get_distinct_id: vi.fn(() => 'test-distinct-id'),
      isFeatureEnabled: vi.fn(() => false),
      getFeatureFlag: vi.fn(() => null),
      getFeatureFlagPayload: vi.fn(() => null),
      onFeatureFlags: vi.fn(),
      reloadFeatureFlags: vi.fn(),
      opt_out_capturing: vi.fn(),
      opt_in_capturing: vi.fn(),
      has_opted_out_capturing: vi.fn(() => false),
      get_property: vi.fn(),
      set_config: vi.fn(),
      get_config: vi.fn(),
      debug: vi.fn(),
      register: vi.fn(),
      register_once: vi.fn(),
      unregister: vi.fn(),
      get_session_id: vi.fn(() => 'test-session-id'),
      get_session_replay_url: vi.fn(),
      people: {
        set: vi.fn(),
        set_once: vi.fn(),
      },
    };
  }

  // Set up console suppression
  console.error = (...args: any[]) => {
    // Only log errors that aren't expected in tests
    const firstArg = String(args[0]);
    if (
      !firstArg.includes('Warning:') &&
      !firstArg.includes('Error:') &&
      !firstArg.includes('Attempted to access') &&
      !firstArg.includes('Environment initialization failed')
    ) {
      originalError(...args);
    }
  };

  console.warn = (...args: any[]) => {
    // Only log warnings that aren't expected in tests
    const firstArg = String(args[0]);
    if (!firstArg.includes('Warning:')) {
      originalWarn(...args);
    }
  };

  console.log = (...args: any[]) => {
    // Filter out verbose test logs
    const firstArg = String(args[0]);
    if (
      !firstArg.includes('[Observability]') &&
      !firstArg.includes('[QStash]') &&
      !firstArg.includes('memory analysis:')
    ) {
      originalLog(...args);
    }
  };
});

// Reset mocks before each test
beforeEach(() => {
  // Ensure clean state for each test
  resetAllMocks();
});

// Optional: Add any additional cleanup after each test
afterEach(() => {
  // Additional cleanup if needed
});

// Clean up after all tests
afterAll(() => {
  // Clean up environment
  cleanupEnvironmentMocks();

  // Restore console methods
  console.error = originalError;
  console.warn = originalWarn;
  console.log = originalLog;
});

// Global test utilities
global.testUtils = {
  // Add any global test utilities here
};
