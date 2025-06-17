// @ts-ignore - eslint doesn't have type definitions
import { Linter } from 'eslint';

// eslint.config.ts
import reactConfig from '@repo/eslint-config/react-package';

const config: Linter.FlatConfig[] = reactConfig;

export default config;
