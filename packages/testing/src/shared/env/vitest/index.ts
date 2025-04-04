/**
 * Vitest-specific Environment Utilities
 *
 * This module provides Vitest-specific utilities for handling environment variables in tests.
 * It builds on the core environment utilities but adds Vitest-specific functionality.
 */
import { vi } from 'vitest';
import {
  isTestEnvironment,
  createTestAwareValidator,
  mockEnvVars as coreEnvMock,
  testEnvVars,
  exampleEnvVars,
  validationPatterns,
  setupAllTestEnvVars as coreSetupAllTestEnvVars,
  mockDate as coreMockDate,
  setupConsoleMocks as coreSetupConsoleMocks,
  restoreConsoleMocks as coreRestoreConsoleMocks,
} from '../core/index.ts';

// Re-export core utilities
export {
  isTestEnvironment,
  createTestAwareValidator,
  testEnvVars,
  exampleEnvVars,
  validationPatterns,
};

/**
 * Mock environment variables for Vitest tests
 * This implementation uses vi.stubEnv and vi.unstubEnv for better integration with Vitest
 *
 * @param envVars - Key-value pairs of environment variables
 * @returns Function to restore original environment variables
 */
export function mockEnvVars(envVars: Record<string, string>): () => void {
  // Store original values for restoration
  const originalValues: Record<string, string | undefined> = {};

  // Apply mock environment variables using vi.stubEnv
  Object.entries(envVars).forEach(([key, value]) => {
    originalValues[key] = process.env[key];
    vi.stubEnv(key, value);
  });

  // Return function to restore original environment
  return () => {
    Object.entries(originalValues).forEach(([key, value]) => {
      if (value === undefined) {
        // Use vi.unstubEnv when available, otherwise delete from process.env
        if (typeof vi.unstubEnv === 'function') {
          vi.unstubEnv(key);
        } else {
          delete process.env[key];
        }
      } else {
        vi.stubEnv(key, value);
      }
    });
  };
}

/**
 * Setup test environment variables using Vitest's stubEnv
 * @param envVars - Environment variables to set (should come from the application's own environment)
 * @returns Function to restore original environment variables
 *
 * @example
 * ```ts
 * // Import from your application's environment
 * import { env } from './env';
 *
 * // Set up test environment variables
 * const restore = setupAllTestEnvVars({
 *   API_KEY: env.API_KEY,
 *   // ...other app-specific variables
 * });
 *
 * // Later, restore the original environment
 * restore();
 * ```
 */
export function setupAllTestEnvVars(
  envVars?: Record<string, string>,
): () => void {
  if (!envVars) {
    console.warn(
      'No environment variables provided to setupAllTestEnvVars. ' +
        "You should provide your application's environment variables. " +
        'See exampleEnvVars for format examples.',
    );
    return () => {};
  }
  return mockEnvVars(envVars);
}

/**
 * Setup console mocks for testing
 * @returns Function to restore original console methods
 */
export function setupConsoleMocks(): () => void {
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  };

  console.log = vi.fn();
  console.error = vi.fn();
  console.warn = vi.fn();
  console.info = vi.fn();

  return () => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
  };
}

/**
 * Restore console mocks
 */
export function restoreConsoleMocks(): void {
  vi.restoreAllMocks();
}

/**
 * Mock the current date for testing
 * @param date - Date to mock
 * @returns Function to restore original Date
 */
export function mockDate(date: Date = new Date('2023-01-01')): () => void {
  const RealDate = Date;

  // @ts-ignore - We're intentionally mocking the Date constructor
  global.Date = class extends RealDate {
    constructor(...args: any[]) {
      if (args.length === 0) {
        return new RealDate(date);
      }
      return new RealDate(...args);
    }

    static now() {
      return date.getTime();
    }
  };

  return () => {
    global.Date = RealDate;
  };
}

/**
 * Mock fetch for testing
 * @param mockResponse - Response to mock
 * @returns Mock function
 */
export function mockFetch(mockResponse: any = {}): ReturnType<typeof vi.fn> {
  const mock = vi.fn().mockResolvedValue({
    ok: true,
    json: vi.fn().mockResolvedValue(mockResponse),
    text: vi.fn().mockResolvedValue(JSON.stringify(mockResponse)),
    status: 200,
    headers: new Headers(),
    ...mockResponse,
  });

  global.fetch = mock;
  return mock;
}
