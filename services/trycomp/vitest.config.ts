import { defineConfig } from 'vitest/config';
import { nodePreset } from '@repo/testing/vitest/presets';

export default defineConfig({
  ...nodePreset,
  test: {
    ...nodePreset.test,
    name: 'trycomp',
  },
});
