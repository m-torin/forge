import { generateReactConfig } from '@repo/testing/generators';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default generateReactConfig({
  dirname: __dirname,
  setupFiles: ['./setup-tests.ts'],
  coverage: {
    reporter: ['text', 'json', 'html'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/setup-tests.ts']
  }
});
