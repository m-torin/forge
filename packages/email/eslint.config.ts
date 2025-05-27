// eslint.config.ts
import reactConfig from '@repo/eslint-config/react-package';

import type { Linter } from '@repo/eslint-config/types';

const config: Linter.FlatConfig[] = reactConfig;

export default config;
