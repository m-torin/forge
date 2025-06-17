import { defineConfig } from 'vitest/config';
import { nodePreset } from '@repo/testing/vitest-presets';

export default defineConfig({
  ...nodePreset,
  test: {
    ...nodePreset.test,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
});
