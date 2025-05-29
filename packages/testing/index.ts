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

// Testing utilities
export { customRender } from './utils/render';
export { render, renderDark, renderWithLocale, TestProviders } from './render';
export * from '@testing-library/react';

// Default export is a React-specific config
export default createReactConfig();
