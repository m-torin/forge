import { createNextAppConfig } from '@repo/qa/vitest/configs';
import { resolve } from 'node:path';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default createNextAppConfig({
  aliases: {
    '#/root': resolve(process.cwd(), '.'),
  },
  overrides: {
    plugins: [viteTsconfigPaths({ ignoreConfigErrors: true })],
  },
});
