/**
 * Shared testing utilities
 *
 * These utilities are framework-agnostic and can be used with any testing setup.
 */

// Export environment utilities
export {
  createTestAwareValidator,
  // Use the correct exports from the env module
  testEnvVars,
  isTestEnvironment,
  mockEnvVars,
} from "../env/index.ts";

// Define missing functions for compatibility
export const getTestEnv = (key: string): string | undefined => {
  // @ts-ignore - Access testEnvVars
  return testEnvVars[key];
};

export const setupTestEnv = (): void => {
  console.warn("setupTestEnv is deprecated. Use mockEnvVars instead.");
};

export const validateTestEnv = (): boolean => {
  console.warn(
    "validateTestEnv is deprecated. Use createTestAwareValidator instead.",
  );
  return true;
};

// Export mock utilities
export {
  setupConsoleMocks,
  restoreConsoleMocks,
  mockDate,
  mockFetch,
} from "./mocks.ts";

// Re-export Vitest functions for convenience
export {
  vi,
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
} from "vitest";

/**
 * @deprecated Use imports from '@repo/testing/vitest/env' instead
 */
export * from "./env.ts";
