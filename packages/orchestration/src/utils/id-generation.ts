/**
 * Centralized ID generation utilities
 * Single source of truth for all ID generation in the orchestration package
 */

import { cryptoPolyfill } from './crypto-polyfill';

/**
 * Configuration options for ID generation
 */
export interface IdGenerationOptions {
  /** Whether to include timestamp in the ID */
  includeTimestamp?: boolean;
  /** Length of random suffix (default: 7) */
  length?: number;
  /** Additional parts to include in the ID */
  parts?: (string | number)[];
  /** Prefix to prepend to the ID */
  prefix?: string;
  /** Separator character between ID parts */
  separator?: string;
}

/**
 * Generate a unique ID with configurable options
 *
 * @example
 * ```typescript
 * // Basic ID
 * generateId() // "1234567890_abc123"
 *
 * // With prefix
 * generateId({ prefix: 'user' }) // "user_1234567890_abc123"
 *
 * // Without timestamp
 * generateId({ prefix: 'task', includeTimestamp: false }) // "task_abc123"
 *
 * // With custom parts
 * generateId({ prefix: 'order', parts: ['US', 'CA'] }) // "order_1234567890_US_CA_abc123"
 *
 * // With custom separator
 * generateId({ prefix: 'event', separator: '-' }) // "event-1234567890-abc123"
 * ```
 */
export function generateId(options: IdGenerationOptions = {}): string {
  const { includeTimestamp = true, length = 7, parts = [], prefix, separator = '_' } = options;

  const components: (string | number)[] = [];

  // Add prefix if provided
  if (prefix) {
    components.push(prefix);
  }

  // Add timestamp if requested
  if (includeTimestamp) {
    components.push(Date.now());
  }

  // Add any custom parts
  components.push(...parts);

  // Generate random suffix
  const randomSuffix = Math.random()
    .toString(36)
    .substring(2, 2 + length);
  components.push(randomSuffix);

  return components.filter(Boolean).join(separator);
}

/**
 * Generate a unique ID with optional prefix (backward compatible)
 * @deprecated Use generateId() instead
 */
export function generateUniqueId(prefix?: string): string {
  return generateId({ prefix });
}

/**
 * Generate a session ID with configurable prefix (backward compatible)
 * @deprecated Use generateId() instead
 */
export function generateSessionId(prefix = 'session'): string {
  return generateId({ prefix });
}

/**
 * Generate a deduplication ID (backward compatible)
 * @deprecated Use generateId() instead
 */
export function generateDedupId(prefix?: string, includeTimestamp = true): string {
  return generateId({
    includeTimestamp,
    prefix: prefix || 'dedup',
  });
}

/**
 * Generate a deterministic ID based on input data
 * Useful for creating consistent IDs for the same input
 */
export function generateDeterministicId(data: string | object, prefix?: string): string {
  const input = typeof data === 'string' ? data : JSON.stringify(data);
  const hash = cryptoPolyfill.createHash('md5').update(input).digest('hex').substring(0, 8);

  return prefix ? `${prefix}_${hash}` : hash;
}

/**
 * Generate a namespaced key (useful for cache keys, storage keys, etc.)
 */
export function generateKey(prefix: string, ...parts: (string | number)[]): string {
  return [prefix, ...parts].filter(Boolean).join(':');
}

/**
 * Generate a short unique ID (no timestamp, shorter random part)
 * Useful for user-facing IDs
 */
export function generateShortId(prefix?: string, length = 6): string {
  return generateId({
    includeTimestamp: false,
    length,
    prefix,
  });
}

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  return cryptoPolyfill.randomUUID();
}
