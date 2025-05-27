import nextConfig from '@repo/eslint-config/next';

import type { Linter } from 'eslint';

const config: Linter.FlatConfig[] = [
  {
    ignores: [
      // Ignore well-known files that might not be in the tsconfig
      'app/.well-known/**',
    ],
  },
  ...nextConfig,
];

export default config;
