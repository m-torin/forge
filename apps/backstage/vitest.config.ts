import { defineConfig } from 'vitest/config';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);
const vitestConfig = require('@repo/testing/config/next');

export default defineConfig({
  ...vitestConfig,
  test: {
    ...vitestConfig.test,
    root: path.resolve(__dirname),
  },
});