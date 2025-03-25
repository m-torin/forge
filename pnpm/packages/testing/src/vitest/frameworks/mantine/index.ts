/**
 * Mantine-specific testing utilities
 *
 * This module provides all the utilities needed for testing Mantine components.
 */

// Export Mantine-specific configuration
export { createMantineConfig } from '../../configs/mantine.ts';

// Export Mantine-specific renderer
// Note: We rename mantineRender to render for consistency
export {
  mantineRender as render,
  screen,
  within,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
  act,
  cleanup,
} from '../../renderers/index.ts';

// Export Mantine-specific setup
export { setupMantine } from '../../setup/mantine.ts';

// Export Mantine-specific templates
export * as componentTemplate from '../../templates/mantine/component.test.tsx';

// Re-export React utilities that are compatible with Mantine
export { MockAuthProvider } from '../../mocks/auth-react.tsx';

// Re-export shared utilities for convenience
export * from '../../shared/index.ts';
