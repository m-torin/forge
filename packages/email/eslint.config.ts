// eslint.config.ts
import reactConfig from '@repo/eslint-config/react-package';

import { Linter } from '@repo/eslint-config/types';

const config: Linter.FlatConfig[] = [
  ...reactConfig,
  {
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
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
      'testing-library/render-result-naming-convention': 'off',
      'promise/param-names': 'off',
    },
  },
  {
    ignores: ['**/*.disabled'],
  },
];

export default config;
