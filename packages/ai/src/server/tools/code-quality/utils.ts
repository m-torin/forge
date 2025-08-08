/**
 * Shared utilities for code quality tools
 */

import { BoundedCache } from '@repo/mcp-utils';
import { logError, logInfo } from '@repo/observability';
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

// Re-export utilities from MCP utils package
// These are now centralized in the MCP utils package and should be used via MCP tools
// in agents. For TypeScript code, we can import directly from the package.
export { createEntityName, extractObservation, safeStringify } from '@repo/mcp-utils';
export { BoundedCache };

/**
 * Check if a module is a built-in Node.js module
 */
export function isBuiltinModule(packageName: string): boolean {
  const builtins = [
    'fs',
    'path',
    'os',
    'crypto',
    'http',
    'https',
    'url',
    'querystring',
    'util',
    'events',
    'stream',
    'buffer',
    'process',
    'child_process',
    'cluster',
    'dgram',
    'dns',
    'net',
    'tls',
    'zlib',
    'assert',
    'console',
    'constants',
    'domain',
    'module',
    'punycode',
    'readline',
    'repl',
    'string_decoder',
    'timers',
    'tty',
    'v8',
    'vm',
    'worker_threads',
  ];
  return builtins.includes(packageName) || packageName.startsWith('node:');
}

/**
 * Common ignore patterns for file discovery
 */
export const COMMON_IGNORE_PATTERNS = [
  'node_modules/**',
  'dist/**',
  '.next/**',
  'build/**',
  'coverage/**',
  '.git/**',
  '*.min.js',
  '*.min.css',
  '.cache/**',
  'tmp/**',
  'temp/**',
];

/**
 * Source file extensions
 */
export const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];

/**
 * Test file patterns
 */
export const TEST_FILE_PATTERNS = [
  '**/*.test.{ts,tsx,js,jsx}',
  '**/*.spec.{ts,tsx,js,jsx}',
  '**/__tests__/**/*.{ts,tsx,js,jsx}',
  '**/test/**/*.{ts,tsx,js,jsx}',
];

/**
 * Find files recursively with filtering
 */
export async function findFiles(
  dir: string,
  options: {
    extensions?: string[];
    ignorePatterns?: string[];
    maxDepth?: number;
  } = {},
): Promise<string[]> {
  const {
    extensions = SOURCE_EXTENSIONS,
    ignorePatterns = ['node_modules', 'dist', '.next', 'build', 'coverage', '.git'],
    maxDepth = 10,
  } = options;

  const files: string[] = [];

  async function walk(currentDir: string, depth: number = 0): Promise<void> {
    if (depth > maxDepth) return;

    try {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      const entries = await readdir(currentDir);

      for (const entry of entries) {
        if (ignorePatterns.some(pattern => entry.includes(pattern))) continue;

        const fullPath = join(currentDir, entry);
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          await walk(fullPath, depth + 1);
        } else if (extensions.some(ext => entry.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    } catch (_error) {
      // Skip directories we can't read
    }
  }

  await walk(dir);
  return files;
}

/**
 * Batch process items with concurrency control
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  options: {
    batchSize?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {},
): Promise<R[]> {
  const { batchSize = 20, onProgress } = options;
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);

    if (onProgress) {
      onProgress(Math.min(i + batchSize, items.length), items.length);
    }
  }

  return results;
}

export async function processInBatches<T>(
  items: T[],
  processor: (item: T) => Promise<void>,
  options: {
    batchSize?: number;
    delayMs?: number;
  } = {},
): Promise<void> {
  const { batchSize = 20, delayMs = 10 } = options;

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map(processor));

    // Small delay to prevent overwhelming the system
    if (i + batchSize < items.length && delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

/**
 * Retry async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    factor?: number;
  } = {},
): Promise<T> {
  const { maxRetries = 3, initialDelay = 100, maxDelay = 5000, factor = 2 } = options;

  let lastError: Error = new Error('Operation failed after retries');
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * factor, maxDelay);
      }
    }
  }

  throw lastError;
}

/**
 * Create a simple in-memory cache
 * @deprecated Use BoundedCache from @repo/mcp-utils instead for better analytics and features
 */
export function createCache<T>(ttl: number = 5 * 60 * 1000) {
  // Use BoundedCache for new implementations
  return new BoundedCache({
    maxSize: 100,
    ttl: ttl,
    enableAnalytics: true,
  });
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format duration in milliseconds to human readable string
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`;
}

/**
 * Extract package name from import path
 */
export function extractPackageName(importPath: string): string {
  if (importPath.startsWith('@')) {
    // Scoped package
    const parts = importPath.split('/');
    return parts.slice(0, 2).join('/');
  }

  // Regular package
  return importPath.split('/')[0];
}

/**
 * Check if path is relative
 */
export function isRelativePath(path: string): boolean {
  return path.startsWith('.') || path.startsWith('@/');
}

/**
 * Common modules that should be centralized in @repo/qa
 */
export const CENTRALIZED_MOCK_MODULES = [
  'posthog-js',
  'posthog-node',
  '@repo/observability',
  '@repo/analytics',
  'server-only',
  'next/navigation',
  'next/headers',
  '@upstash/redis',
  '@upstash/ratelimit',
  '@sentry/nextjs',
  'stripe',
  '@better-auth/client',
  '@prisma/client',
  'node-fetch',
  'axios',
  'sharp',
  'nodemailer',
  '@aws-sdk/client-s3',
  'openai',
  'anthropic',
];

/**
 * Progress reporter interface
 */
export interface ProgressReporter {
  start(total: number, message?: string): void;
  update(current: number, message?: string): void;
  complete(message?: string): void;
  error(message: string): void;
}

/**
 * Create a simple console progress reporter
 */
export function createProgressReporter(): ProgressReporter {
  let startTime: number;
  let total: number;

  return {
    start(count: number, message?: string) {
      startTime = Date.now();
      total = count;
      logInfo(`📊 ${message || 'Starting'} (${count} items)`);
    },

    update(current: number, message?: string) {
      const percent = Math.round((current / total) * 100);
      const elapsed = Date.now() - startTime;
      logInfo(
        `⏳ Progress: ${current}/${total} (${percent}%) - ${formatDuration(elapsed)} ${message || ''}`,
      );
    },

    complete(message?: string) {
      const elapsed = Date.now() - startTime;
      logInfo(`✅ ${message || 'Complete'} - ${formatDuration(elapsed)}`);
    },

    error(message: string) {
      logError(`❌ Error: ${message}`);
    },
  };
}
