import { createConfig } from '@repo/eslint-config/package';

export default createConfig({
  files: ['**/*.mjs', '**/*.js'],
  ignores: ['dist/**', 'node_modules/**'],
  rules: {
    'no-console': 'off', // Allow console in MCP server
    'no-process-exit': 'off' // Allow process.exit in server
  }
});