import { createNextAppConfig } from '@repo/qa/vitest/configs';

export default createNextAppConfig({
  setupFiles: ['./__tests__/setup.ts'],
});
