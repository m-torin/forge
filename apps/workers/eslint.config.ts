import nextConfig from '@repo/eslint-config/next';

export default [
  ...nextConfig,
  {
    ignores: [
      // Ignore markdown files to prevent TypeScript project issues
      '**/*.md',
      '**/*.mdx',
    ],
  },
  {
    // Disable TypeScript project checking for markdown code blocks
    files: ['**/*.md/*.{js,jsx,ts,tsx,mjs,cjs}', '**/*.mdx/*.{js,jsx,ts,tsx,mjs,cjs}'],
    languageOptions: {
      parserOptions: {
        project: false, // Disable project-wide type checking for markdown code blocks
      },
    },
  },
  {
    // Disable TypeScript project checking for e2e files
    files: ['e2e/**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: false, // Disable project-wide type checking for e2e files
      },
    },
  },
];
