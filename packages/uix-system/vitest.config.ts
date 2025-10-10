import { createReactPackageConfig } from '@repo/qa/vitest/configs';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const baseConfig = createReactPackageConfig({
  overrides: {
    test: {
      // Exclude accessibility tests from main test suite
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/.{idea,git,cache,output,temp}/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        '__tests__/accessibility/**', // Run accessibility tests separately
        '__tests__/visual-regression/**', // Visual tests run with Playwright
      ],
      // Setup file for main tests (excludes accessibility-specific setup)
      setupFiles: ['@repo/qa/vitest/setup/react-package'],
    },
  },
});

// Add vite-tsconfig-paths plugin to handle TypeScript path resolution
export default defineConfig({
  ...baseConfig,
  plugins: [...(baseConfig.plugins || []), tsconfigPaths()],
});
