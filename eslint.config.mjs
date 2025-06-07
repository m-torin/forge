import markdownPlugin from '@eslint/markdown';
import react from 'eslint-plugin-react';
import next from '@next/eslint-plugin-next';
import hooks from 'eslint-plugin-react-hooks';
import ts from 'typescript-eslint';

export default [
  {
    // Ignore directories
    ignores: ['**/.next', '**/node_modules', '**/dist', '**/storybook-static', '**/ios/Pods', '**/Pods'],
  },

  // Apply TypeScript recommended rules first
  ...ts.configs.recommended,
  {
    // Apply to TypeScript files (but NOT markdown code blocks)
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/*.md', '**/*.mdx', '**/*.md/**', '**/*.mdx/**'],
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
      // Disable problematic rules
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },

  // Add markdown plugin configuration
  ...markdownPlugin.configs.recommended,
  {
    files: ['**/*.md', '**/*.mdx'],
    language: 'markdown/gfm',
    processor: 'markdown/markdown',
    rules: {
      'markdown/fenced-code-language': 'warn',
      'markdown/no-duplicate-headings': 'warn',
      'markdown/no-html': 'off', // Allow HTML in markdown for this repo
    },
  },
  {
    files: ['**/*.md/*.{js,jsx,ts,tsx,mjs,cjs}', '**/*.mdx/*.{js,jsx,ts,tsx,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // Turn off ALL rules for markdown code blocks
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-array-constructor': 'off',
      '@typescript-eslint/no-duplicate-enum-values': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-extra-non-null-assertion': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-unnecessary-type-constraint': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-declaration-merging': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/prefer-as-const': 'off',
      '@typescript-eslint/prefer-namespace-keyword': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/unbound-method': 'off',

      // Disable React Next.js rules
      '@next/next/no-img-element': 'off',
      'react-hooks/exhaustive-deps': 'off',
      'react-hooks/rules-of-hooks': 'off',
      'react/jsx-key': 'off',
      'react/jsx-no-comment-textnodes': 'off',
      'react/jsx-no-duplicate-props': 'off',
      'react/jsx-no-target-blank': 'off',
      'react/jsx-no-undef': 'off',
      'react/jsx-uses-react': 'off',
      'react/jsx-uses-vars': 'off',
      'react/no-children-prop': 'off',
      'react/no-danger-with-children': 'off',
      'react/no-deprecated': 'off',
      'react/no-direct-mutation-state': 'off',
      'react/no-find-dom-node': 'off',
      'react/no-is-mounted': 'off',
      'react/no-render-return-value': 'off',
      'react/no-string-refs': 'off',
      'react/no-unescaped-entities': 'off',
      'react/no-unknown-property': 'off',
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/require-render-return': 'off',

      // Disable basic JS rules
      'constructor-super': 'off',
      'for-direction': 'off',
      'getter-return': 'off',
      'no-array-constructor': 'off',
      'no-async-promise-executor': 'off',
      'no-case-declarations': 'off',
      'no-class-assign': 'off',
      'no-compare-neg-zero': 'off',
      'no-cond-assign': 'off',
      'no-console': 'off',
      'no-const-assign': 'off',
      'no-constant-condition': 'off',
      'no-control-regex': 'off',
      'no-debugger': 'off',
      'no-delete-var': 'off',
      'no-dupe-args': 'off',
      'no-dupe-class-members': 'off',
      'no-dupe-else-if': 'off',
      'no-dupe-keys': 'off',
      'no-duplicate-case': 'off',
      'no-empty': 'off',
      'no-empty-character-class': 'off',
      'no-empty-pattern': 'off',
      'no-ex-assign': 'off',
      'no-extra-boolean-cast': 'off',
      'no-extra-semi': 'off',
      'no-fallthrough': 'off',
      'no-func-assign': 'off',
      'no-global-assign': 'off',
      'no-import-assign': 'off',
      'no-inner-declarations': 'off',
      'no-invalid-regexp': 'off',
      'no-irregular-whitespace': 'off',
      'no-loss-of-precision': 'off',
      'no-misleading-character-class': 'off',
      'no-mixed-spaces-and-tabs': 'off',
      'no-symbol': 'off',
      'no-nonoctal-decimal-escape': 'off',
      'no-obj-calls': 'off',
      'no-octal': 'off',
      'no-prototype-builtins': 'off',
      'no-redeclare': 'off',
      'no-regex-spaces': 'off',
      'no-self-assign': 'off',
      'no-setter-return': 'off',
      'no-shadow-restricted-names': 'off',
      'no-sparse-arrays': 'off',
      'no-this-before-super': 'off',
      'no-undef': 'off',
      'no-unexpected-multiline': 'off',
      'no-unreachable': 'off',
      'no-unsafe-finally': 'off',
      'no-unsafe-negation': 'off',
      'no-unsafe-optional-chaining': 'off',
      'no-unused-labels': 'off',
      'no-unused-vars': 'off',
      'no-useless-catch': 'off',
      'no-useless-escape': 'off',
      'no-with': 'off',
      'prefer-const': 'off',
      'require-yield': 'off',
      'use-isnan': 'off',
      'valid-typeof': 'off',
    },
  },
  // Add a new configuration to ignore TypeScript parsing for markdown files
  {
    files: ['**/*.md', '**/*.mdx'],
    ignores: ['**/*.md/**', '**/*.mdx/**'],
    languageOptions: {
      parserOptions: {
        project: false,
      },
    },
  },
];
