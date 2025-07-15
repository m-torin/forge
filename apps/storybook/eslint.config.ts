import reactPackageConfig from '@repo/eslint-config/react-package';

export default [
  ...reactPackageConfig,
  {
    ignores: [
      'storybook-static/**',
      // Also ignore common Storybook directories
      '.storybook/public/**',
      'public/**',
      // Ignore markdown files to prevent TypeScript project issues
      '**/*.md',
      '**/*.mdx',
    ],
  },
  {
    files: ['**/*.stories.{ts,tsx,js,jsx}'],
    rules: {
      // Storybook-specific rules
      'import/no-default-export': 'off', // Storybook requires default exports
    },
  },
  {
    files: ['**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}'],
    rules: {
      // Test-specific rules
      'no-console': 'off', // Allow console in tests
      'import/extensions': 'off', // Allow importing without extensions
    },
  },
  {
    files: ['.storybook/**/*'],
    rules: {
      // Storybook configuration files can have different rules
      'import/no-default-export': 'off',
    },
  },
];
