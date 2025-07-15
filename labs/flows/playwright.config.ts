import { createAppPlaywrightConfig } from '@repo/qa/playwright';

export default createAppPlaywrightConfig({
  name: 'flows',
  port: 3000,
  baseURL: 'http://localhost:3000',
  appDirectory: '.',
  devCommand: 'pnpm dev',
  testDir: './__tests__/e2e',
});