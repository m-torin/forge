import { cryptoPolyfill } from './crypto-polyfill';
import { devLog } from './monitoring';
// Import from centralized modules
import { sleep } from './time';

// ===== Constants =====
const DEFAULT_POLL_INTERVAL = 2000;
const DEFAULT_POLL_TIMEOUT = 300000;

/**
 * Chunks an array into smaller arrays of specified size - ES2022 modernized
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  if (size <= 0) return [array];

  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Get last element of array using ES2022 .at() method
 */
export function getLastElement<T>(array: T[]): T | undefined {
  return array.at(-1);
}

/**
 * Get first element of array using ES2022 .at() method
 */
export function getFirstElement<T>(array: T[]): T | undefined {
  return array.at(0);
}

/**
 * Creates a deterministic hash of a URL for deduplication
 */
export function hashUrl(url: string): string {
  return cryptoPolyfill.createHash('md5').update(url).digest('hex');
}

// Re-export from centralized time module
export { calculateNextCronRun } from './time';

/**
 * Flexible backoff calculator supporting exponential and custom strategies
 */
export function calculateBackoff(
  attempt: number,
  options: {
    baseDelayMs?: number;
    maxDelayMs?: number;
    multiplier?: number;
    jitter?: boolean | number;
    strategy?: 'exponential' | 'linear' | 'constant';
  } = {},
): number {
  const {
    baseDelayMs = 1000,
    jitter = false,
    maxDelayMs = 30000,
    multiplier = 2,
    strategy = 'exponential',
  } = options;

  let delay: number;

  switch (strategy) {
    case 'exponential':
      delay = baseDelayMs * Math.pow(multiplier, attempt);
      break;
    case 'linear':
      delay = baseDelayMs * (attempt + 1);
      break;
    case 'constant':
      delay = baseDelayMs;
      break;
    default:
      delay = baseDelayMs * Math.pow(multiplier, attempt);
  }

  // Cap at maximum
  delay = Math.min(delay, maxDelayMs);

  // Add jitter if requested
  if (jitter) {
    const jitterAmount = typeof jitter === 'number' ? jitter : baseDelayMs * 0.5; // Default 50% of base
    delay += Math.random() * jitterAmount;
  }

  return Math.floor(delay);
}

/**
 * Extract data from HTML/JSON using selectors
 */
export function extractWithSelectors(
  content: string | object,
  selectors: Record<string, string>,
): Record<string, unknown> {
  // If content is already an object, use it directly
  if (typeof content === 'object') {
    const result: Record<string, unknown> = {};

    for (const [key, selector] of Object.entries(selectors)) {
      // Simple dot notation path extraction
      const value = selector.split('.').reduce((obj: any, key) => obj?.[key], content);
      if (value !== undefined) {
        result[key] = value;
      }
    }

    return result;
  }

  // For HTML content, you would use a library like cheerio
  // This is a placeholder implementation
  try {
    const parsed = JSON.parse(content);
    return extractWithSelectors(parsed, selectors);
  } catch {
    // If not JSON, return empty object
    // In production, implement HTML parsing with cheerio
    return {};
  }
}

// Re-export from centralized id-generation module
export { generateSessionId } from './id-generation';

// Re-export from centralized validation module
export { isValidUrl } from './validation';

// Re-export from centralized time module
export { sleep } from './time';

// ===== Date/Time Utilities =====
// Re-export from centralized time module
export {
  calculateElapsedTime,
  formatDuration,
  formatTimestamp,
  getTimeFromNow,
  parseTimeWindow,
} from './time';

// ===== URL/Domain Utilities =====

/**
 * Extract domain from URL
 */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url; // Return as-is if invalid
  }
}

/**
 * Normalize URL (remove trailing slashes, etc.)
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    // Remove trailing slash from pathname
    if (parsed.pathname.endsWith('/') && parsed.pathname !== '/') {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    return parsed.href;
  } catch {
    return url;
  }
}

// ===== Key/ID Generation =====

// Re-export from centralized id-generation module
export { generateKey } from './id-generation';

// Re-export from centralized id-generation module
export { generateUniqueId } from './id-generation';

// ===== Error Utilities =====

/**
 * Create a formatted error message
 */
export function createErrorMessage(operation: string, error: unknown): string {
  if (error instanceof Error) return `${operation}: ${error.message}`;
  return `${operation}: ${String(error)}`;
}

// Re-export from centralized monitoring module
export { classifyError } from './monitoring';

// Re-export from centralized monitoring module
export { isNetworkError, isRateLimitError, isTimeoutError } from './monitoring';

// ===== Type Guards and Validators =====
// Re-export from centralized validation module
export { hasOwnProperty, isNonEmptyString, isRecord } from './validation';

// ===== Polling Utilities =====

/**
 * Generic polling utility with resource cleanup - ES2022 modernized
 */
export async function pollUntilCondition<T>(
  operation: () => Promise<T>,
  condition: (result: T) => boolean,
  options: {
    intervalMs?: number;
    timeoutMs?: number;
    onPoll?: (result: T, attempt: number) => void;
  } = {},
): Promise<T> {
  const { intervalMs = DEFAULT_POLL_INTERVAL, onPoll, timeoutMs = DEFAULT_POLL_TIMEOUT } = options;

  const startTime = Date.now();
  let attempt = 0;

  while (Date.now() - startTime < timeoutMs) {
    const result = await operation();

    // Use optional chaining
    onPoll?.(result, attempt);

    if (condition(result)) {
      return result;
    }

    attempt++;
    await sleep(intervalMs);
  }

  // Enhanced error with cause
  throw new Error(`Polling timeout after ${timeoutMs}ms`, {
    cause: { attempts: attempt, duration: Date.now() - startTime },
  });
}

// ===== Environment Detection =====

// Re-export from centralized environment module
export { isDevelopment, isProduction } from './environment';

// ===== Result Type Guards =====

// Re-export from centralized results module
export { isErrorResult, isSuccessResult } from './results';

// ===== Map Utilities =====

/**
 * Clean up expired entries from a map based on timestamp
 */
export function cleanupExpiredEntries(map: Map<string, number>, ttl: number, debug = false): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [id, timestamp] of map.entries()) {
    if (now - timestamp > ttl) {
      map.delete(id);
      cleaned++;
    }
  }

  if (debug && cleaned > 0) {
    devLog.info(`[CLEANUP] Cleaned up ${cleaned} expired entries`);
  }
}

/**
 * Clean up oldest entries when map exceeds maximum size
 */
export function cleanupOldestEntries(
  map: Map<string, number>,
  maxEntries: number,
  debug = false,
): void {
  if (map.size <= maxEntries) {
    return;
  }

  // Sort entries by timestamp (oldest first)
  const entries = [...map.entries()].sort((a, b) => a[1] - b[1]);

  // Calculate how many entries to remove
  const removeCount = map.size - maxEntries;
  const toRemove = entries.slice(0, removeCount);

  // Remove oldest entries
  for (const [key] of toRemove) {
    map.delete(key);
  }

  if (debug) {
    devLog.info(`[CLEANUP] Removed ${removeCount} oldest entries to maintain size limit`);
  }
}

// ===== Validation Utilities =====

// Re-export from centralized validation module
export { extractPayload, validatePayload } from './validation';

// ===== State Machine Utilities =====

/**
 * Generic state machine for consistent state transitions
 */
export class StateMachine<TState extends string, TContext = any> {
  constructor(
    private state: TState,
    private transitions: Record<TState, Partial<Record<string, TState>>>,
    private context?: TContext,
  ) {}

  getState(): TState {
    return this.state;
  }

  getContext(): TContext | undefined {
    return this.context;
  }

  canTransition(event: string): boolean {
    const stateTransitions = this.transitions[this.state];
    return stateTransitions ? event in stateTransitions : false;
  }

  transition(event: string, newContext?: TContext): TState {
    const stateTransitions = this.transitions[this.state];
    if (!stateTransitions || !(event in stateTransitions)) {
      throw new Error(`Invalid transition: ${event} from state ${this.state}`);
    }

    this.state = stateTransitions[event]!;
    if (newContext !== undefined) {
      this.context = newContext;
    }

    return this.state;
  }

  reset(initialState: TState, initialContext?: TContext): void {
    this.state = initialState;
    this.context = initialContext;
  }
}

// ===== Additional DRY Consolidation Helpers =====

// Re-export from centralized environment module
export { isLocalQStash } from './environment';

/**
 * Build workflow URL with optional base URL
 */
export function buildWorkflowUrl(url: string, baseUrl?: string): string {
  if (url.startsWith('http')) {
    return normalizeUrl(url);
  }
  return normalizeUrl(`${baseUrl || ''}${url}`);
}

// Re-export from centralized time module (already imported above)

/**
 * Convert data to CSV format
 */
export function convertToCSV(data: any[]): string {
  if (!data.length) return '';

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',')
            ? `"${value.replace(/"/g, '""')}"`
            : value;
        })
        .join(','),
    ),
  ];

  return csvContent.join('\n');
}

/**
 * Convert data to XML format
 */
export function convertToXML(data: any[], rootElement = 'data'): string {
  const toXML = (obj: any, indent = ''): string => {
    return Object.entries(obj)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          return value
            .map((item) => `${indent}<${key}>${toXML(item, indent + '  ')}</${key}>`)
            .join('\n');
        }
        if (typeof value === 'object' && value !== null) {
          return `${indent}<${key}>\n${toXML(value, indent + '  ')}\n${indent}</${key}>`;
        }
        return `${indent}<${key}>${String(value)}</${key}>`;
      })
      .join('\n');
  };

  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootElement}>\n${data.map((item) => toXML(item, '  ')).join('\n')}\n</${rootElement}>`;
}

/**
 * Create QStash client with error handling
 */
export function createQStashClient(): { token: string } | null {
  const token = process.env.QSTASH_TOKEN;
  if (!token) {
    return null;
  }
  return { token };
}

/**
 * Build API endpoint URL with tenant ID
 */
export function buildApiEndpoint(base: string, tenantId: string, path: string): string {
  return `${base.replace(/\/$/, '')}/tenants/${tenantId}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Calculate success rate as formatted percentage
 */
export function calculateSuccessRate(successful: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((successful / total) * 100)}%`;
}

/**
 * Format a number as a percentage with specified decimal places
 */
export function formatPercentage(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Aggregate data by key with sum operation
 */
export function aggregateByKey<T>(
  data: T[],
  keyFn: (item: T) => string,
  valueFn: (item: T) => number,
): Record<string, number> {
  const result: Record<string, number> = {};

  for (const item of data) {
    const key = keyFn(item);
    result[key] = (result[key] || 0) + valueFn(item);
  }

  return result;
}

/**
 * Enhanced safe JSON parsing with optional validation
 */
export function safeJsonParseWithValidation<T>(
  str: string | null | undefined,
  fallback: T,
  validator?: (data: any) => data is T,
): T {
  if (!str) return fallback;

  try {
    const parsed = JSON.parse(str);
    if (validator && !validator(parsed)) {
      return fallback;
    }
    return parsed;
  } catch {
    return fallback;
  }
}
