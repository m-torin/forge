import { Linter } from 'eslint';

// eslint.config.ts
import serverConfig from '@repo/eslint-config/server';

// Add an extra configuration to ignore coverage files and markdown files in this package
const config: Linter.FlatConfig[] = [
  {
    ignores: [
      'coverage/**', // Ignore coverage files that don't have proper TypeScript information
      'README.md', // Ignore README.md file to prevent parsing errors in markdown code blocks
      '**/*.md', // Ignore all markdown files
    ],
  },
  ...serverConfig,
];

export default config;
