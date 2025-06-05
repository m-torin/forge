import { defineConfig } from 'vitest/config';
import baseConfig from '@repo/testing/config/react';

export default defineConfig({
  ...baseConfig,
  test: {
    ...baseConfig.test,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
  },
});