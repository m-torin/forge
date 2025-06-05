import { createAppPlaywrightConfig } from '@repo/testing/playwright';

export default createAppPlaywrightConfig({
  name: 'web',
  appDirectory: __dirname,
  baseURL: 'http://localhost:3200',
  devCommand: 'pnpm dev',
  port: 3200,
});