// Configurations
// Common default configuration
import { createReactConfig } from './config/react.js';

export { createBaseConfig } from './config/base.js';
export { createReactConfig } from './config/react.js';
export { createNextConfig } from './config/next.js';
export { createNodeConfig } from './config/node.js';

// Vitest presets
export {
  createPreset,
  integrationPreset,
  nextPreset,
  nodePreset,
  reactPreset,
} from './vitest-presets.js';

// Setup utilities
export { setTestEnv, suppressConsoleErrors } from './setup/common.js';

// Mocks
export { setupBrowserMocks } from './mocks/browser.js';
export { mockNextImage, mockNextNavigation, mockNextThemes, setupNextMocks } from './mocks/next.js';
export * from './mocks/auth.js';

// Testing utilities
export { customRender } from './utils/render.js';
export { render, renderDark, renderWithLocale, TestProviders } from './render.js';
export * from '@testing-library/react';

// Default export is a React-specific config
export default createReactConfig();
