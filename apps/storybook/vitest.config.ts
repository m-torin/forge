import { createNextAppConfig } from '@repo/qa/vitest/configs';
import { resolve } from 'node:path';

export default createNextAppConfig({
  aliases: {
    '#/root': resolve(process.cwd(), '.'),
  },
});
