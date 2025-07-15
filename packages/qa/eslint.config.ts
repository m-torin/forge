// eslint.config.ts
import baseConfig from '@repo/eslint-config';

import type { Linter } from 'eslint';

// Create a new configuration that extends the base config
// and adds our custom ignore pattern for markdown files
const config: Linter.FlatConfig[] = [
  {
    ignores: ['**/*.md'],
  },
  ...baseConfig,
  {
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off', // Disable type-aware rule
    },
  },
];

export default config;
