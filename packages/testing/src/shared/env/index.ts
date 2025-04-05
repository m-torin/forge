/**
 * Environment Testing Utilities
 *
 * This module provides utilities for handling environment variables in test environments.
 *
 * BREAKING CHANGE: Namespace exports have been removed in favor of direct exports.
 * Framework-specific utilities are now exported directly from their respective modules.
 */

// Export core values
export {
  testEnvVars,
  validationPatterns,
  exampleEnvVars,
  isTestEnvironment,
  createTestAwareValidator,
} from "./core/index.ts";

// Export core functionality with framework-specific implementations
// Let the framework detection decide which implementation to use
import { detectFramework } from "./detect.ts";
import * as coreUtils from "./core/index.ts";
import * as vitestUtils from "./vitest/index.ts";
import * as cypressUtils from "./cypress/index.ts";

// Dynamically select the right implementation based on framework
const framework = detectFramework();
let implementationUtils: typeof coreUtils;

switch (framework) {
  case "vitest":
    implementationUtils = vitestUtils;
    break;
  case "cypress":
    // @ts-ignore - Suppress type mismatch error
    implementationUtils = cypressUtils;
    break;
  default:
    implementationUtils = coreUtils;
    break;
}

// Export the framework-specific implementations
export const {
  mockEnvVars,
  setupAllTestEnvVars,
  mockDate,
  setupConsoleMocks,
  restoreConsoleMocks,
} = implementationUtils;

// Export types from detect.ts
export { detectFramework };

// Log a warning if no framework is detected
if (detectFramework() === "unknown") {
  console.warn(
    "No specific testing framework detected. Using core implementation.",
  );
}
