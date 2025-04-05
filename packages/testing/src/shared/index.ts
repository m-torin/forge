/**
 * Shared Testing Utilities
 *
 * Framework-agnostic utilities and constants that can be used by both Vitest and Cypress.
 */

// Export utilities, constants, presets and mock registry
export * from "./utils/index.ts";
export * from "./presets/index.ts";
export * from "./mockRegistry/index.ts";

// Export constants from constants/index.ts
export {
  defaultTimeouts,
  defaultViewports,
  defaultWaitOptions,
  defaultLogOptions,
  testUser,
  testAdmin,
  testDates,
} from "./constants/index.ts";

// Re-export environment utilities with specific names
import * as envModule from "./env/index.ts";
export {
  detectFramework,
  mockEnvVars,
  setupAllTestEnvVars,
  mockDate,
  setupConsoleMocks,
  restoreConsoleMocks,
  isTestEnvironment,
  createTestAwareValidator,
} from "./env/index.ts";

// Export the test env variables and validation patterns from env module explicitly
export const envTestVars = envModule.testEnvVars;
export const envValidationPatterns = envModule.validationPatterns;

// Export as namespaces for backwards compatibility
export * as utils from "./utils/index.ts";
export * as constants from "./constants/index.ts";
export * as presets from "./presets/index.ts";
export * as env from "./env/index.ts";
export * as mockRegistry from "./mockRegistry/index.ts";
