/**
 * ESLint configuration for generic TypeScript packages
 * Provides base configuration without React or Next.js specific rules
 */

import baseConfig from './index.mjs';

/*
 * This is a custom ESLint configuration for generic packages
 * that don't need React/Next.js/Server-specific configurations.
 */

const config = [...baseConfig];

export default config;
