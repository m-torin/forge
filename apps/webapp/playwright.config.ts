import { createAppPlaywrightConfig } from '@repo/qa/playwright';

export default createAppPlaywrightConfig({
  name: 'webapp',
  port: 3200,
  baseURL: 'http://localhost:3200',
  appDirectory: '.',
  devCommand: 'pnpm dev',
  testDir: './__tests__/e2e',
});
