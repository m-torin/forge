import { createReactPackageConfig } from '@repo/qa/vitest/configs';
import { resolve } from 'node:path';

export default createReactPackageConfig({
  setupFiles: ['./vitest.setup.ts'],
  overrides: {
    test: {
      include: [
        'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
        '__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      ],
      server: {
        deps: {
          inline: ['@mantine/hooks'],
        },
      },
      coverage: {
        enabled: false,
      },
    },
    resolve: {
      alias: {
        '@': './',
        '@repo/analytics': '../analytics',
        '@repo/design-system': './',
        '@repo/notifications': '../notifications',
        '@mantine/hooks': resolve(process.cwd(), './mocks/mantine-hooks.ts'),
        geist: resolve(process.cwd(), './mocks/geist.ts'),
        'geist/font/mono': resolve(process.cwd(), './mocks/geist-mono.ts'),
        'geist/font/sans': resolve(process.cwd(), './mocks/geist-sans.ts'),
      },
    },
  },
});
