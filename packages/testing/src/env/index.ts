/**
 * Environment Testing Utilities (DEPRECATED)
 *
 * This module is deprecated. Please use '@repo/testing/shared' instead.
 * It will be removed in a future version.
 */

// Show deprecation warning
console.warn(
  '[DEPRECATED] @repo/testing/env is deprecated. Please use @repo/testing/shared instead.',
);

// Re-export from the new location for backward compatibility
export * from '../shared/env/index.ts';

// Export templates for backward compatibility
export * as templates from './templates/index.ts';
