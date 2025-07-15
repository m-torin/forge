import { createReactPackageConfig } from '@repo/qa/vitest/configs';

export default createReactPackageConfig({
  setupFiles: ['./__tests__/setup.ts'],
});
