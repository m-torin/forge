import baseConfig from './src/index.mjs';

const config = [
  {
    ignores: ['README.md', 'index.d.ts', '**/*.md'],
  },
  ...baseConfig,
  // Disable pnpm rules for this package since it's the eslint config package itself
  {
    files: ['package.json'],
    rules: {
      'pnpm/json-enforce-catalog': 'off',
      'pnpm/json-valid-catalog': 'off',
      'pnpm/json-prefer-workspace-settings': 'off',
    },
  },
];

export default config;
