import { createReactConfig } from '@repo/qa/vitest/configs';

export default createReactConfig({
  setupFiles: ['./vitest.setup.ts'],
});
