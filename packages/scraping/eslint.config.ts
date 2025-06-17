import baseConfig from '@repo/eslint-config/package';

export default [
  ...baseConfig,
  {
    rules: {
      'import/extensions': 'off',
    },
  },
];
