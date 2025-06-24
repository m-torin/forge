import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';
import { reactPreset } from '@repo/testing/vitest/presets';

export default defineConfig({
  ...reactPreset,
  resolve: {
    ...reactPreset.resolve,
    alias: {
      ...reactPreset.resolve?.alias,
      '@': resolve(dirname, './'),
      '@repo/analytics': resolve(dirname, '../analytics'),
      '@repo/design-system': resolve(dirname, './'),
      '@repo/notifications': resolve(dirname, '../notifications'),
      geist: resolve(dirname, './mocks/geist.ts'),
      'geist/font/mono': resolve(dirname, './mocks/geist-mono.ts'),
      'geist/font/sans': resolve(dirname, './mocks/geist-sans.ts'),
    },
  },
  test: {
    ...reactPreset.test,
    setupFiles: ['./vitest.setup.ts'],
  },
});
