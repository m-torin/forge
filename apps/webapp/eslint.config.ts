import nextConfig from '@repo/eslint-config/next';

const config = [
  ...nextConfig,
  {
    ignores: ['**/*.md', '**/*.mdx'],
  },
  {
    files: ['archive/**/*.{ts,tsx,js,jsx}'],
    rules: {
      'no-console': 'off',
    },
  },
];

export default config;
