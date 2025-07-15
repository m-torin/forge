/**
 * ESLint configuration for generic TypeScript packages
 * Provides base configuration without React or Next.js specific rules
 */

import type { Linter } from "eslint";

import baseConfig from './index';

/*
 * This is a custom ESLint configuration for generic packages
 * that don't need React/Next.js/Server-specific configurations.
 */

const config: Linter.FlatConfig[] = [...baseConfig];

export default config;
