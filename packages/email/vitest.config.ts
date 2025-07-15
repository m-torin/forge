import { createReactPackageConfig } from '@repo/qa/vitest/configs';

export default createReactPackageConfig({
  setupFiles: ['./test-setup.ts'],
  overrides: {
    test: {
      include: [
        'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        '__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ],
      coverage: {
        enabled: false,
      },
    },
  },
});
