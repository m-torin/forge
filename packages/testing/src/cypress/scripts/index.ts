/**
 * Cypress Scripts
 *
 * This module provides scripts for setting up and working with Cypress in the Next-Forge monorepo.
 */

import { setupCypress, copyFixtures } from "./setup.ts";

// Re-export setup utilities
export { setupCypress, copyFixtures };

// Export as default
export default {
  setupCypress,
  copyFixtures,
};
