// eslint.config.ts
/* eslint-disable import/extensions */
import packageConfig from '@repo/eslint-config/package';

// @ts-ignore - eslint doesn't have type definitions
import { Linter } from 'eslint';

const config: Linter.FlatConfig[] = [
  {
    ignores: [
      'src/generated/**/*',
      'generated/**/*',
      'prisma/generated/**/*',
      'prisma-generated/**/*',
      '**/generated/**/*',
      '**/*.md',
      '**/__tests__/**/*',
      'redis/**/*',
      // Ignore Prisma client generated files
      'prisma/prisma/client/**/*',
      // Ignore seed files from type-aware linting
      'prisma/seed*.ts',
    ],
  },
  ...packageConfig,
];

export default config;
