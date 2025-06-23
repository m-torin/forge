import { defineConfig } from '@playwright/test';

import { createAppPlaywrightConfig } from '@repo/testing/playwright';

const baseConfig = createAppPlaywrightConfig({
  name: 'web-template',
  appDirectory: __dirname,
  baseURL: 'http://localhost:3250',
  devCommand: 'pnpm dev',
  port: 3250,
});

const config = defineConfig({
  ...baseConfig,

  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,

  // Test configuration
  testDir: './e2e',
  workers: process.env.CI ? 2 : 4, // Use 4 workers locally for web-template

  // Reporter configuration
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],

  // Use configuration from base
  use: {
    ...baseConfig.use,

    // Performance thresholds
    actionTimeout: 10000,
    navigationTimeout: 30000,

    // Video and screenshot settings for debugging
    video: process.env.CI ? 'retain-on-failure' : 'off',
    screenshot: 'only-on-failure',

    // Trace collection
    trace: process.env.CI ? 'retain-on-failure' : 'off',
  },

  // Project configuration
  projects: [
    {
      name: 'chromium',
      use: { ...baseConfig.projects?.[0]?.use },
    },
    {
      name: 'firefox',
      use: { ...baseConfig.projects?.[1]?.use },
    },
    {
      name: 'webkit',
      use: { ...baseConfig.projects?.[2]?.use },
    },
  ],
});

export default config;
