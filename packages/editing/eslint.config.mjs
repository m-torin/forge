import baseConfig from '@repo/eslint-config/react-package';

export default [
  ...baseConfig,
  {
    ignores: ['node_modules/', 'coverage/', '.turbo/', '__tests__/'],
  },
];
