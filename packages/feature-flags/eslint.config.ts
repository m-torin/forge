// eslint.config.ts
import serverConfig from '@repo/eslint-config/server';

// @ts-ignore - eslint doesn't have type definitions
import type { Linter } from 'eslint';

const config: Linter.FlatConfig[] = [
  {
    ignores: [
      'README.md', // Ignore README.md file to prevent parsing errors in markdown code blocks
      '**/*.md', // Ignore all markdown files
      'coverage/**', // Ignore coverage files that don't have proper TypeScript information
    ],
  },
  ...serverConfig,
];

export default config;
