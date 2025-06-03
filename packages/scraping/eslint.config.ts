import baseConfig from '@repo/eslint-config/package';

export default [
  ...baseConfig,
  {
    ignores: ['README.md'],
  },
];
