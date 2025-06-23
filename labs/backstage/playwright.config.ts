import { createAppPlaywrightConfig } from '@repo/testing/playwright';

export default createAppPlaywrightConfig({
  name: 'backstage',
  appDirectory: '/Users/torin/repos/new--/forge/apps/backstage',
  baseURL: 'http://localhost:3300',
  devCommand: 'pnpm dev',
  port: 3300,
});
