// @ts-ignore - eslint doesn't have type definitions
import { Linter } from 'eslint';

// eslint.config.ts
import baseConfig from './src/index';

const config: Linter.FlatConfig[] = [
  {
    ignores: ['README.md', 'index.d.ts', '**/*.md'],
  },
  ...baseConfig,
  // Disable pnpm rules for this package since it's the eslint config package itself
  {
    files: ['package.json'],
    rules: {
      'pnpm/json-enforce-catalog': 'off',
      'pnpm/json-valid-catalog': 'off',
      'pnpm/json-prefer-workspace-settings': 'off',
    },
  },
];

export default config;
