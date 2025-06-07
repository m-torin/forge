import { defineConfig, devices } from "@playwright/test";

import { createAppPlaywrightConfig } from "@repo/testing/playwright";

const baseConfig = createAppPlaywrightConfig({
  name: "web",
  appDirectory: __dirname,
  baseURL: "http://localhost:3200",
  devCommand: "pnpm dev",
  port: 3200,
});

const config = defineConfig({
  ...baseConfig,

  // Global setup and teardown
  // Temporarily disabled until database env is properly configured
  // globalSetup: require.resolve('./e2e/setup/global-setup.ts'),
  // globalTeardown: require.resolve('./e2e/setup/global-teardown.ts'),

  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  // Test configuration
  testDir: "./e2e",
  workers: process.env.CI ? 2 : 8, // Use 8 workers locally (leaving 2 cores for system)

  // Reporter configuration with custom performance reporter
  reporter: [
    ["html"],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
    // Custom performance reporter
    [require.resolve("./e2e/reporters/performance-reporter.ts")],
  ],

  // Use configuration from base but add performance thresholds
  use: {
    ...baseConfig.use,

    // Performance thresholds
    actionTimeout: 10000,
    navigationTimeout: 30000,

    // Video and screenshot settings for debugging
    video: process.env.CI ? "retain-on-failure" : "off",
    screenshot: "only-on-failure",

    // Trace collection
    trace: process.env.CI ? "retain-on-failure" : "off",
  },

  // Projects with different configurations
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Performance monitoring enabled
        contextOptions: {
          recordVideo: process.env.CI
            ? { dir: "test-results/videos" }
            : undefined,
        },
      },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    // Mobile testing
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
    // Performance testing project
    {
      name: "Performance",
      testMatch: /.*\.performance\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        // Dedicated settings for performance tests
        actionTimeout: 30000,
        navigationTimeout: 60000,
      },
    },
  ],

  // Webserver configuration
  webServer: baseConfig.webServer,
});

export default config;
