// eslint.config.ts
import serverConfig from '@repo/eslint-config/server';
import type { Linter } from 'eslint';

const config: Linter.FlatConfig[] = serverConfig;

export default config;
