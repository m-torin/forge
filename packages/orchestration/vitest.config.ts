import { defineConfig } from 'vitest/config';
import { nodePreset } from '@repo/testing/vitest/presets';

export default defineConfig({
  ...nodePreset,
  test: {
    ...nodePreset.test,
    environment: 'node',
    setupFiles: [...(nodePreset.test?.setupFiles || []), './__tests__/setup/test-env.ts'],
  },
  define: {
    'process.env.NODE_ENV': '"test"',
    'process.env.VITEST': '"true"',
  },
});
