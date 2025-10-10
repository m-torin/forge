import packageConfig from '@repo/eslint-config/package';

const config = [
  ...packageConfig,
  {
    files: ['**/*.js'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      'import/extensions': 'off', // Allow file extensions
    },
  },
  {
    files: ['__tests__/**/*.ts', '__tests__/**/*.tsx'],
    rules: {
      // Allow test factory patterns and complex test structures
      'vitest/no-standalone-expect': 'off',
      'vitest/no-conditional-expect': 'off',
      'vitest/no-conditional-tests': 'off',
      'vitest/no-conditional-in-test': 'off',
      'vitest/expect-expect': 'off',
      'vitest/require-to-throw-message': 'off',
      'vitest/prefer-strict-equal': 'off',
      'vitest/valid-title': 'off',
      'promise/param-names': 'off',
    },
  },
  {
    ignores: ['.kniprc.json'],
  },
];

export default config;
