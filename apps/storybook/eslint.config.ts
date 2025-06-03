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
      '@typescript-eslint/naming-convention': 'off', // Allow PascalCase for story names
      // Storybook-specific rules
      'import/no-default-export': 'off', // Storybook requires default exports
      'react/function-component-definition': 'off', // Allow arrow functions for stories
    },
  },
  {
    files: ['**/*.test.{ts,tsx,js,jsx}', '**/*.spec.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off', // More lenient in tests
      '@typescript-eslint/no-non-null-assertion': 'off', // Allow ! in tests
      // Test-specific rules
      'no-console': 'off', // Allow console in tests
    },
  },
  {
    files: ['.storybook/**/*'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      // Storybook configuration files can have different rules
      'import/no-default-export': 'off',
    },
  },
];
