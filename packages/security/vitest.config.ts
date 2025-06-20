import path from 'path';
import { defineConfig, type UserConfig } from 'vitest/config';
import { nodePreset } from '@repo/testing/vitest/presets';

export default defineConfig({
  ...nodePreset,
  resolve: {
    ...nodePreset.resolve,
    alias: {
      ...nodePreset.resolve?.alias,
      '@': path.resolve(__dirname, './'),
      '@repo': path.resolve(__dirname, '../../packages'),
    },
  },
  test: {
    ...nodePreset.test,
    setupFiles: ['./test-setup.ts'],
  },
} as UserConfig);
