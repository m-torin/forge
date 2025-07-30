import { createNextAppConfig } from '@repo/qa/vitest/configs';

export default createNextAppConfig({
  setupFiles: ['./vitest.setup.ts'],
});
