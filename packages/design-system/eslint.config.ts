// @ts-ignore - eslint doesn't have type definitions
import { Linter } from 'eslint';

// eslint.config.ts
import reactConfig from '@repo/eslint-config/react-package';

const config: Linter.FlatConfig[] = [
  {
    ignores: [
      'hooks/use-mobile.tsx',
      '**/__tests__/**/*',
      'setup-tests.ts',
      'README.md',
      '**/*.md',
      '**/*.mdx',
      'vitest.setup.ts',
    ],
  },
  ...reactConfig,
];

export default config;
