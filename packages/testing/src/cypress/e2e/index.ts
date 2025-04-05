/**
 * E2E Testing Utilities
 *
 * This module provides utilities for E2E testing with Cypress in the Next-Forge monorepo.
 */

import { createE2EConfig } from "../core/config.ts";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the E2E support file
export const supportFile = path.resolve(__dirname, "./setup.ts");

// Re-export the E2E configuration creator
export { createE2EConfig };

// Export as default
export default {
  createE2EConfig,
  supportFile,
};
