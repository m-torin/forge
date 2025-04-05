/**
 * Test file to validate imports from the new structure
 */

// Import from configs
import { createBaseConfig } from "./configs/base.ts";
import { createReactConfig } from "./configs/react.ts";
import { createMantineConfig } from "./configs/mantine.ts";
import { createServerConfig } from "./configs/server.ts";

// Import from renderers
import { render as reactRender } from "./renderers/react.ts";
import { mantineRender } from "./renderers/index.ts";

// Import from mocks
import { setupBrowserMocks } from "./mocks/browser.ts";

// Import from setup
import { setupMantine } from "./setup/mantine.ts";

// Log imports to verify they work
console.log("Configs:", {
  createBaseConfig,
  createReactConfig,
  createMantineConfig,
  createServerConfig,
});

console.log("Renderers:", {
  reactRender,
  mantineRender,
});

console.log("Mocks:", {
  setupBrowserMocks,
});

console.log("Setup:", {
  setupMantine,
});

// Export everything to verify the types
export {
  createBaseConfig,
  createReactConfig,
  createMantineConfig,
  createServerConfig,
  reactRender,
  mantineRender,
  setupBrowserMocks,
  setupMantine,
};
