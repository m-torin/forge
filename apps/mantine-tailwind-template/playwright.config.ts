import { createAppPlaywrightConfig } from '@repo/qa/playwright';

export default createAppPlaywrightConfig({
  name: 'mantine-tailwind-template',
  port: 3900,
  baseURL: 'http://localhost:3900',
  appDirectory: '.',
  devCommand: 'pnpm dev',
});
