import { defineConfig } from 'vitest/config';

import baseConfig from '@repo/testing/config/node';

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    environment: 'node',
    globals: true,
    setupFiles: [],
  },
});
