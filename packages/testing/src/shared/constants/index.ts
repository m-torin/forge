/**
 * Constants for Testing
 *
 * This file re-exports all constants from across the testing package.
 */

// Export default values
export * from "./defaults.ts";

// Export paths and other constants
export * from "./paths.ts";

// Re-export validation patterns and test values from env
export { validationPatterns, testEnvVars } from "../env/core/values.ts";

// Test users for authentication testing
export const testUser = {
  id: "user_test_123",
  email: "test@example.com",
  name: "Test User",
  role: "user",
};

export const testAdmin = {
  id: "user_test_admin_456",
  email: "admin@example.com",
  name: "Admin User",
  role: "admin",
};

// Test dates for date-based testing
export const testDates = {
  past: new Date("2020-01-01"),
  present: new Date("2023-01-01"),
  future: new Date("2025-01-01"),
  iso: "2023-01-01T00:00:00.000Z",
};
