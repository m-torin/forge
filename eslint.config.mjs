import react from 'eslint-plugin-react';
import next from '@next/eslint-plugin-next';
import hooks from 'eslint-plugin-react-hooks';
import ts from 'typescript-eslint';

export default [
  {
    // Ignore directories
    ignores: ['**/.next', '**/node_modules', '**/dist', '**/storybook-static'],
  },
  // Apply TypeScript recommended rules
  ...ts.configs.recommended,
  {
    // Apply to TypeScript files
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: ts.parser,
      parserOptions: {
        project: true,
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    // Configure plugins
    plugins: {
      react,
      '@next/next': next,
      'react-hooks': hooks,
    },
    // Configure rules
    rules: {
      // React rules
      ...react.configs['jsx-runtime'].rules,
      // React hooks rules
      ...hooks.configs.recommended.rules,
      // Next.js rules
      ...next.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,
      // Custom rules
      '@next/next/no-img-element': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
];
