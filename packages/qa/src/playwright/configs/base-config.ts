import {
  defineConfig,
  devices,
  type PlaywrightTestConfig,
} from "@playwright/test";

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

  /* Optimize workers: Mac Studio can handle more cores, CI should be conservative but faster */
  workers: process.env.CI ? 4 : 8,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [["json", { outputFile: "test-results/results.json" }], ["github"]]
    : "list",

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Take screenshots only on failure */
    screenshot: "only-on-failure",

    /* Run tests in headless mode by default for CI/CD environments */
    headless: true,

    /* Optimized timeouts for different environments */
    actionTimeout: process.env.CI ? 15000 : 10000,
    navigationTimeout: process.env.CI ? 45000 : 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    /* WebKit only locally - CI compatibility issues */
    ...(process.env.CI
      ? []
      : [
          {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
          },
        ]),
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
