/**
 * Cypress-specific Environment Utilities (DEPRECATED)
 *
 * This module is deprecated. Please use '@repo/testing/shared/cypress' instead.
 * It will be removed in a future version.
 */

// Show deprecation warning
console.warn(
  "[DEPRECATED] @repo/testing/cypress/env is deprecated. Please use @repo/testing/shared/cypress instead.",
);

// Re-export from the new location for backward compatibility
export * from "../../shared/env/cypress/index.ts";
