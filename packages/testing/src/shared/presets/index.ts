/**
 * Shared Presets
 *
 * Framework-specific presets that can be used by both Vitest and Cypress.
 *
 * BREAKING CHANGE: Namespace exports have been removed in favor of direct exports.
 */

// Export Vitest presets directly
export * from "./vitest.ts";

// Import for default export
import * as vitestPresets from "./vitest.ts";

// Export default object with all presets
export default {
  vitest: vitestPresets,
};
