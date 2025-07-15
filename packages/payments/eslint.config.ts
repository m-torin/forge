import { Linter } from 'eslint';

// eslint.config.ts
import serverConfig from '@repo/eslint-config/server';

const config: Linter.FlatConfig[] = [
  ...serverConfig,
  {
    files: ['**/*.js'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },
];

export default config;
