// @ts-ignore - eslint doesn't have type definitions
import { Linter } from 'eslint';

// eslint.config.ts
import reactConfig from '@repo/eslint-config/react-package';

const config: Linter.FlatConfig[] = [
  ...reactConfig,
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
    },
  },
];

export default config;
