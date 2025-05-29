import type { WorkflowContext } from '@upstash/workflow';

/**
 * Deduplication storage interface
 */
export interface DeduplicationStorage {
  processedIds: Map<string, number>;
  processedMessageIds: Map<string, number>;
}

/**
 * Deduplication options
 */
export interface DeduplicationOptions {
  /** Enable debug logging */
  debug?: boolean;
  /** Skip all deduplication checks */
  skip?: boolean;
  /** Custom storage implementation */
  storage?: DeduplicationStorage;
  /** TTL for deduplication entries in milliseconds */
  ttl?: number;
}

/**
 * Default TTLs for different environments
 */
export const DEDUPLICATION_TTL = {
  development: 60 * 1000, // 1 minute
  production: 30 * 60 * 1000, // 30 minutes
} as const;

/**
 * Global storage for development (should use Redis in production)
 */
let globalDevStorage: DeduplicationStorage | null = null;

/**
 * Get or create deduplication storage
 */
export function getDeduplicationStorage(): DeduplicationStorage {
  if (process.env.NODE_ENV === 'development' && !globalDevStorage) {
    globalDevStorage = {
      processedIds: new Map(),
      processedMessageIds: new Map(),
    };

    // Auto-cleanup in development
    setInterval(
      () => {
        if (globalDevStorage) {
          globalDevStorage.processedIds.clear();
          globalDevStorage.processedMessageIds.clear();
          console.log('[DEDUP] Cleared development storage');
        }
      },
      5 * 60 * 1000,
    ); // 5 minutes
  }

  return (
    globalDevStorage || {
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
 * Clean up expired entries from a map
 */
function cleanupExpiredEntries(map: Map<string, number>, ttl: number, debug = false): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [id, timestamp] of map.entries()) {
    if (now - timestamp > ttl) {
      map.delete(id);
      cleaned++;
    }
  }

  if (debug && cleaned > 0) {
    console.log(`[DEDUP] Cleaned up ${cleaned} expired entries`);
  }
}

/**
 * Check if a workflow message is a duplicate
 */
export function isDuplicateMessage(
  context: WorkflowContext<any>,
  options: DeduplicationOptions = {},
): boolean {
  // Skip if deduplication is disabled
  if (options.skip || process.env.SKIP_WORKFLOW_DEDUPLICATION === 'true') {
    return false;
  }

  const storage = options.storage || getDeduplicationStorage();
  const { messageId } = getQStashHeaders(context);
  const debug = options.debug ?? process.env.NODE_ENV === 'development';

  if (!messageId) {
    if (debug) {
      console.log('[DEDUP] No message ID found in headers');
    }
    return false;
  }

  // Check if we've seen this message before
  if (storage.processedMessageIds.has(messageId)) {
    if (debug) {
      console.log(`[DEDUP] Message ${messageId} already processed`);
    }
    return true;
  }

  // Store the message ID
  storage.processedMessageIds.set(messageId, Date.now());

  // Cleanup old entries
  const ttl =
    options.ttl ||
    (process.env.NODE_ENV === 'development'
      ? DEDUPLICATION_TTL.development
      : DEDUPLICATION_TTL.production);
  cleanupExpiredEntries(storage.processedMessageIds, ttl, debug);

  return false;
}

/**
 * Check if an ID (order, task, etc.) is a duplicate
 */
export function isDuplicateId(id: string, options: DeduplicationOptions = {}): boolean {
  // Skip if deduplication is disabled
  if (!id || options.skip || process.env.SKIP_WORKFLOW_DEDUPLICATION === 'true') {
    return false;
  }

  const storage = options.storage || getDeduplicationStorage();
  const debug = options.debug ?? process.env.NODE_ENV === 'development';

  // Check if we've seen this ID before
  if (storage.processedIds.has(id)) {
    if (debug) {
      console.log(`[DEDUP] ID ${id} already processed`);
    }
    return true;
  }

  // Store the ID
  storage.processedIds.set(id, Date.now());

  if (debug) {
    console.log(`[DEDUP] Added ID ${id} to cache. Size: ${storage.processedIds.size}`);
  }

  // Cleanup old entries
  const ttl =
    options.ttl ||
    (process.env.NODE_ENV === 'development'
      ? DEDUPLICATION_TTL.development
      : DEDUPLICATION_TTL.production);
  cleanupExpiredEntries(storage.processedIds, ttl, debug);

  return false;
}

/**
 * Deduplication handler for workflows
 * Returns early if duplicate is detected
 */
export async function withDeduplication<T extends { orderId?: string }>(
  context: WorkflowContext<T>,
  handler: () => Promise<any>,
  options: DeduplicationOptions = {},
): Promise<any> {
  // Check for duplicate QStash message first
  if (isDuplicateMessage(context, options)) {
    return {
      messageId: getQStashHeaders(context).messageId,
      reason: 'duplicate_message',
      status: 'skipped',
    };
  }

  // Check for duplicate order/ID if present
  const orderId = context.requestPayload?.orderId;
  if (orderId && isDuplicateId(orderId, options)) {
    return {
      id: orderId,
      reason: 'duplicate_id',
      status: 'skipped',
    };
  }

  // Execute the handler
  return handler();
}

/**
 * Clear all deduplication caches (development only)
 */
export function clearDeduplicationCache(): void {
  if (process.env.NODE_ENV !== 'development') {
    throw new Error('Cache clearing is only available in development');
  }

  const storage = getDeduplicationStorage();
  storage.processedIds.clear();
  storage.processedMessageIds.clear();
  console.log('[DEDUP] Cleared all caches');
}
