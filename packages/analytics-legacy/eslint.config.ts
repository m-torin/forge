// eslint.config.ts
import packageConfig from '@repo/eslint-config/package';

// @ts-ignore - eslint doesn't have type definitions
import type { Linter } from 'eslint';

const config: Linter.FlatConfig[] = [
  {
    ignores: ['README.md', '**/*.md'],
  },
  ...packageConfig,
];

export default config;
