import { createAppPlaywrightConfig } from '@repo/qa/playwright';

export default createAppPlaywrightConfig({
  name: 'email',
  port: 3500,
  baseURL: 'http://localhost:3500',
  appDirectory: process.cwd(),
});
