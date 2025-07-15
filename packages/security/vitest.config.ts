import { createNodePackageConfig } from '@repo/qa/vitest/configs';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default createNodePackageConfig({
  setupFiles: ['./test-setup.ts'],
  overrides: {
    test: {
      include: [
        'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        '__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ],
    },
    plugins: [viteTsconfigPaths({ ignoreConfigErrors: true })],
  },
});
