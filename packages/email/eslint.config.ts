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
];

export default config;
