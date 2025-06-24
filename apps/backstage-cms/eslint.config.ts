import nextConfig from '@repo/eslint-config/next';

const config = [
  ...nextConfig,
  {
    ignores: ['**/*.md', '**/*.mdx'],
  },
];

export default config;
