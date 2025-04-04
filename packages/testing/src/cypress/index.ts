/**
 * Cypress Testing Utilities
 *
 * This module provides utilities for Cypress testing in the Next-Forge monorepo.
 * It includes configuration, commands, and setup utilities for both E2E and component testing.
 *
 * BREAKING CHANGE: Namespace exports have been removed in favor of direct exports.
 */

// Direct exports of configuration functions
export {
  baseConfig,
  createComponentConfig,
  createE2EConfig,
} from './core/config.ts';

// Export core functionality directly
export * from './core/index.ts';

// Export E2E functionality directly
export * from './e2e/index.ts';

// Export component functionality directly
export * from './component/index.ts';

// Export scripts directly
export * from './scripts/index.ts';

// Export environment utilities directly
export * from './env/index.ts';

// Export shared utilities and constants directly
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
} from '../shared/utils/index.ts';

export {
  // Constants
  testEnvVars,
  testUser,
  testAdmin,
  testDates,

  // Configuration constants
  paths as configPaths,
  filePatterns,
  timeouts,
  environments,
} from '../shared/constants/index.ts';

// Export paths to support files
export const paths = {
  e2eSupport: './e2e/setup.ts',
  componentSupport: './component/setup.tsx',
  commands: './core/commands',
  fixtures: './core/fixtures',
};
