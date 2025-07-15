import baseConfig from '@repo/eslint-config/react-package';

export default [
  ...baseConfig,
  {
    ignores: ['node_modules/', 'dist/', 'coverage/', '.turbo/', 'stories/', '__tests__/'],
  },
];
