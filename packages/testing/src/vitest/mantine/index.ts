/**
 * Testing Utilities for Mantine Components
 *
 * This module provides testing utilities for Mantine components:
 * import { render, screen } from '@repo/testing/vitest/mantine';
 */

// Re-export render function and other utilities from the renderer
export * from "../renderers/mantine.ts";

// Import and initialize Mantine setup
import { setupMantine } from "../setup/mantine.ts";

// Run setup automatically when imported
setupMantine();

// Export the setup function in case direct access is needed
export { setupMantine };
