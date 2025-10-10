/**
 * E2E Testing Utilities
 * Comprehensive utilities for end-to-end testing with Playwright
 */

// Re-export Playwright test and expect for convenience
export {
  expect,
  test,
  type APIRequestContext,
  type BrowserContext,
  type Page,
} from "@playwright/test";

// Export page object utilities
export * from "./page-objects";

// Export API testing utilities
export * from "./api-testing";

// Export data utilities
export * from "./data-helpers";

// Export visual testing utilities
export * from "./visual-testing";

// Export accessibility testing utilities
export * from "./accessibility";

// Export authentication utilities
export * from "./auth";

// Export common test patterns
export * from "./patterns";

// Export performance testing utilities
export * from "./performance-budgets";

// Export file upload utilities
export * from "./file-upload";

// Export session management utilities
export * from "./session-management";

// Export error handling utilities
export * from "./errors";

// Export shared interfaces and types
export * from "./shared-interfaces";

// Export utility factory and composite utilities
export * from "./utility-factory";
