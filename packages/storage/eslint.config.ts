// eslint.config.ts
import serverConfig from '@repo/eslint-config/server';

import { Linter } from 'eslint';

const config: Linter.FlatConfig[] = serverConfig;

export default config;
