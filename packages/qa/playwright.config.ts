import { devices } from '@playwright/test';
import { createBasePlaywrightConfig } from './src/playwright/configs/base-config';

/**
 * Playwright configuration for the QA package itself
 * Uses the centralized base config to ensure consistency
 */
export default createBasePlaywrightConfig({
  testDir: './src/playwright',
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? 'dot' : 'list',
  /* Exclude template files - they are examples, not actual tests */
  testIgnore: ['**/templates/**/*.spec.ts', '**/templates/**/*.test.ts'],
  /* Temporarily exclude WebKit due to missing system dependencies */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
  ],
});
