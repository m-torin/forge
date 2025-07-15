import type { Linter } from 'eslint';

import baseConfig from './index';

/*
 * This is a custom ESLint configuration for generic packages
 * that don't need React/Next.js/Server-specific configurations.
 */

const config: Linter.FlatConfig[] = [...baseConfig];

export default config;
