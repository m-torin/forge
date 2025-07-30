import { createAppPlaywrightConfig } from '@repo/qa/playwright';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import { config } from 'dotenv';

config({
  path: '.env.local',
});

/* Use process.env.PORT by default and fallback to port 3300 */
const PORT = parseInt(process.env.PORT || '3300', 10);

export default createAppPlaywrightConfig({
  name: 'ai-chatbot',
  port: PORT,
  baseURL: `http://localhost:${PORT}`,
  appDirectory: '.',
  devCommand: 'pnpm dev',
  testDir: './__tests__/e2e',
  serverTimeout: 240 * 1000, // 240 seconds
});
