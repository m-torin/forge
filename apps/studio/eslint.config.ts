// eslint.config.ts
import serverConfig from '@repo/eslint-config/server';

// Override the server config to disable the problematic rule
const config = [
  ...serverConfig,
  {
    rules: {
      'node/no-deprecated-api': 'off', // Disable this rule due to compatibility issues with ESLint v9
    },
  },
];

export default config;
