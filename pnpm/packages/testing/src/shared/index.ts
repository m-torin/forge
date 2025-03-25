/**
 * Shared Testing Utilities
 *
 * Framework-agnostic utilities and constants that can be used by both Vitest and Cypress.
 */

// Export utilities
export * from './utils/index.ts';

// Export constants
export * from './constants/index.ts';

// Export presets
export * from './presets/index.ts';

// Export environment utilities
export * from './env/index.ts';

// Export mock registry
export * from './mockRegistry/index.ts';

// Export as namespaces
export * as utils from './utils/index.ts';
export * as constants from './constants/index.ts';
export * as presets from './presets/index.ts';
export * as env from './env/index.ts';
export * as mockRegistry from './mockRegistry/index.ts';
