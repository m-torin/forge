import { createAppPlaywrightConfig } from '@repo/qa/playwright';

export default createAppPlaywrightConfig({
  name: 'docs',
  port: 3800,
  baseURL: 'http://localhost:3800',
  appDirectory: '.',
  devCommand: 'mintlify dev --port 3800',
});
