import packageConfig from '@repo/eslint-config/package';

const config = [
  ...packageConfig,
  {
    files: ['**/*.mjs', '**/*.js', '**/*.ts', '**/*.tsx'],
    ignores: ['dist/**', 'node_modules/**'],
    rules: {
      'no-console': 'off', // Allow console in MCP server
      'no-process-exit': 'off', // Allow process.exit in server
      'import/extensions': 'off', // Allow file extensions in MCP context
      '@typescript-eslint/no-non-null-assertion': 'off', // Allow ! operator
      'security/detect-non-literal-fs-filename': 'off', // Allow dynamic file paths
      'unused-imports/no-unused-vars': 'off', // Allow unused vars in utility code
    },
  },
];

export default config;
