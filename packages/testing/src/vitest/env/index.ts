/**
 * Vitest-specific Environment Utilities (DEPRECATED)
 *
 * This module is deprecated. Please use '@repo/testing/shared/vitest' instead.
 * It will be removed in a future version.
 */

// Show deprecation warning
console.warn(
  "[DEPRECATED] @repo/testing/vitest/env is deprecated. Please use @repo/testing/shared/vitest instead.",
);

// Re-export from the new location for backward compatibility
export * from "../../shared/env/vitest/index.ts";
