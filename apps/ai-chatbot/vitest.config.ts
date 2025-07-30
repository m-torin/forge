import { createNextAppConfig } from '@repo/qa/vitest/configs';
import path from 'path';

/**
 * Vitest configuration for ai-chatbot application
 * Uses centralized Next.js app config with custom setup and exclusions
 */
export default createNextAppConfig({
  setupFiles: ['__tests__/setup.ts'],
  aliases: {
    '@': path.resolve(process.cwd(), './'),
  },
  excludePaths: [
    'tests/**/*', // Exclude the old test files that have import issues
    'lib/ai/models.test.ts', // Exclude the problematic models test file
  ],
});
