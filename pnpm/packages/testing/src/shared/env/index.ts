/**
 * Environment Testing Utilities
 *
 * This module provides utilities for handling environment variables in test environments.
 *
 * BREAKING CHANGE: Namespace exports have been removed in favor of direct exports.
 * Framework-specific utilities are now exported directly from their respective modules.
 */

// Export core utilities
export * from './core/index.ts';

// Export all framework-specific utilities directly
// Users should import from the specific module they need
export * from './vitest/index.ts';
export * from './cypress/index.ts';

// Framework detection function
/**
 * Detect the current testing framework
 * @returns The detected framework or 'unknown'
 */
export function detectFramework(): 'vitest' | 'cypress' | 'unknown' {
  const isVitest = typeof globalThis.vi !== 'undefined';
  const isCypress = typeof globalThis.Cypress !== 'undefined';

  if (isVitest) return 'vitest';
  if (isCypress) return 'cypress';
  return 'unknown';
}

// Log a warning if no framework is detected
if (detectFramework() === 'unknown') {
  console.warn(
    'No specific testing framework detected. Using core implementation.',
  );
}
