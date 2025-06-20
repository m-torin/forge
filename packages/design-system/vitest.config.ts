import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import { reactPreset } from '@repo/testing/vitest/presets';

export default defineConfig({
  ...reactPreset,
  resolve: {
    ...reactPreset.resolve,
    alias: {
      ...reactPreset.resolve?.alias,
      '@': resolve(__dirname, './'),
      '@repo/analytics': resolve(__dirname, '../analytics'),
      '@repo/design-system': resolve(__dirname, './'),
      '@repo/notifications': resolve(__dirname, '../notifications'),
      geist: resolve(__dirname, './mocks/geist.ts'),
      'geist/font/mono': resolve(__dirname, './mocks/geist-mono.ts'),
      'geist/font/sans': resolve(__dirname, './mocks/geist-sans.ts'),
    },
  },
  test: {
    ...reactPreset.test,
    setupFiles: ['./vitest.setup.ts'],
  },
});
