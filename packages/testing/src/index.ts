/**
 * @repo/testing
 *
 * Testing utilities for the Next-Forge monorepo.
 */

// Export all Vitest configuration and utilities
export * as vitest from './vitest/index.ts';

// Export all Cypress configuration and utilities
export * as cypress from './cypress/index.ts';

// Export environment testing utilities
export * as env from './shared/env/index.ts';

// Export shared utilities and constants
export * as shared from './shared/index.ts';

/**
 * Testing Utilities for Next-Forge
 *
 * This module provides utilities for testing in the Next-Forge monorepo.
 */

// Export vitest generators for direct use in package configs
export * from './generators/vitest.config.js';

// Export convenience function for vitest config
export { getConfig as createVitestConfig } from './generators/vitest.config.js';

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

  // Constants
  testEnvVars,
  testUser,
  testAdmin,
  testDates,
} from './shared/index.ts';

// Add deprecation warning for old env path
// @ts-ignore - This is intentional for backward compatibility
export * as _deprecated_env from './env/index.ts';
