/**
 * E2E Testing Utilities
 * Comprehensive utilities for end-to-end testing with Playwright
 */

export { AppTestHelpers, createAppPlaywrightConfig } from '../playwright';
export type { AppTestConfig } from '../playwright';
export { BetterAuthTestHelpers, createAuthHelpers } from '../auth-helpers';
export type { AuthTestHelpers, TestUser } from '../auth-helpers';

// Re-export Playwright test and expect for convenience
export {
  type APIRequestContext,
  type BrowserContext,
  expect,
  type Page,
  test,
} from '@playwright/test';

// Export page object utilities
export * from './page-objects';

// Export API testing utilities
export * from './api-testing';

// Export data utilities
export * from './data-helpers';

// Export visual testing utilities
export * from './visual-testing';

// Export accessibility testing utilities
export * from './accessibility';

// Export common test patterns
export * from './patterns';
