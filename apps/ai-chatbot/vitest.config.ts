import { createNextConfig } from '@repo/qa/vitest/configs/next';

export default createNextConfig({
  setupFiles: ['./setup.ts'],
});
