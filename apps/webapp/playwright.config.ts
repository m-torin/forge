import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e-tests/__tests__',
  use: {
    baseURL: 'http://localhost:3200',
  },
  webServer: {
    command: 'pnpm dev',
    port: 3200,
    reuseExistingServer: !process.env.CI,
    env: {
      // Disable observability during E2E tests
      OBSERVABILITY_ENABLED: 'false',
      SENTRY_ENABLED: 'false',
      BETTERSTACK_ENABLED: 'false',
      // Unset Sentry DSNs to prevent initialization
      SENTRY_DSN: '',
      NEXT_PUBLIC_SENTRY_DSN: '',
      // Unset BetterStack tokens
      BETTER_STACK_SOURCE_TOKEN: '',
      BETTERSTACK_SOURCE_TOKEN: '',
      LOGTAIL_SOURCE_TOKEN: '',
      // Disable LogTape
      LOGTAPE_ENABLED: 'false',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
