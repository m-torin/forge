import { defineConfig, devices, type PlaywrightTestConfig } from '@playwright/test';

/**
 * Base Playwright configuration shared across all configurations
 * This is the single source of truth for common Playwright settings
 */
export const basePlaywrightConfig: PlaywrightTestConfig = {
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? 'dot' : 'list',

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshots only on failure */
    screenshot: 'only-on-failure',

    /* Run tests in headless mode by default for CI/CD environments */
    headless: true,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
};

/**
 * Get base Playwright config with optional overrides
 */
export function getBasePlaywrightConfig(
  overrides: Partial<PlaywrightTestConfig> = {},
): PlaywrightTestConfig {
  return {
    ...basePlaywrightConfig,
    ...overrides,
    use: {
      ...basePlaywrightConfig.use,
      ...(overrides.use || {}),
    },
    projects: overrides.projects || basePlaywrightConfig.projects,
  };
}

/**
 * Creates a base Playwright configuration with common settings
 * This function is used by all other configurations for consistency
 */
export function createBasePlaywrightConfig(
  overrides: Partial<PlaywrightTestConfig> = {},
): PlaywrightTestConfig {
  return defineConfig(getBasePlaywrightConfig(overrides));
}
