import tsParser from '@typescript-eslint/parser';
import type { Linter } from 'eslint';
import noSecretsPlugin from 'eslint-plugin-no-secrets';
import regexpPlugin from 'eslint-plugin-regexp';

import baseServer from './server';
import { SEVERITY, type RulesRecord } from './types/config';

/*
 * Enhanced ESLint configuration for MCP (Model Context Protocol) utilities
 *
 * This configuration provides security-focused rules specifically designed for
 * MCP tooling that handles dynamic code execution, file operations, and user input.
 *
 * Security focus areas:
 * - Dynamic code execution hardening
 * - File system operation safety
 * - Regular expression DoS prevention
 * - Worker thread coordination safety
 * - Memory management and cleanup
 * - Import/module security
 *
 * Based on comprehensive security audit findings and Node.js 22+ best practices.
 */

// File patterns for MCP utilities - include both absolute and relative paths
const MCP_TOOLS_PATTERNS = [
  'packages/mcp-utils/**/*.{ts,tsx,js,mjs,cjs}',
  'src/**/*.{ts,tsx,js,mjs,cjs}', // Relative paths when running from within mcp-utils
  'bin/**/*.{ts,tsx,js,mjs,cjs}', // Include binary files
  '**/*.{ts,tsx,js,mjs,cjs}', // Fallback for any context
];

// Files that are whitelisted for hardened VM usage (contain proper sandboxing)
const VM_WHITELISTED_FILES = [
  'packages/mcp-utils/src/tools/file-streaming.ts',
  'packages/mcp-utils/src/tools/streaming-utilities.ts',
  'src/tools/file-streaming.ts', // Relative path
  'src/tools/streaming-utilities.ts', // Relative path
  'packages/mcp-utils/src/tools/performance-observer.ts',
  'src/tools/performance-observer.ts', // Relative path
];

/**
 * Security-focused rules for MCP utilities
 * Prevents the 7 categories of vulnerabilities identified in security audit:
 * 1. Dynamic code execution vulnerabilities
 * 2. File system security issues
 * 3. Regex DoS vulnerabilities
 * 4. Worker thread coordination issues
 * 5. AbortSignal usage inconsistencies
 * 6. Memory management problems
 * 7. Import/module security issues
 */
const createMCPSecurityRules = (): RulesRecord => ({
  // === Dynamic Code Execution Security ===
  'no-eval': SEVERITY.ERROR,
  'no-new-func': SEVERITY.ERROR,
  'no-implied-eval': SEVERITY.ERROR,

  // === File System Security ===
  'security/detect-non-literal-fs-filename': SEVERITY.ERROR,
  'security/detect-non-literal-require': SEVERITY.ERROR,

  // === Import/Module Security ===
  'no-restricted-imports': [
    SEVERITY.ERROR,
    {
      paths: [
        {
          name: 'vm',
          message:
            'Use approved sandbox wrapper with security hardening only. Direct vm usage is prohibited for security.',
        },
        {
          name: 'child_process',
          message: 'Child process spawning is not permitted in MCP tools for security reasons.',
        },
        {
          name: 'fs',
          message:
            'Use centralized file helpers in utils/files.ts with path validation instead of direct fs access.',
        },
        {
          name: 'node:fs',
          message:
            'Use centralized file helpers in utils/files.ts with path validation instead of direct fs access.',
        },
        {
          name: 'fs/promises',
          message:
            'Use centralized file helpers in utils/files.ts with path validation instead of direct fs access.',
        },
        {
          name: 'node:fs/promises',
          message:
            'Use centralized file helpers in utils/files.ts with path validation instead of direct fs access.',
        },
      ],
    },
  ],

  // === Restricted Syntax Patterns ===
  'no-restricted-syntax': [
    SEVERITY.ERROR,
    // Dynamic RegExp construction (ReDoS prevention)
    {
      selector:
        'NewExpression[callee.name="RegExp"][arguments.length>0]:not(NewExpression[arguments.0.type="Literal"])',
      message:
        'Dynamic RegExp construction can lead to ReDoS attacks. Use literal patterns or safe glob/pattern utilities like fast-glob or picomatch.',
    },
    {
      selector:
        'CallExpression[callee.name="RegExp"][arguments.length>0]:not(CallExpression[arguments.0.type="Literal"])',
      message:
        'Dynamic RegExp construction can lead to ReDoS attacks. Use literal patterns or safe glob/pattern utilities like fast-glob or picomatch.',
    },
    // Blocking Atomics.wait (prevents main thread blocking)
    {
      selector: 'CallExpression[callee.object.name="Atomics"][callee.property.name="wait"]',
      message:
        'Atomics.wait blocks the main thread. Use async coordination with Atomics.waitAsync, worker events, or Promise-based patterns.',
    },
    // VM usage restriction (only in whitelisted hardened wrappers)
    {
      selector: 'CallExpression[callee.object.name="vm"][callee.property.name="runInNewContext"]',
      message:
        'vm.runInNewContext is only allowed in hardened sandbox wrappers with proper security measures. Use approved sandboxing utilities.',
    },
    {
      selector: 'CallExpression[callee.object.name="vm"][callee.property.name="runInThisContext"]',
      message:
        'vm.runInThisContext provides no isolation and is prohibited. Use vm.runInNewContext with proper hardening if code execution is needed.',
    },
    // Dangerous global access patterns
    {
      selector:
        'MemberExpression[object.name="process"][property.name="env"]:not(MemberExpression[object.object.name="process"][object.property.name="env"])',
      message:
        'Direct process.env access should use centralized environment configuration with validation.',
    },
  ],

  // === Regular Expression Security ===
  'regexp/strict': SEVERITY.ERROR,
  'regexp/no-super-linear-backtracking': SEVERITY.ERROR,
  'regexp/no-empty-lookarounds-assertion': SEVERITY.ERROR,
  'regexp/optimal-quantifier-concatenation': SEVERITY.ERROR,
  'regexp/prefer-predefined-assertion': SEVERITY.WARN,
  'regexp/use-ignore-case': SEVERITY.WARN,

  // === Additional Security Rules ===
  'security/detect-unsafe-regex': SEVERITY.ERROR,
  'security/detect-child-process': SEVERITY.ERROR,
  'security/detect-eval-with-expression': SEVERITY.ERROR,
  'security/detect-possible-timing-attacks': SEVERITY.WARN,
  'security/detect-pseudoRandomBytes': SEVERITY.WARN,

  // === Secrets Detection (Optional but Recommended) ===
  'no-secrets/no-secrets': [
    SEVERITY.WARN,
    {
      tolerance: 4.2,
      additionalRegexes: {
        'API Key': 'api[_-]?key[_-]?[=:]?[\\s]?[\'"]?([a-zA-Z0-9]{16,})[\'"]?',
        'JWT Token': 'ey[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}\\.[A-Za-z0-9_-]{10,}',
        'Database URL': '(mongodb|mysql|postgres|sqlite)://[^\\s]+',
      },
    },
  ],

  // === Promise and Async Safety ===
  'promise/no-callback-in-promise': SEVERITY.ERROR,
  'promise/no-nesting': SEVERITY.ERROR,
  'promise/catch-or-return': SEVERITY.ERROR,
  'promise/always-return': SEVERITY.ERROR,

  // === Memory and Resource Management ===
  'no-unreachable-loop': SEVERITY.ERROR,
  'no-promise-executor-return': SEVERITY.ERROR,

  // Note: Server-side specific rules (no-console, no-process-exit) are handled in main config
});

// Main configuration array
const config: Linter.FlatConfig[] = [
  // Start with base server configuration
  ...baseServer,

  // Override with MCP-specific security configuration
  {
    files: MCP_TOOLS_PATTERNS,
    plugins: {
      regexp: regexpPlugin,
      'no-secrets': noSecretsPlugin,
    },
    rules: {
      // Inherit all base security rules
      ...createMCPSecurityRules(),
      // Explicitly override base server rules for MCP context
      'no-console': 'off', // Allow console in MCP server context
      'no-process-exit': 'off', // Allow controlled exits in server context
    },
  },

  // Add type-aware rules only for source files (not test/config files)
  {
    files: ['src/**/*.{ts,tsx}', 'packages/mcp-utils/src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': SEVERITY.ERROR,
    },
  },

  // Whitelist for hardened VM usage files
  // These files contain proper sandboxing with security measures like:
  // - Context isolation and hardening
  // - Timeout enforcement
  // - Memory limits
  // - Dangerous pattern validation
  // - Prototype freezing
  {
    files: VM_WHITELISTED_FILES,
    rules: {
      // Allow controlled VM usage in hardened wrappers
      'no-restricted-syntax': 'off',
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'child_process',
              message: 'Child process spawning is not permitted in MCP tools for security reasons.',
            },
            // Still restrict fs - even hardened VM files should use centralized helpers
            {
              name: 'fs',
              message: 'Use centralized file helpers in utils/files.ts with path validation.',
            },
            {
              name: 'node:fs',
              message: 'Use centralized file helpers in utils/files.ts with path validation.',
            },
          ],
        },
      ],
    },
  },

  // Whitelist for centralized file utilities
  // This file contains validated file operations and is the approved place for fs usage
  {
    files: [
      'packages/mcp-utils/src/utils/files.ts',
      'src/utils/files.ts', // Relative path when running from mcp-utils directory
      '**/utils/files.ts', // Fallback pattern
    ],
    rules: {
      // Allow fs usage in centralized file utilities (with validation)
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'child_process',
              message: 'Child process spawning is not permitted in MCP tools for security reasons.',
            },
            {
              name: 'vm',
              message:
                'Use approved sandbox wrapper with security hardening only. Direct vm usage is prohibited for security.',
            },
          ],
        },
      ],
      // Allow dynamic file paths in the centralized file utilities (they implement validation)
      'security/detect-non-literal-fs-filename': 'off',
    },
  },

  // Whitelist for config files where process.env access is legitimate
  {
    files: [
      '**/*.config.{ts,js,mjs}',
      '**/vitest.config.{ts,js,mjs}',
      '**/vite.config.{ts,js,mjs}',
      '**/tsup.config.{ts,js,mjs}',
    ],
    rules: {
      // Allow direct process.env access in configuration files
      'no-restricted-syntax': 'off',
    },
  },

  // Whitelist for streaming utilities where promise executor returns are used for streaming patterns
  {
    files: [
      'packages/mcp-utils/src/tools/file-streaming.ts',
      'packages/mcp-utils/src/tools/streaming-utilities.ts',
      'packages/mcp-utils/src/utils/streams.ts',
      'packages/mcp-utils/src/utils/stringify.ts',
      'packages/mcp-utils/src/tools/safe-stringify.ts',
      'packages/mcp-utils/src/tools/async-logger.ts',
      'packages/mcp-utils/src/tools/batch-processor.ts',
      'packages/mcp-utils/src/tools/performance-observer.ts',
      'packages/mcp-utils/src/tools/report-generator.ts',
      'packages/mcp-utils/src/tools/security-scanner.ts',
      'packages/mcp-utils/src/tools/worker-threads.ts',
      'packages/mcp-utils/src/utils/error-handling.ts',
      'packages/mcp-utils/src/utils/files.ts',
      'packages/mcp-utils/src/utils/logger.ts',
      'packages/mcp-utils/src/utils/performance.ts',
      'packages/mcp-utils/src/utils/retry.ts',
      'packages/mcp-utils/src/utils/structured-clone.ts',
      'src/tools/file-streaming.ts',
      'src/tools/streaming-utilities.ts',
      'src/utils/streams.ts',
      'src/utils/stringify.ts',
      'src/tools/safe-stringify.ts',
      'src/tools/async-logger.ts',
      'src/tools/batch-processor.ts',
      'src/tools/performance-observer.ts',
      'src/tools/report-generator.ts',
      'src/tools/security-scanner.ts',
      'src/tools/worker-threads.ts',
      'src/utils/error-handling.ts',
      'src/utils/files.ts',
      'src/utils/logger.ts',
      'src/utils/performance.ts',
      'src/utils/retry.ts',
      'src/utils/structured-clone.ts',
      '__tests__/**/*.test.ts', // Allow in test files as well
    ],
    rules: {
      // Allow promise executor returns in streaming patterns where they're used for stream control
      'no-promise-executor-return': 'off',
    },
  },
];

export default config;
