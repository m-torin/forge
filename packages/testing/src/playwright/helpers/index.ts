/**
 * E2E Testing Utilities
 * Comprehensive utilities for end-to-end testing with Playwright
 */

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

// Export authentication utilities
export * from './auth';

// Export common test patterns
export * from './patterns';
