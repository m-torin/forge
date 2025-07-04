import baseConfig from '@repo/eslint-config/package';

// Observability package specific overrides - very lenient for development/utility package
const config = [
  {
    // Ignore problematic files completely
    ignores: ['**/*.bak', '**/*.disabled', 'src/**/*.bak', 'src/**/*.disabled'],
  },
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-console': 'off', // Allow console.log in observability package
      'import/extensions': 'off', // Allow file extensions
      'import/no-duplicates': 'warn', // Downgrade import duplications to warnings
      'unused-imports/no-unused-vars': 'warn', // Downgrade to warnings
      'unused-imports/no-unused-imports': 'warn',
      'promise/param-names': 'off', // Allow non-standard Promise parameter names
      'promise/prefer-await-to-then': 'off', // Allow .then() usage
      'promise/catch-or-return': 'off', // Allow promise patterns
      'promise/no-promise-in-callback': 'off', // Allow promises in callbacks
      'promise/always-return': 'off', // Allow missing returns in promises
    },
  },
];

export default config;
