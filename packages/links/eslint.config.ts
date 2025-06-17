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
];

export default config;
