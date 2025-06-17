// @ts-ignore - eslint doesn't have type definitions
import { Linter } from 'eslint';

// eslint.config.ts
import baseConfig from './index';

const config: Linter.FlatConfig[] = [
  {
    ignores: ['README.md', 'index.d.ts', '**/*.md'],
  },
  ...baseConfig,
];

export default config;
