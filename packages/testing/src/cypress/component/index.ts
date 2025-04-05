/**
 * Component Testing Utilities
 *
 * This module provides utilities for component testing with Cypress in the Next-Forge monorepo.
 */

import { createComponentConfig } from "../core/config.ts";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the component support file
export const supportFile = path.resolve(__dirname, "./setup.tsx");

// Re-export the component configuration creator
export { createComponentConfig };

// Export as default
export default {
  createComponentConfig,
  supportFile,
};
