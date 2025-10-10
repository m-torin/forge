import { createPackagePlaywrightConfig } from '@repo/qa/playwright';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDirectory = dirname(fileURLToPath(import.meta.url));

export default createPackagePlaywrightConfig({
  packageDirectory,
  testDir: 'playwright',
  aliases: {
    '#/playwright': resolve(packageDirectory, 'playwright'),
  },
  use: {
    viewport: { width: 1440, height: 900 },
    locale: 'en-US',
    timezoneId: 'America/New_York',
    actionTimeout: 45000,
    navigationTimeout: 60000,
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },
});
