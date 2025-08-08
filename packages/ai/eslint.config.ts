import baseConfig from '@repo/eslint-config/react-package';

export default [
  ...baseConfig,
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx', '**/__tests__/**/*'],
    rules: {
      'no-console': 'off',
      'vitest/no-conditional-expect': 'off',
      'vitest/no-conditional-in-test': 'off',
      'vitest/no-conditional-tests': 'off',
      'vitest/no-standalone-expect': 'off',
      'testing-library/render-result-naming-convention': 'off',
      'unused-imports/no-unused-vars': 'off',
    },
  },
  {
    files: ['src/**/*.ts', 'src/**/*.tsx'],
    rules: {
      'unused-imports/no-unused-vars': 'off', // Allow unused vars in source code
    },
  },
  {
    files: ['env.ts'],
    rules: {
      'no-console': 'off', // Allow console in env validation
    },
  },
];
