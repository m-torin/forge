/**
 * Core setup functions for Vitest
 */
import { vi, beforeAll, afterAll, beforeEach, afterEach } from "vitest";

// Original console methods store
let originalConsole: Record<string, any> = {};

/**
 * Setup console mocks to prevent noisy console output in tests
 */
export function setupConsoleMocks(): void {
  // Store original console methods
  originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
    debug: console.debug,
  };

  // Mock console methods
  console.log = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
  console.info = vi.fn();
  console.debug = vi.fn();
}

/**
 * Restore original console methods
 */
export function restoreConsoleMocks(): void {
  // Restore original console methods
  if (originalConsole.log) {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.info = originalConsole.info;
    console.debug = originalConsole.debug;
  }
}

/**
 * Mock environment variables for tests
 * @param envVars - Key-value pairs of environment variables
 * @returns Function to restore original environment variables
 */
export function mockEnvVars(envVars: Record<string, string>): () => void {
  const originalEnv = { ...process.env };

  // Apply mock environment variables
  Object.entries(envVars).forEach(([key, value]) => {
    process.env[key] = value;
  });

  // Return function to restore original environment
  return () => {
    Object.keys(envVars).forEach((key) => {
      if (key in originalEnv) {
        process.env[key] = originalEnv[key];
      } else {
        delete process.env[key];
      }
    });
  };
}

// Setup global before/after hooks
beforeAll(() => {
  setupConsoleMocks();
});

afterAll(() => {
  restoreConsoleMocks();
});

// Reset mocks between tests
beforeEach(() => {
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.resetModules();
});

// Export Vitest functions for easier import
export { vi, beforeAll, afterAll, beforeEach, afterEach };
