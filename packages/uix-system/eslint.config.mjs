import baseConfig from '@repo/eslint-config/react-package';

export default [
  ...baseConfig,
  {
    files: ['__tests__/**/*.{ts,tsx}'],
    rules: {
      'testing-library/no-node-access': 'off',
      'react/no-array-index-key': 'off',
    },
  },
  {
    files: ['src/**/*.stories.tsx', 'src/**/*.stories.ts'],
    rules: {
      'react/no-array-index-key': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/no-noninteractive-element-interactions': 'off',
      'react-hooks/exhaustive-deps': 'off',
    },
  },
];
