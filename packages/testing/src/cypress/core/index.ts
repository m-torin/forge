/**
 * Core Cypress functionality
 *
 * This module provides the core functionality for Cypress testing in the Next-Forge monorepo.
 */

import {
  baseConfig,
  createComponentConfig,
  createE2EConfig,
} from './config.ts';

// Re-export configuration
export { baseConfig, createComponentConfig, createE2EConfig };

// Export as default
export default {
  baseConfig,
  createComponentConfig,
  createE2EConfig,
};
