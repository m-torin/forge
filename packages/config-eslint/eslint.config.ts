// eslint.config.ts
import baseConfig from './index.js';

// @ts-ignore - eslint doesn't have type definitions
import type { Linter } from 'eslint';

const config: Linter.FlatConfig[] = [
  {
    ignores: ['README.md', 'index.d.ts', '**/*.md'],
  },
  ...baseConfig,
];

export default config;
