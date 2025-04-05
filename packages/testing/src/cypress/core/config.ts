import {
  defineConfig,
  PluginEvents,
  PluginConfigOptions,
  CypressConfig,
} from "cypress";

/**
 * Base configuration for Cypress
 *
 * This provides sensible defaults for Cypress configuration in the Next-Forge monorepo.
 * Includes performance optimizations for faster test execution.
 */
export const baseConfig: Partial<CypressConfig> = {
  viewportWidth: 1280,
  viewportHeight: 720,
  video: false,
  screenshotOnRunFailure: true,
  env: {
    testEnvironment: "test",
  },
  // Special handling for Next.js and React
  experimentalFetchPolyfill: true,
  // Consistent testing environment for CI/CD
  defaultCommandTimeout: 10000,

  // Performance optimizations
  numTestsKeptInMemory: 10, // Limit memory usage
  retries: { runMode: 1, openMode: 0 }, // Retry failed tests once in CI
  experimentalMemoryManagement: true, // Enable experimental memory management
  watchForFileChanges: true, // Auto-reload on file changes
};

/**
 * Create component testing configuration
 *
 * @param customConfig - Custom configuration options
 * @returns Component testing configuration
 */
export const createComponentConfig = (
  customConfig: Partial<CypressConfig> = {},
) => {
  return defineConfig({
    component: {
      devServer: {
        framework: "react",
        bundler: "vite",
      },
      setupNodeEvents(
        on: PluginEvents,
        config: PluginConfigOptions,
      ): PluginConfigOptions {
        // Custom event handlers
        return config;
      },
      specPattern: "cypress/component/**/*.cy.{js,jsx,ts,tsx}",
      ...baseConfig,
      ...customConfig,
    },
  });
};

/**
 * Create E2E testing configuration
 *
 * @param customConfig - Custom configuration options
 * @returns E2E testing configuration
 */
export const createE2EConfig = (customConfig: Partial<CypressConfig> = {}) => {
  return defineConfig({
    e2e: {
      setupNodeEvents(
        on: PluginEvents,
        config: PluginConfigOptions,
      ): PluginConfigOptions {
        // Custom event handlers
        return config;
      },
      baseUrl: "http://localhost:3000",
      specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
      ...baseConfig,
      ...customConfig,
    },
  });
};

export default {
  baseConfig,
  createComponentConfig,
  createE2EConfig,
};
