// eslint.config.ts
import reactConfig from '@repo/eslint-config/react-package';

import type { Linter } from 'eslint';

const config: Linter.FlatConfig[] = [
  {
    ignores: [
      'README.md', // Ignore README.md file to prevent parsing errors in markdown code blocks
      '**/*.md', // Ignore all markdown files
    ],
  },
  ...reactConfig,
];

export default config;
