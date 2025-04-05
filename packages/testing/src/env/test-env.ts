/**
 * Test Environment Utilities
 *
 * This module provides utilities for handling environment variables in test environments.
 * It helps standardize how test environments are detected and how validation rules
 * are applied differently in test vs. production environments.
 */
import { testEnvVars, validationPatterns } from "./constants.ts";

// Re-export constants for convenience
export { testEnvVars, validationPatterns };

/**
 * Determines if the current environment is a test environment
 * @returns boolean indicating if NODE_ENV === 'test'
 */
export const isTestEnvironment = (): boolean => {
  return process.env.NODE_ENV === "test";
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
 * import { createTestAwareValidator } from '@repo/testing/env/test-env';
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
 * Setup all test environment variables at once
 * @returns Function to restore original environment variables
 */
export function setupAllTestEnvVars(): () => void {
  return mockEnvVars(testEnvVars);
}
