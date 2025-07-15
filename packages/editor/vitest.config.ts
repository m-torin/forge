import { createReactPackageConfig } from '@repo/qa/vitest/configs';

export default createReactPackageConfig({
  setupFiles: ['./vitest.setup.ts'],
  overrides: {},
});
