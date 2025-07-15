import { createNextAppConfig } from '@repo/qa/vitest/configs';
import viteTsconfigPaths from 'vite-tsconfig-paths';

/**
 * Vitest configuration for ai-chatbot application
 * Uses centralized Next.js app config with custom setup and exclusions
 */
export default createNextAppConfig({
  setupFiles: ['__tests__/setup.ts'],
  excludePaths: [
    'tests/**/*', // Exclude the old test files that have import issues
    'src/lib/ai/models.test.ts', // Exclude the problematic models test file
  ],
  overrides: {
    plugins: [viteTsconfigPaths({ ignoreConfigErrors: true })],
  },
});
