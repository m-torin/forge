import mcpToolsConfig from '@repo/eslint-config/mcp-tools';
import type { Linter } from 'eslint';

const config: Linter.FlatConfig[] = [
  ...mcpToolsConfig,
  {
    files: ['**/*.mjs', '**/*.js', '**/*.ts', '**/*.tsx'],
    ignores: ['dist/**', 'node_modules/**'],
    rules: {
      // Allow file extensions in MCP context for dynamic imports
      'import/extensions': 'off',
      // Allow ! operator for validated data after zod parsing
      '@typescript-eslint/no-non-null-assertion': 'off',
      // Allow unused vars in utility code that provides comprehensive APIs
      'unused-imports/no-unused-vars': 'off',
    },
  },
];

export default config;
