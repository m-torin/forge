// package.ts
import baseConfig from './index.js';

import type { Linter } from 'eslint';

/*
 * This is a custom ESLint configuration for generic packages
 * that don't need React/Next.js/Server-specific configurations.
 */

const config: Linter.FlatConfig[] = [...baseConfig];

export default config;
