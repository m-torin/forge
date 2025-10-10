import serverConfig from '@repo/eslint-config/server';

// Add an extra configuration to ignore coverage files and markdown files in this package
const config = [
  {
    ignores: [
      'coverage/**', // Ignore coverage files that don't have proper TypeScript information
      'README.md', // Ignore README.md file to prevent parsing errors in markdown code blocks
      '**/*.md', // Ignore all markdown files
      '.kniprc.json',
    ],
  },
  ...serverConfig,
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
      'promise/param-names': 'off',
      'security/detect-unsafe-regex': 'off',
      'security/detect-non-literal-regexp': 'off',
    },
  },
];

export default config;
