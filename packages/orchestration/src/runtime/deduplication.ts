import { isDevelopment } from '../utils/environment';
import { cleanupExpiredEntries, cleanupOldestEntries } from '../utils/helpers';
import { devLog } from '../utils/observability';
import { ENV_CONFIGS, type Environment } from '../utils/types';

import type { WorkflowContext } from '@upstash/workflow';

/**
 * Deduplication storage interface
 */
export interface DeduplicationStorage {
  processedIds: Map<string, number>;
  processedMessageIds: Map<string, number>;
}

/**
 * Function to extract unique ID from payload for deduplication
 */
export type IdExtractor<T = any> = (payload: T) => string | null | undefined;

/**
 * Base interface for payloads that support explicit deduplication
 */
export interface DeduplicablePayload {
  /** Explicit deduplication ID - highest priority for deduplication */
  dedupId?: string;
}

/**
 * Deduplication options
 */
export interface DeduplicationOptions<T = any> {
  /** Enable debug logging */
  debug?: boolean;
  /** Custom function to extract unique ID from payload */
  extractId?: IdExtractor<T>;
  /** Array of property paths to check for unique IDs (e.g., ['orderId', 'taskId', 'id']) */
  idFields?: string[];
  /** Maximum number of entries to keep in memory */
  maxEntries?: number;
  /** Skip all deduplication checks */
  skip?: boolean;
  /** Custom storage implementation */
  storage?: DeduplicationStorage;
  /** TTL for deduplication entries in milliseconds */
  ttl?: number;
}

/**
 * Get environment-specific configuration - ES2022 modernized
 */
function _getEnvConfig() {
  const env = (process.env.NODE_ENV as Environment) ?? 'development';
  return ENV_CONFIGS[env] ?? ENV_CONFIGS.development;
}

/**
 * @deprecated Use getEnvConfig() instead
 * Default configuration values
 */
export const DEDUPLICATION_CONFIG = {
  maxEntries: {
    development: 1000,
    production: 10000,
  },
  ttl: {
    development: 60 * 1000,
    production: 30 * 60 * 1000,
  },
} as const;

/**
 * @deprecated Use getEnvConfig() instead
 */
export const DEDUPLICATION_TTL = DEDUPLICATION_CONFIG.ttl;

/**
 * Global storage for development (should use Redis in production)
 */
let globalDevStorage: DeduplicationStorage | null = null;

/**
 * Get or create deduplication storage - ES2022 modernized
 */
export function getDeduplicationStorage(): DeduplicationStorage {
  const env = process.env.NODE_ENV as Environment;

  if (env === 'development' && !globalDevStorage) {
    globalDevStorage = {
      processedIds: new Map(),
      processedMessageIds: new Map(),
    };

    // Auto-cleanup in development using arrow function
    const cleanupInterval = setInterval(
      () => {
        globalDevStorage?.processedIds.clear();
        globalDevStorage?.processedMessageIds.clear();
        devLog.info('Cleared development storage');
      },
      5 * 60 * 1000,
    ); // 5 minutes

    // Cleanup interval on process exit
    process.once('beforeExit', () => clearInterval(cleanupInterval));
  }

  return (
    globalDevStorage ?? {
      processedIds: new Map(),
      processedMessageIds: new Map(),
    }
  );
}

/**
 * Extract QStash headers from workflow context
 */
export function getQStashHeaders(context: WorkflowContext<any>) {
  const headers = context.headers || {};

  let messageId: string | null = null;
  let retried = 0;
  let signature: string | null = null;

  // Try different ways to access headers
  if (typeof headers.get === 'function') {
    messageId =
      headers.get('upstash-message-id') ||
      headers.get('Upstash-Message-Id') ||
      headers.get('qstash-message-id');
    retried = parseInt(headers.get('upstash-retried') || '0', 10);
    signature = headers.get('upstash-signature');
  } else if (typeof headers === 'object' && headers !== null) {
    // Cast to any to allow indexing
    const h = headers as any;
    messageId = h['upstash-message-id'] || h['Upstash-Message-Id'] || h['qstash-message-id'];
    retried = parseInt(h['upstash-retried'] || '0', 10);
    signature = h['upstash-signature'];
  }

  return { messageId, retried, signature };
}

/**
 * Check if a workflow message is a duplicate
 */
export function isDuplicateMessage<T = any>(
  context: WorkflowContext<T>,
  options: DeduplicationOptions<T> = {},
): boolean {
  // Skip if deduplication is disabled
  if (options.skip || process.env.SKIP_WORKFLOW_DEDUPLICATION === 'true') {
    return false;
  }

  // Skip message-level deduplication in development when using QStash local
  // QStash local dev server reuses message IDs, causing false duplicates
  if (
    process.env.NODE_ENV === 'development' &&
    (process.env.QSTASH_URL?.includes('localhost') || process.env.QSTASH_URL?.includes('127.0.0.1'))
  ) {
    if (options.debug) {
      devLog.info('Skipping message-level deduplication in local development');
    }
    return false;
  }

  const storage = options.storage || getDeduplicationStorage();
  const { messageId } = getQStashHeaders(context);
  const debug = options.debug ?? (process.env.NODE_ENV as string) === 'development';

  if (!messageId) {
    if (debug) {
      devLog.info('No message ID found in headers');
    }
    return false;
  }

  // Check if we've seen this message before
  if (storage.processedMessageIds.has(messageId)) {
    if (debug) {
      devLog.info(`Message ${messageId} already processed`);
    }
    return true;
  }

  // Store the message ID
  storage.processedMessageIds.set(messageId, Date.now());

  // Cleanup old entries
  const ttl =
    options.ttl ||
    ((process.env.NODE_ENV as string) === 'development'
      ? DEDUPLICATION_CONFIG.ttl.development
      : DEDUPLICATION_CONFIG.ttl.production);
  cleanupExpiredEntries(storage.processedMessageIds, ttl, debug);

  // Cleanup oldest entries if exceeding max size
  const maxEntries =
    options.maxEntries ||
    ((process.env.NODE_ENV as string) === 'development'
      ? DEDUPLICATION_CONFIG.maxEntries.development
      : DEDUPLICATION_CONFIG.maxEntries.production);
  cleanupOldestEntries(storage.processedMessageIds, maxEntries, debug);

  return false;
}

/**
 * Extract unique ID from payload using various strategies
 *
 * Priority order:
 * 1. Custom extractId function (if provided)
 * 2. dedupId field (explicit deduplication ID)
 * 3. Fields from idFields array (default: ['orderId', 'taskId', 'id', 'uuid', 'workflowId'])
 *
 * @example
 * ```typescript
 * // Explicit dedupId (highest priority)
 * const payload1 = { dedupId: 'unique-123', orderId: 'order-456' };
 * extractUniqueId(payload1); // Returns 'unique-123'
 *
 * // Falls back to default fields
 * const payload2 = { taskId: 'task-789', orderId: 'order-456' };
 * extractUniqueId(payload2); // Returns 'order-456' (first in default array)
 *
 * // Custom fields
 * const payload3 = { customId: 'custom-123' };
 * extractUniqueId(payload3, { idFields: ['customId'] }); // Returns 'custom-123'
 * ```
 */
export function extractUniqueId<T = any>(
  payload: T,
  options: DeduplicationOptions<T> = {},
): string | null {
  // Use custom extractor if provided
  if (options.extractId) {
    const extracted = options.extractId(payload);
    return extracted || null;
  }

  // Check for explicit dedupId first (highest priority)
  if (payload && typeof payload === 'object') {
    const dedupId = (payload as any).dedupId;
    if (dedupId && typeof dedupId === 'string') {
      return dedupId;
    }
  }

  // Use specified ID fields (ordered by most common usage)
  const fieldsToCheck = options.idFields || [
    'orderId',
    'taskId',
    'imageId',
    'pipelineId',
    'id',
    'uuid',
    'workflowId',
  ];

  if (payload && typeof payload === 'object') {
    for (const field of fieldsToCheck) {
      const value = (payload as any)[field];
      if (value && typeof value === 'string') {
        return value;
      }
    }
  }

  return null;
}

/**
 * Check if an ID (order, task, etc.) is a duplicate
 */
export function isDuplicateId<T = any>(id: string, options: DeduplicationOptions<T> = {}): boolean {
  // Skip if deduplication is disabled
  if (!id || options.skip || process.env.SKIP_WORKFLOW_DEDUPLICATION === 'true') {
    return false;
  }

  // Skip payload-level deduplication in development
  // Development workflows often use auto-generated unique IDs that shouldn't be deduplicated
  if (
    (process.env.NODE_ENV as string) === 'development'
      ? process.env.SKIP_WORKFLOW_DEDUPLICATION !== 'false'
      : false
  ) {
    if (options.debug) {
      devLog.info(`Skipping payload-level deduplication in development for ID: ${id}`);
    }
    return false;
  }

  const storage = options.storage || getDeduplicationStorage();
  const debug = options.debug ?? (process.env.NODE_ENV as string) === 'development';

  // Check if we've seen this ID before
  if (storage.processedIds.has(id)) {
    if (debug) {
      devLog.info(`ID ${id} already processed`);
    }
    return true;
  }

  // Store the ID
  storage.processedIds.set(id, Date.now());

  if (debug) {
    devLog.info(`Added ID ${id} to cache. Size: ${storage.processedIds.size}`);
  }

  // Cleanup old entries
  const ttl =
    options.ttl ||
    ((process.env.NODE_ENV as string) === 'development'
      ? DEDUPLICATION_CONFIG.ttl.development
      : DEDUPLICATION_CONFIG.ttl.production);
  cleanupExpiredEntries(storage.processedIds, ttl, debug);

  // Cleanup oldest entries if exceeding max size
  const maxEntries =
    options.maxEntries ||
    ((process.env.NODE_ENV as string) === 'development'
      ? DEDUPLICATION_CONFIG.maxEntries.development
      : DEDUPLICATION_CONFIG.maxEntries.production);
  cleanupOldestEntries(storage.processedIds, maxEntries, debug);

  return false;
}

/**
 * Deduplication handler for workflows
 * Returns early if duplicate is detected
 *
 * @example
 * ```typescript
 * // Using explicit dedupId (recommended approach)
 * const payload = { dedupId: 'unique-workflow-123', data: {...} };
 * await withDeduplication(context, handler);
 *
 * // Using default field checking (orderId, taskId, id, uuid, workflowId)
 * await withDeduplication(context, handler);
 *
 * // Using custom field names
 * await withDeduplication(context, handler, {
 *   idFields: ['customId', 'transactionId']
 * });
 *
 * // Using custom extractor function
 * await withDeduplication(context, handler, {
 *   extractId: (payload) => payload.user?.id + '-' + payload.action
 * });
 * ```
 */
export async function withDeduplication<T = any>(
  context: WorkflowContext<T>,
  handler: () => Promise<any>,
  options: DeduplicationOptions<T> = {},
): Promise<any> {
  // Check for duplicate QStash message first
  if (isDuplicateMessage(context, options)) {
    const messageId = getQStashHeaders(context).messageId;
    if (options.debug) {
      devLog.info(`Skipping workflow due to duplicate message: ${messageId}`);
    }
    return {
      messageId,
      reason: 'duplicate_message',
      status: 'skipped',
    };
  }

  // Check for duplicate payload ID using flexible extraction
  const uniqueId = extractUniqueId(context.requestPayload, options);
  if (uniqueId && isDuplicateId(uniqueId, options)) {
    if (options.debug) {
      devLog.info(`Skipping workflow due to duplicate ID: ${uniqueId}`);
    }
    return {
      id: uniqueId,
      reason: 'duplicate_id',
      status: 'skipped',
    };
  }

  // Execute the handler
  return handler();
}

// Re-export from centralized id-generation module
export { generateDedupId } from '../utils/id-generation';

/**
 * Clear all deduplication caches (development only)
 */
export function clearDeduplicationCache(): void {
  if (!isDevelopment()) {
    throw new Error('Cache clearing is only available in development');
  }

  const storage = getDeduplicationStorage();
  storage.processedIds.clear();
  storage.processedMessageIds.clear();
  devLog.info('Cleared all caches');
}
