// Configurations
// Common default configuration
import { createReactConfig } from './config/react';

export { createBaseConfig } from './config/base';
export { createReactConfig } from './config/react';
export { createNextConfig } from './config/next';
export { createNodeConfig } from './config/node';

// Vitest presets
export {
  createPreset,
  integrationPreset,
  nextPreset,
  nodePreset,
  reactPreset,
} from './vitest-presets';

// Setup utilities
export { setTestEnv, suppressConsoleErrors } from './setup/common';

// Mocks
export { setupBrowserMocks } from './mocks/browser';
export { mockNextImage, mockNextNavigation, mockNextThemes, setupNextMocks } from './mocks/next';
export * from './mocks/auth';
export * from './mocks/firestore';
export * from './mocks/upstash-redis';
export * from './mocks/upstash-vector';

// Testing utilities
export { customRender } from './utils/render';
export { render, renderDark, renderWithLocale, TestProviders } from './render';
export * from './utils/database';
export * from '@testing-library/react';

// Playwright E2E utilities (available via subpath export: @repo/testing/e2e)
// Re-export key utilities for convenience
export { AppTestHelpers, createAppPlaywrightConfig } from './playwright';
export { BetterAuthTestHelpers, createAuthHelpers } from './auth-helpers';
export type { AuthTestHelpers, TestUser } from './auth-helpers';

// Default export is a React-specific config
export default createReactConfig();
