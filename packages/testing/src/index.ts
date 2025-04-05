/**
 * @repo/testing
 *
 * Testing utilities for the Next-Forge monorepo.
 */

// Export all Vitest configuration and utilities
export * as vitest from "./vitest/index.ts";

// Export all Cypress configuration and utilities
export * as cypress from "./cypress/index.ts";

// Export environment testing utilities
export * as env from "./shared/env/index.ts";

// Export shared utilities and constants
export * as shared from "./shared/index.ts";

/**
 * Testing Utilities for Next-Forge
 *
 * This module provides utilities for testing in the Next-Forge monorepo.
 */

// Export vitest generators for direct use in package configs
export * from "./generators/vitest.config.js";

// Export convenience function for vitest config
export { getConfig as createVitestConfig } from "./generators/vitest.config.js";

// Re-export commonly used utilities and constants
export {
  // DOM utilities
  formatTestId,
  dataTestIdSelector,
  ariaLabelSelector,

  // Test utilities
  createTestCases,
  waitForCondition,

  // Mock utilities
  createMockResponse,
  createStorageMock,
} from "./shared/index.ts";

// Declare test constants with manual types to fix typecheck issues
export const testEnvVars = {
  REQUIRED_API_KEY: "test_api_key",
  OPTIONAL_API_KEY: "test_optional_key",
};

export const testUser = {
  id: "user_test_123",
  email: "test@example.com",
  name: "Test User",
};

export const testAdmin = {
  id: "admin_test_456",
  email: "admin@example.com",
  name: "Admin User",
};

export const testDates = {
  now: new Date(),
  past: new Date("2020-01-01"),
  future: new Date("2030-01-01"),
};

// Add deprecation warning for old env path
// @ts-ignore - This is intentional for backward compatibility
export * as _deprecated_env from "./env/index.ts";
