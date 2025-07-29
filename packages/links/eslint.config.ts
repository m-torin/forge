import baseConfig from '@repo/eslint-config/react-package';

// Links package specific overrides for development/example files
const config = [
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-console': 'off', // Allow console.log in development package
      'import/extensions': 'off', // Allow file extensions for .js imports
      'unused-imports/no-unused-vars': 'warn', // Downgrade to warnings
      'unused-imports/no-unused-imports': 'warn',
    },
  },
  {
    files: ['src/examples/**/*.{ts,tsx}'],
    rules: {
      'unused-imports/no-unused-vars': 'off', // Completely off for examples
      'unused-imports/no-unused-imports': 'off',
    },
  },
  {
    files: ['**/*.test.{ts,tsx}', '__tests__/**/*.ts', '__tests__/**/*.tsx'],
    rules: {
      // Allow test factory patterns and complex test structures
      'vitest/no-standalone-expect': 'off',
      'vitest/no-conditional-expect': 'off',
      'vitest/no-conditional-tests': 'off',
      'vitest/no-conditional-in-test': 'off',
      'vitest/expect-expect': 'off',
      'vitest/require-to-throw-message': 'off',
      'vitest/prefer-strict-equal': 'off',
      'promise/param-names': 'off',
      'unused-imports/no-unused-vars': 'warn', // Downgrade to warnings for tests
    },
  },
];

export default config;
