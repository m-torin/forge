// eslint.config.ts
import serverConfig from '@repo/eslint-config/server';

import { Linter } from 'eslint';

const config: Linter.FlatConfig[] = [
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
      'vitest/valid-title': 'off',
      'promise/param-names': 'off',
    },
  },
];

export default config;
