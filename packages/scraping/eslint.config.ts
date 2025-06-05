import baseConfig from '@repo/eslint-config/package';

export default [
  ...baseConfig,
  {
    ignores: [
      '**/*.md',
      'ARCHITECTURE.md',
      'MIGRATION_PLAN.md',
      'README.md',
      'src/__tests__/**/*',
      'src/server/providers/**/*',
      'src/shared/utils/!(manager-stub).ts',
    ],
  },
];
