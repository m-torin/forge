/**
 * Core Environment Utilities
 *
 * This module provides framework-agnostic utilities for handling environment variables in test environments.
 * It helps standardize how test environments are detected and how validation rules
 * are applied differently in test vs. production environments.
 */
import { exampleEnvVars, testEnvVars, validationPatterns } from './values.ts';

// Re-export constants for convenience
export { exampleEnvVars, testEnvVars, validationPatterns };

/**
 * Determines if the current environment is a test environment
 * @returns boolean indicating if NODE_ENV === 'test'
 */
export const isTestEnvironment = (): boolean => {
  return process.env.NODE_ENV === 'test';
};

/**
 * Creates environment-aware validators based on test vs. production environment
 * @param testValue The value to use in test environments
 * @param productionValue The value to use in production environments
 * @returns The appropriate value based on the current environment
 * @example
 * ```ts
 * // With Zod validators
 * import { z } from 'zod';
 * import { createTestAwareValidator } from '@repo/testing/shared';
 *
 * const apiKeyValidator = createTestAwareValidator(
 *   z.string().min(1).optional(), // Test environment - more relaxed
 *   z.string().min(1).startsWith('sk-').optional() // Production - stricter
 * );
 * ```
 */
export function createTestAwareValidator<T>(
  testValue: T,
  productionValue: T,
): T {
  return isTestEnvironment() ? testValue : productionValue;
}

/**
 * Mock environment variables for tests
 * This is a framework-agnostic implementation that works with any testing setup
 *
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

/**
 * Setup test environment variables
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
 * Mock the current date for testing
 * @param date - Date to mock (defaults to 2023-01-01)
 * @returns Function to restore original Date
 */
export function mockDate(date: Date = new Date('2023-01-01')): () => void {
  const RealDate = global.Date;

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
 * Setup console mocks for testing
 * This is a framework-agnostic implementation that works with any testing setup
 * @returns Function to restore original console methods
 */
export function setupConsoleMocks(): () => void {
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info,
  };

  // Use simple mocks that do nothing
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
  console.info = () => {};

  return () => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
  };
}

/**
 * Restore console mocks
 * This is a no-op in the framework-agnostic implementation
 */
export function restoreConsoleMocks(): void {
  console.warn(
    'restoreConsoleMocks is deprecated. Console mocks are automatically restored by the returned function from setupConsoleMocks.',
  );
}
