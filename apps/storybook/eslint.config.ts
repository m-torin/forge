import reactPackageConfig from '@repo/eslint-config/react-package';
import storybookPlugin from 'eslint-plugin-storybook';

const config: any[] = [
  ...reactPackageConfig,
  // Storybook plugin config for story files
  {
    files: ['**/*.stories.{ts,tsx,js,jsx}'],
    plugins: {
      storybook: storybookPlugin,
    },
    rules: {
      'storybook/await-interactions': 'error',
      'storybook/context-in-play-function': 'error',
      'storybook/default-exports': 'error',
      'storybook/hierarchy-separator': 'warn',
      'storybook/no-redundant-story-name': 'error',
      'storybook/prefer-pascal-case': 'error',
      'storybook/story-exports': 'error',
      'storybook/use-storybook-testing-library': 'error',
      'import/no-default-export': 'off', // Storybook requires default exports
    },
  },
  {
    ignores: ['storybook-static/**', '.storybook/public/**', 'public/**', '**/*.md', '**/*.mdx'],
  },
];

export default config;
